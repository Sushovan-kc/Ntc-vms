from rest_framework.filters import BaseFilterBackend

class BranchFilterBackend(BaseFilterBackend):
    def filter_queryset(self, request, queryset, view):
        user = request.user
        
        # 1. Block unauthenticated users immediately
        if not user or not user.is_authenticated:
            return queryset.none()
            
        # 2. Superadmins see everything across the system
        if user.is_superuser or (hasattr(user, 'profile') and user.profile.role == 'super admin'):
            return queryset

        # 3. Handle Branch Admin Filtering
        if hasattr(user, 'profile') and user.profile.role == 'admin':
            user_branch = user.profile.branch
            if user_branch is not None:
                # Fallback field name to check
                default_field = 'branch'
                
                # SMART REPAIR: If filtering VehicleInfo, look through the vehicle relation
                if queryset.model.__name__ == 'VehicleInfo':
                    default_field = 'vehicle__branch'
                    
                filter_field = getattr(view, 'branch_filter_field', default_field)
                return queryset.filter(**{filter_field: user_branch})
            return queryset.none()

        # 4. Handle Driver / Row-Level Filtering
        # If the view is for VehicleInfo and the user is a driver, filter by their assigned vehicle
        if queryset.model.__name__ == 'VehicleInfo' and hasattr(user, 'profile'):
            driver_profile = getattr(user.profile, 'driver_profile', None)  # Adjust to your exact profile -> driver relation
            if driver_profile:
                return queryset.filter(vehicle__current_driver_id=driver_profile.id)

        # Generic fallback if the model has a direct link to the user
        if hasattr(queryset.model, 'user'):
            return queryset.filter(user=user)

        # Safe default fallback block for unauthorized access profiles
        return queryset.none()

class DispatchBranchFilterBackend(BaseFilterBackend):
    def filter_queryset(self, request, queryset, view):
        user = request.user
        
        # 1. Unauthenticated users or users missing a profile get nothing
        if not user.is_authenticated or not hasattr(user, 'profile'):
            return queryset.none()
            
        # 2. Get the branch from the logged-in user's profile
        user_branch = getattr(user.profile, 'branch', None)
        
        if user_branch:
            # Cleanly filters your DispatchRecord entries by their booking branch location
            return queryset.filter(booking__branch=user_branch)
            
        # 3. Fallback: If a user has a profile but no branch assigned, restrict access
        return queryset.none()
