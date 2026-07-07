# driver/signals.py
from django.db.models.signals import pre_delete
from django.dispatch import receiver
from .models import Dispatches, DispatchRecord

# @receiver(pre_delete, sender=Dispatches)
# def archive_completed_dispatch(sender, instance, **kwargs):
#     """
#     Triggers automatically right before instance.delete() executes.
#     """
#     if instance.dispatch_status in [Dispatches.DispatchStatusChoices.COMPLETED, Dispatches.DispatchStatusChoices.CANCELLED]:
#         try:
#             # Look for the active en-route tracking record to update its final status
#             record = DispatchRecord.objects.get(booking=instance.booking, dispatch_status='IN_PROGRESS')
#             record.dispatch_status = instance.dispatch_status
#             record.save()
#         except DispatchRecord.DoesNotExist:
#             # Fallback: Create a new historical log entry if none existed
#             DispatchRecord.objects.create(
#                 dispatch_status=instance.dispatch_status,
#                 driver=instance.driver,
#                 vehicle=instance.vehicle,
#                 booking=instance.booking
#             )
