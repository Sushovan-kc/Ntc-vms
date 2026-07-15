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
        
        # ✅ FIX 1: The 'instance' itself IS the Profile. Use it directly.
        profile_instance = instance 

        # Safely extract or build the record using defaults
        driver_record, record_created = Driver.objects.get_or_create(
            user=profile_instance,  # Passes the Profile instance directly
            defaults={
                'license_number': None, # Leaves unique constraints intact for Postgres
                'license_image': None,
                'is_profile_completed': False,
                'branch': profile_instance.branch if hasattr(profile_instance, 'branch') else None,
                'driver_status': 'PENDING'
            }
        )
        
        if record_created:
            # Safely log using the nested user account username link
            print(f"Success: Brand new blank unique Driver row instantiated for user: {profile_instance.user.username}")
        else:
            print(f"Info: Driver entry already existed for user: {profile_instance.user.username}. No action taken.")
            
    else:
        print(f"-> Verification Criteria FAILED or Revoked: Cleaning up Driver allocation maps for Profile ID #{instance.id}")
        
        # ✅ FIX 2: Change filter(user=instance.user) to filter(user=instance) to match the Profile FK constraint
        deleted_count, _ = Driver.objects.filter(user=instance).delete()
        if deleted_count > 0:
            print(f"Cleaned: Successfully purged active operational Driver row for profile ID: #{instance.id}")
