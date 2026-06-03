from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Profile
from driver.models import DriverProfile as Driver

@receiver(post_save, sender=Profile)
def sync_driver_profile(sender, instance, created, **kwargs):
    # TEMPORARY DEBUG PRINTS: Look at your terminal console when saving a user!
    print("====== SIGNAL TRIGGERED ======")
    print(f"User: {instance.user.username}")
    print(f"Current Role in DB: '{instance.role}'")
    print(f"Is Role Approved: {instance.role_approved}")
    
    if instance.role == Profile.ROLE.DRIVER and instance.role_approved:
        print("-> Condition MET: Creating/Getting Driver row.")
        Driver.objects.get_or_create(user=instance)
    else:
        print("-> Condition FAILED: Deleting Driver row if it exists.")
        Driver.objects.filter(user=instance).delete()