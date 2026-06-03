from django.db import models
from django.core.exceptions import ValidationError
from profile.models import Profile

# Create your models here.

class DriverProfile(models.Model):

    class choices(models.TextChoices):
        AVAILABLE = 'AVAILABLE', 'Available'
        UNAVAILABLE = 'UNAVAILABLE', 'Unavailable'
        ON_TRIP = 'ON_TRIP', 'On Trip'
        
    user = models.OneToOneField('profile.Profile', on_delete=models.CASCADE, related_name='driver_profile')
    license_number = models.CharField(max_length=20)
    license_image = models.ImageField(upload_to='driver_licenses/')
    address = models.TextField()
    driver_status = models.CharField(max_length=20, choices=choices.choices, default=choices.AVAILABLE)
    branch = models.ForeignKey('branch.Branch', on_delete=models.SET_NULL, null=True, blank=True)
    def __str__(self):
        return f"{self.user.user.username}"


# class Dispatches(models.Model):
#     driver = models.ForeignKey(DriverProfile, on_delete=models.CASCADE, related_name='dispatches')
#     vehicle = models.ForeignKey('fleet.Vehicle', on_delete=models.CASCADE)
#     booking=models.ForeignKey('bookings.Booking', on_delete=models.CASCADE)