from rest_framework import serializers
from .models import Booking
from django.core.exceptions import ObjectDoesNotExist

class BookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = ['id', 'user', 'vehicle', 'start_time', 'end_time', 'purpose', 'status', 'created_at', 'start_location', 'end_location', 'approved_by', 'assigned_vehicle', 'assigned_driver']
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

        # 1. Update the status using standard validated data
        instance.status = validated_data.get('status', instance.status)

        # 2. Assign read-only fields DIRECTLY to the instance instead of validated_data
        if instance.status == Booking.BookingStatus.APPROVED:
            instance.approved_by = admin_user
            
            # if instance.vehicle:
            #     instance.assigned_vehicle = instance.vehicle
                
            #     # Check if the vehicle actually has a driver assigned in the database
            #     if instance.vehicle.current_driver:
            #         instance.assigned_driver = instance.vehicle.current_driver
            #     else:
            #         # Throw an error if you want to prevent approval of driverless vehicles
            #         raise serializers.ValidationError(
            #             {"status": f"The vehicle '{instance.vehicle}' has no driver assigned to it in the system."}
            #         )
            # else:
            #     raise serializers.ValidationError(
            #         {"status": "Cannot approve booking because no vehicle is attached to this request."}
            #     )
            if validated_data.get('assigned_vehicle') is None and instance.vehicle is not None:
                instance.assigned_vehicle = instance.vehicle
                instance.assigned_driver = instance.vehicle.current_driver

                
        # 3. Save the instance directly to force the database update
        instance.save()
        return instance

    