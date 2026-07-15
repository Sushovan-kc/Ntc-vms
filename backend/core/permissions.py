from rest_framework import permissions
from profile.models import Profile 

class IsSuperAdmin(permissions.BasePermission):
    message = 'Super admin access required.'

    def has_permission(self, request, view):
        user = request.user
        
        # 1. FIXED: Always check authentication FIRST to eliminate AnonymousUser crashes
        if not user or not user.is_authenticated:
            return False

        # 2. Safely authorize master command-line superusers
        if user.is_superuser:
            return True

        # 3. Fall back to checking your custom Profile tables
        profile = getattr(user, 'profile', None)
        return (
            profile is not None
            and getattr(profile, 'role', None) == Profile.ROLE.SUPERADMIN
            and getattr(profile, 'role_approved', False)
        )
    
class IsBranchAdmin(permissions.BasePermission):
    message = 'Branch admin access required.'

    def has_permission(self, request, view):
        user = request.user
        
        # 1. Always check authentication FIRST to eliminate AnonymousUser crashes
        if not user or not user.is_authenticated:
            return False

        # 2. Safely authorize master command-line superusers
        if user.is_superuser:
            return True

        # 3. Fall back to checking your custom Profile tables
        profile = getattr(user, 'profile', None)
        return (
            profile is not None
            and getattr(profile, 'role', None) == Profile.ROLE.ADMIN
            and getattr(profile, 'role_approved', False)
        )


class IsDriver(permissions.BasePermission):
    message = 'Driver access required.'

    def has_permission(self, request, view):
        user = request.user
        
        # 1. Always check authentication FIRST to eliminate AnonymousUser crashes
        if not user or not user.is_authenticated:
            return False

        # 2. Safely authorize master command-line superusers
        if user.is_superuser:
            return True

        # 3. Fall back to checking your custom Profile tables
        profile = getattr(user, 'profile', None)
        return (
            profile is not None
            and getattr(profile, 'role', None) == Profile.ROLE.DRIVER
            and getattr(profile, 'role_approved', False)
        )
    
class IsDriverOrBranchAdmin(permissions.BasePermission):
    message = 'Driver or Branch admin access required.'

    def has_permission(self, request, view):
        user = request.user
        
        # 1. Always check authentication FIRST to eliminate AnonymousUser crashes
        if not user or not user.is_authenticated:
            return False

        # 2. Safely authorize master command-line superusers
        if user.is_superuser:
            return True

        # 3. Fall back to checking your custom Profile tables
        profile = getattr(user, 'profile', None)
        return (
            profile is not None
            and getattr(profile, 'role_approved', False)
            and getattr(profile, 'role', None) in [Profile.ROLE.DRIVER, Profile.ROLE.ADMIN]
        )
    



class IsDriverOfVehicleInfo(permissions.BasePermission):
    message = 'Driver of the vehicle access required.'

    def has_permission(self, request, view):
        # Always check authentication first
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        # Safely authorize master superusers
        if request.user.is_superuser:
            return True
            
        profile = getattr(request.user, 'profile', None)
        if not profile:
            return False
        driver_profile = getattr(profile, 'driver_profile', None)
        if not driver_profile:
            return False
            
        # 1. Access the related vehicle via the One-to-One relationship
        # Change 'vehicle' to match your actual related_name if defined differently
        vehicle = getattr(obj, 'vehicle', None) 
        if not vehicle:
            return False
        
        assigned_driver = getattr(vehicle, 'current_driver', None)

        # 2. Compare the driver IDs
        return assigned_driver == driver_profile