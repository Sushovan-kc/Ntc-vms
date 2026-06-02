from rest_framework import serializers
from .models import Profile
from django.contrib.auth.models import User
from django.db import transaction

class UserRegistrationSerializer(serializers.ModelSerializer):
    # Capture frontend user details
    password = serializers.CharField(write_only=True, min_length=8)
    email = serializers.EmailField(required=True)
    
    # Capture custom profile details
    requested_role = serializers.ChoiceField(choices=Profile.ROLE.choices, default=Profile.ROLE.NOT_ASSIGNED)
    phone_number = serializers.CharField(max_length=10, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name', 'requested_role', 'phone_number']

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with that username already exists.")
        return value

    def create(self, validated_data):
        # Extract profile fields so they aren't passed to the core User model
        requested_role = validated_data.pop('requested_role', Profile.ROLE.NOT_ASSIGNED)
        phone_number = validated_data.pop('phone_number', '')

        # Use an atomic transaction block so if either step fails, everything rolls back safely
        with transaction.atomic():
            # 1. Create and hash password for the core Django User.
            # This line will IMMEDIATELY fire your post_save signal and create a blank profile.
            user = User.objects.create_user(
                username=validated_data['username'],
                email=validated_data['email'],
                password=validated_data['password'],
                first_name=validated_data.get('first_name', ''),
                last_name=validated_data.get('last_name', '')
            )
            
            # 2. MODIFY: Instead of .create(), update the profile already built by the signal.
            # This protects your database from unique constraint conflicts.
            Profile.objects.filter(user=user).update(
                phone_number=phone_number,
                role=requested_role,
                role_approved=False
            )
            
        return user
    

class userProfileSerializer(serializers.ModelSerializer):
    username=serializers.ReadOnlyField(source='user.username')
    approved_by=serializers.ReadOnlyField(source='approved_by.user.username')
    class Meta:
        model = Profile
        fields = ['user','username', 'role', 'role_approved', 'phone_number', 'branch', 'approved_by']
