from django.core.cache import cache


from django.db import models
from django.core.exceptions import ValidationError
from profile.models import Profile

# Create your models here.

class DriverProfile(models.Model):

    class DriverStatusChoices(models.TextChoices):
        AVAILABLE = 'AVAILABLE', 'Available'
        UNAVAILABLE = 'UNAVAILABLE', 'Unavailable'
        ON_TRIP = 'ON_TRIP', 'On Trip'
        
    user = models.OneToOneField('profile.Profile', on_delete=models.CASCADE, related_name='driver_profile')
    license_number = models.CharField(max_length=20, unique=True)
    license_image = models.ImageField(upload_to='driver_licenses/')
    address = models.TextField()
    driver_status = models.CharField(max_length=20, choices=DriverStatusChoices.choices, default=DriverStatusChoices.AVAILABLE)
    branch = models.ForeignKey('branch.Branch', on_delete=models.SET_NULL, null=True, blank=True)

    
    def __str__(self):
        # Optimized to avoid double-join database hits if Profile holds identifying strings
        return f"Driver: {self.user.user.username} - {self.driver_status}"
    
    def save(self, *args, **kwargs):

        if self.license_number is '':
            self.license_number="Not uploaded"
        if self.user.branch is not None:
            self.branch = self.user.branch
        else:
            self.branch=None
        super().save(*args, **kwargs)


class Dispatches(models.Model):

    class DispatchStatusChoices(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        IN_PROGRESS = 'IN_PROGRESS', 'In Progress'
        COMPLETED = 'COMPLETED', 'Completed'
        CANCELLED = 'CANCELLED', 'Cancelled'
    dispatch_status = models.CharField(max_length=20, choices=DispatchStatusChoices.choices, default=DispatchStatusChoices.PENDING)
    driver = models.ForeignKey(DriverProfile, on_delete=models.CASCADE, related_name='dispatches',null=True, blank=True)
    vehicle = models.ForeignKey('fleet.Vehicle', on_delete=models.CASCADE)
    booking=models.ForeignKey('bookings.Booking', on_delete=models.CASCADE)


    def save(self, *args, **kwargs):
        # 1. Handle Redis sync operations *before* deleting completed/cancelled objects
        # We fetch the primary key string or integer of the related vehicle object
        cache_key = f"active_driver_trip:{self.driver_id}"

        if self.dispatch_status == self.DispatchStatusChoices.IN_PROGRESS:
            # Activate tracking state instantly in Redis memory
            cache.set(cache_key,  {
                "dispatch_id": self.id, 
                "booking_id": self.booking_id,
                "vehicle_id": self.vehicle_id
            }, timeout=None)
            
            # Ensure an active DispatchRecord exists so telemetry can be appended
            DispatchRecord.objects.get_or_create(
                booking=self.booking,
                dispatch_status=self.DispatchStatusChoices.IN_PROGRESS,
                defaults={
                    'driver': self.driver,
                    'vehicle': self.vehicle
                }
            )
        else:
            # If changed to PENDING, COMPLETED, or CANCELLED, remove tracking keys immediately
            cache.delete(cache_key)


        if self.dispatch_status == self.DispatchStatusChoices.COMPLETED or self.dispatch_status == self.DispatchStatusChoices.CANCELLED:
            # Mark the persistent DispatchRecord archive row with the final status
            try:
                record = DispatchRecord.objects.get(
                    booking=self.booking,
                    dispatch_status=self.DispatchStatusChoices.IN_PROGRESS
                )
                record.dispatch_status = self.dispatch_status
                record.save(update_fields=['dispatch_status'])

                # Fire the async Celery task to calculate and persist distance
                from .tasks import compute_and_save_distance
                compute_and_save_distance.delay(record.pk)
            except DispatchRecord.DoesNotExist:
                pass

            if self.pk:
                self.delete()
            return
        super().save(*args, **kwargs)



class DispatchRecord(models.Model):
    class DispatchStatusChoices(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        IN_PROGRESS = 'IN_PROGRESS', 'In Progress'
        COMPLETED = 'COMPLETED', 'Completed'
        CANCELLED = 'CANCELLED', 'Cancelled'
        
    dispatch_status = models.CharField(max_length=20, choices=DispatchStatusChoices.choices, default=DispatchStatusChoices.PENDING)
    driver = models.ForeignKey(DriverProfile, on_delete=models.CASCADE, related_name='dispatchrecord',null=True, blank=True)
    vehicle = models.ForeignKey('fleet.Vehicle', on_delete=models.CASCADE)
    booking=models.ForeignKey('bookings.Booking', on_delete=models.CASCADE)
    route_history = models.JSONField(default=list, blank=True)
    distance_traveled_km = models.FloatField(default=0.0, blank=True)