from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

class Profile(models.Model):

    class ROLE(models.TextChoices):
        SUPERADMIN = 'super admin', 'Super Admin'
        ADMIN = 'admin', 'Admin'
        EMPLOYEE = 'employee', 'Employee'
        DRIVER = 'driver', 'Driver'
        NOT_ASSIGNED = 'not assigned', 'Not Assigned'

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=ROLE.choices, default=ROLE.NOT_ASSIGNED)
    role_approved = models.BooleanField(default=False)
    phone_number = models.CharField(max_length=10, blank=True, null=True)
    branch = models.ForeignKey('branch.Branch', on_delete=models.SET_NULL, null=True, blank=True)
    
    # FIX: Uses __in to allow multiple roles to approve profiles
    approved_by = models.ForeignKey(
        'self', on_delete=models.SET_NULL, null=True, blank=True, 
        related_name='approved_profiles',
        limit_choices_to={'role__in': [ROLE.SUPERADMIN, ROLE.ADMIN]}
    )

    def __str__(self):
        return f"{self.user.username} - {self.role}"
    
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        default_role = Profile.ROLE.SUPERADMIN if instance.is_superuser else Profile.ROLE.NOT_ASSIGNED
        
        Profile.objects.get_or_create(
            user=instance,
            defaults={
                'role': default_role,
                'role_approved': instance.is_superuser 
            }
        )
