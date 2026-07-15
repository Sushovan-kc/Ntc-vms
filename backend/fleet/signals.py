from django.dispatch import receiver
from django.db.models.signals import post_save
from .models import Vehicle,VehicleInfo

@receiver(post_save, sender=Vehicle)
def create_vehicle_info(sender, instance, created, **kwargs):
    """Signal to create a VehicleInfo record when a Vehicle is created."""
    if created:
        VehicleInfo.objects.create(vehicle=instance, engine_type='', mileage=0, kilometers_driven=0, last_fuel_date=None, last_service_date=None)
