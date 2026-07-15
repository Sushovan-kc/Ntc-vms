from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Profile
from driver.models import DriverProfile as Driver
from django.contrib.auth.models import User


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """Signal to automatically create a Profile instance whenever a new User is created."""
    if created:
        default_role = Profile.ROLE.SUPERADMIN if instance.is_superuser else Profile.ROLE.NOT_ASSIGNED
        
        Profile.objects.get_or_create(
            user=instance,
            defaults={
                'role': default_role,
                'role_approved': instance.is_superuser 
            }
        )

@receiver(post_save, sender=Profile)
def sync_driver_profile(sender, instance, created, **kwargs):
    """Signal to manage a Driver table record mirroring the Profile's validation criteria."""
    
    # Check if the role is a Driver and it has received Admin approval status
    if instance.role == Profile.ROLE.DRIVER and instance.role_approved:
        print(f"-> Verification Check MET: Syncing driver record container for Profile ID #{instance.id}")
        
        # 🔑 FIX: Hop from the Profile model instance up to the referenced User model account object
        core_user_account = instance
        
        # Safely extract or build the record using defaults to leave target unique fields empty (NULL)
        driver_record, record_created = Driver.objects.get_or_create(
            user=core_user_account,
            defaults={
                'license_number': None,  # 🔑 Critical: Leaves unique constraints intact for Postgres
                'license_image': None,
                'is_profile_completed': False,
                'branch':core_user_account.branch if hasattr(core_user_account, 'branch') else None,
                'driver_status': 'PENDING'
            }
        )
        
        if record_created:
            print(f"Success: Brand new blank unique Driver row instantiated for user: {core_user_account.user.username}")
        else:
            print(f"Info: Driver entry already existed for user: {core_user_account.user.username}. No action taken.")
            
    else:
        print(f"-> Verification Criteria FAILED or Revoked: Cleaning up Driver allocation maps for Profile ID #{instance.id}")
        
        # Safely isolate and delete the linked model tracking record if the role is changed or unapproved
        if hasattr(instance, 'user') and instance.user:
            deleted_count, _ = Driver.objects.filter(user=instance.user).delete()
            if deleted_count > 0:
                print(f"Cleaned: Successfully purged active operational Driver row for user: {instance.user.username}")