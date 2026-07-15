import re
from rest_framework import serializers
from .models import Vehicle, VehicleInfo
from driver.models import DriverProfile


class VehicleSerializer(serializers.ModelSerializer):
    vehicle_type = serializers.ReadOnlyField(source='vehicle_choice')
    branch=serializers.PrimaryKeyRelatedField(read_only=True)
  

    class Meta:
        model = Vehicle
        fields = ('id', 'manufacturer', 'model', 'year', 'license_plate', 'approval_status', 'vehicle_type', 'branch','current_driver')

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
        # Extract the request from context to see who is logged in
        request = self.context.get('request')
        if request and hasattr(request.user, 'profile') and request.user.profile.branch:
            admin_branch = request.user.profile.branch
            
            # Dynamically filter the dropdown to show ONLY available drivers inside the admin's branch
            self.fields['current_driver'].queryset = DriverProfile.objects.filter(
                driver_status=DriverProfile.DriverStatusChoices.AVAILABLE,
                branch=admin_branch
            )

    def validate_license_plate(self, value):
        # 1. Strip whitespace from edges and convert to uppercase
        cleaned_value = value.strip().upper()
        
        # 2. Collapse multiple spaces inside the string down to a single space
        cleaned_value = re.sub(r'\s+', ' ', cleaned_value)
        
        # 3. Return the normalized text
        return cleaned_value
    
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        
        # Pull details from the related user object securely if it exists
        if instance.current_driver:
            representation['current_driver'] = instance.current_driver.user.user.username if instance.current_driver else None
        if instance.branch:
            representation['branch'] = instance.branch.name if instance.branch else None
            
        return representation
        
    
class VehicleListUpdateSerializer(serializers.ModelSerializer):

    current_driver = serializers.PrimaryKeyRelatedField(source='current_driver.name', read_only=True)
    class Meta:
        model = Vehicle
        fields = ('id', 'manufacturer', 'model', 'year', 'license_plate', 'approval_status', 'branch', 'current_driver')

class AssignDriverSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehicle
        # Include all fields you want to show in the API response
        fields = [
            'id', 'manufacturer', 'model', 'year', 
            'license_plate', 'approval_status', 
         'branch', 'current_driver'
        ]
        # Make everything read-only except 'current_driver'
        read_only_fields = [
            'id', 'manufacturer', 'model', 'year', 
            'license_plate', 'approval_status', 'branch'
        ]

    def validate_current_driver(self, value):
        # If the request is clearing the driver (setting to null), allow it
        if value is None:
            return value

        # Check if this driver is already assigned to a different vehicle
        vehicle_instance = self.instance
        existing_vehicle = Vehicle.objects.filter(current_driver=value).exclude(pk=vehicle_instance.pk).first()
        
        if existing_vehicle:
            raise serializers.ValidationError(
                f"This driver is already assigned to another vehicle ({existing_vehicle.manufacturer} {existing_vehicle.model})."
            )
            
        return value
    
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        
        # Pull details from the related user object securely if it exists
        if instance.current_driver:
            representation['current_driver'] = instance.current_driver.user.user.username
            
        return representation
    

class VehicleInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = VehicleInfo
        fields = [
            'id', 'vehicle', 'engine_type', 'mileage', 
            'kilometers_driven', 'last_fuel_date', 'last_service_date'
        ]
        read_only_fields = ['id', 'vehicle', 'engine_type']

    def validate(self, attrs):
        instance = self.instance

        # Validation only runs during updates when an existing database instance exists
        if instance:
            # 1. KILOMETERS DRIVEN VALIDATION
            incoming_km = attrs.get('kilometers_driven')
            existing_km = getattr(instance, 'kilometers_driven', None)
            
            if incoming_km is not None and existing_km is not None:
                if incoming_km < existing_km:
                    raise serializers.ValidationError({
                        "kilometers_driven": f"Kilometers driven cannot be less than the current record of {existing_km} km."
                    })

            # 2. FUEL DATE VALIDATION
            incoming_fuel_date = attrs.get('last_fuel_date')
            existing_fuel_date = getattr(instance, 'last_fuel_date', None)
            
            if incoming_fuel_date is not None and existing_fuel_date is not None:
                if incoming_fuel_date < existing_fuel_date:
                    raise serializers.ValidationError({
                        "last_fuel_date": "Last fuel date cannot be earlier than the previous recorded fuel date."
                    })

            # 3. SERVICE DATE VALIDATION
            incoming_service_date = attrs.get('last_service_date')
            existing_service_date = getattr(instance, 'last_service_date', None)
            
            if incoming_service_date is not None and existing_service_date is not None:
                if incoming_service_date < existing_service_date:
                    raise serializers.ValidationError({
                        "last_service_date": "Last service date cannot be earlier than the previous recorded service date."
                    })

        return attrs
        