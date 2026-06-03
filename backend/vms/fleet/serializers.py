import re
from rest_framework import serializers
from .models import Vehicle



class VehicleSerializer(serializers.ModelSerializer):
    vehicle_type = serializers.ReadOnlyField(source='vehicle_choice')

    class Meta:
        model = Vehicle
        fields = ('id', 'manufacturer', 'model', 'year', 'license_plate', 'approval_status', 'vehicle_type', 'branch')

    def validate_license_plate(self, value):
        # 1. Strip whitespace from edges and convert to uppercase
        cleaned_value = value.strip().upper()
        
        # 2. Collapse multiple spaces inside the string down to a single space
        cleaned_value = re.sub(r'\s+', ' ', cleaned_value)
        
        # 3. Return the normalized text
        return cleaned_value
    
class VehicleListUpdateSerializer(serializers.ModelSerializer):

    class Meta:
        model = Vehicle
        fields = ('id', 'manufacturer', 'model', 'year', 'license_plate', 'approval_status', 'branch')