from rest_framework import serializers
from .models import Profile
from django.contrib.auth.models import User
from django.db import transaction


class AdminUserProfileManagementSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', required=False)
    email = serializers.EmailField(source='user.email', required=False)
    first_name = serializers.CharField(source='user.first_name', allow_blank=True, required=False)
    last_name = serializers.CharField(source='user.last_name', allow_blank=True, required=False)
    approved_by_name = serializers.ReadOnlyField(source='approved_by.user.username')

    class Meta:
        model = Profile
        fields = [
            'id', 'user', 'username', 'email', 'first_name', 'last_name', 
            'role', 'role_approved', 'phone_number', 'branch', 
            'approved_by', 'approved_by_name'
        ]
        read_only_fields = ['id', 'user', 'approved_by']

    def update(self, instance, validated_data):
        # Extract the nested user data dictionary if present
        user_data = validated_data.pop('user', None)
        
        with transaction.atomic():
            # 1. Update only the core User fields that were sent in the request
            if user_data:
                user_instance = instance.user
                if 'username' in user_data:
                    user_instance.username = user_data['username']
                if 'email' in user_data:
                    user_instance.email = user_data['email']
                if 'first_name' in user_data:
                    user_instance.first_name = user_data['first_name']
                if 'last_name' in user_data:
                    user_instance.last_name = user_data['last_name']
                user_instance.save()
            
            # 2. Track which admin is approving this profile on the fly
            request = self.context.get('request')
            if validated_data.get('role_approved') is True and not instance.role_approved:
                if request and request.user:
                    admin_profile = getattr(request.user, 'profile', None)
                    validated_data['approved_by'] = admin_profile

            # 3. Update only the Profile fields that were sent in the request
            instance = super().update(instance, validated_data)
            
        return instance