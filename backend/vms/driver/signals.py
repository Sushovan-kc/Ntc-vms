from django.dispatch import receiver
from django.db.models.signals import post_delete
from .models import Booking
from .models import Dispatches,DispatchRecord

@receiver(post_delete, sender=Dispatches)
def create_dispatchrecord(sender, instance, created, **kwargs):
    """Signal to create a Dispatch record when a Booking is approved."""
    # if instance.status == Booking.BookingStatus.APPROVED and instance.assigned_driver and instance.assigned_vehicle:
    #     # Check if a dispatch already exists for this booking to avoid duplicates
    #     if not Dispatches.objects.filter(booking=instance).exists():
    #         Dispatches.objects.create(
    #             driver=instance.assigned_driver,
    #             vehicle=instance.assigned_vehicle,
    #             booking=instance
    #         )
    

    