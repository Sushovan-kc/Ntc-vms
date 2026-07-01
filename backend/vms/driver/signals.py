# driver/signals.py
from django.db.models.signals import pre_delete
from django.dispatch import receiver
from .models import Dispatches, DispatchRecord

@receiver(pre_delete, sender=Dispatches)
def archive_completed_dispatch(sender, instance, **kwargs):
    """
    Triggers automatically right before instance.delete() executes.
    """
    if instance.dispatch_status in [Dispatches.DispatchStatusChoices.COMPLETED, Dispatches.DispatchStatusChoices.CANCELLED]:
        
        # Create the historical log entry including the booking field
        DispatchRecord.objects.create(
            dispatch_status=instance.dispatch_status,
            driver=instance.driver,
            vehicle=instance.vehicle,
            booking=instance.booking  # <-- Add this line to satisfy the database constraint
        )
