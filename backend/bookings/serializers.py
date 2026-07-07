from rest_framework import serializers
from .models import Booking
from django.core.exceptions import ObjectDoesNotExist

class BookingSerializer(serializers.ModelSerializer):
    vehicle_manufacturer=serializers.CharField(source='vehicle.manufacturer', read_only=True)
    vehicle_model=serializers.CharField(source='vehicle.model', read_only=True)
    class Meta:
        model = Booking
        fields = ['id', 'user', 'vehicle_manufacturer', 'vehicle_model', 'start_time', 'end_time', 'purpose', 'status', 'created_at', 'start_location', 'end_location', 'approved_by', 'assigned_vehicle', 'assigned_driver']
        read_only_fields = ['id','user','status', 'created_at', 'approved_by', 'assigned_vehicle', 'assigned_driver']
        extra_kwargs = {
            'vehicle': {'required': False, 'allow_null': True},
        }

    def create(self, validated_data):
        request = self.context.get('request')
        user = request.user

        # Fetch the branch from user profile (your existing code logic)
        user_branch = user.profile.branch 

        # ... your existing matching verification logic ...

        # AUTOMATICALLY BIND THE BRANCH TO THE BOOKING FIELD
        validated_data['user'] = user
        validated_data['branch'] = user_branch  # <-- This locks it into the database column
        
        return super().create(validated_data)
    
    def to_representation(self, instance):
        representation = super().to_representation(instance)

        if instance.user:
            representation['user'] = instance.user.username
        return representation


class BookingApprovalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = ['id', 'status', 'approved_by', 'vehicle', 'assigned_vehicle', 'assigned_driver']
        read_only_fields = ['id', 'approved_by', 'vehicle']

    def update(self, instance, validated_data):
        request = self.context.get('request')
        if not request or not request.user:
            raise serializers.ValidationError("Admin authentication required.")
            
        admin_user = request.user

        # 1. Dynamically apply ALL validated data (fixes assigned_vehicle not updating)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        # 2. Run your status conditional overrides
        if instance.status == Booking.BookingStatus.APPROVED:
            instance.approved_by = admin_user
        elif instance.status == Booking.BookingStatus.PENDING:
            instance.approved_by = None
            
            # Auto-assign driver from the base vehicle if not manually provided
            if not validated_data.get('assigned_driver') and instance.vehicle:
                instance.assigned_driver = instance.vehicle.current_driver

        # 3. Commit changes to the database
        instance.save()
        return instance
