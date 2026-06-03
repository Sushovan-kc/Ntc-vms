from django.db import models


# Create your models here.

class Vehicle(models.Model):

    class status(models.TextChoices):
        AVAILABLE = 'AVAILABLE', 'Available'
        IN_USE = 'IN_USE', 'In Use'
        MAINTENANCE = 'MAINTENANCE', 'Under Maintenance'
        DECOMMISSIONED = 'DECOMMISSIONED', 'Decommissioned'
    manufacturer = models.CharField(max_length=100)
    model = models.CharField(max_length=100)
    year = models.IntegerField()
    license_plate = models.CharField(max_length=20, unique=True)
    approval_status = models.CharField(max_length=20, choices=status.choices, default=status.AVAILABLE)
    created_at = models.DateTimeField(auto_now_add=True)
    branch = models.ForeignKey('branch.Branch', on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"{self.manufacturer} {self.model} ({self.license_plate})"
    
class VehicleInfo(models.Model):
    class EngineType(models.TextChoices):
        PETROL = 'PETROL', 'Petrol'
        DIESEL = 'DIESEL', 'Diesel'
        ELECTRIC = 'ELECTRIC', 'Electric'
        HYBRID = 'HYBRID', 'Hybrid'

    vehicle = models.OneToOneField(Vehicle, on_delete=models.CASCADE, related_name='info')
    engine_type = models.CharField(max_length=20, choices=EngineType.choices, blank=True, null=True)
    # current_driver =models.OneToOneField('driver.DriverProfile', on_delete=models.SET_NULL, null=True, blank=True, related_name='AssignedVehicle')
    mileage = models.PositiveIntegerField(blank=True, null=True)
    kilometers_driven = models.PositiveIntegerField(blank=True, null=True)
    last_fuel_date = models.DateField(blank=True, null=True)
    last_service_date = models.DateField(blank=True, null=True)