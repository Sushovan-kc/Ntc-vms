from rest_framework import serializers
from .models import Profile
from django.contrib.auth.models import User
from django.db import transaction
from rest_framework.exceptions import ValidationError


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

    def validate(self, data):
        """Prevents duplicate usernames or emails during creation and updates."""
        user_data = data.get('user', {})
        current_user = self.instance.user if self.instance else None

        if 'username' in user_data:
            username = user_data['username']
            if User.objects.filter(username=username).exclude(id=current_user.id if current_user else None).exists():
                raise ValidationError({'username': 'This username is already taken.'})

        if 'email' in user_data:
            email = user_data['email']
            if User.objects.filter(email=email).exclude(id=current_user.id if current_user else None).exists():
                raise ValidationError({'email': 'This email is already taken.'})
        return data
    

    def create(self, validated_data):
        """Handles admin-side creation (POST) of both User and Profile records."""
        user_data = validated_data.pop('user', {})
        username = user_data.get('username')
        email = user_data.get('email')

        if not username or not email:
            raise serializers.ValidationError({"user": "Username and email fields are required."})

        request = self.context.get('request')

        with transaction.atomic():
            # Create core Django user with a randomized secure temporary password
            random_password = User.objects.make_random_password()
            user_instance = User.objects.create_user(
                username=username,
                email=email,
                first_name=user_data.get('first_name', ''),
                last_name=user_data.get('last_name', ''),
                password=random_password
            )

            # Auto-assign approving admin if pre-approved
            if validated_data.get('role_approved') is True and request and request.user:
                validated_data['approved_by'] = getattr(request.user, 'profile', None)

            # Create Profile record linked to the new user
            profile_instance = Profile.objects.create(user=user_instance, **validated_data)
            
        return profile_instance

    def update(self, instance, validated_data):
        """Handles partial or full updates (PUT/PATCH) safely."""
        user_data = validated_data.pop('user', None)
        
        with transaction.atomic():
            # Update only provided User fields
            if user_data:
                user_instance = instance.user
                for attr, value in user_data.items():
                    setattr(user_instance, attr, value)
                user_instance.save()
            
            # Track profile approvals dynamically
            request = self.context.get('request')
            if validated_data.get('role_approved') is True and not instance.role_approved:
                if request and request.user:
                    validated_data['approved_by'] = getattr(request.user, 'profile', None)

            # Update Profile fields
            instance = super().update(instance, validated_data)
            
        return instance
    
    