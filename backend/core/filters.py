from rest_framework.filters import BaseFilterBackend

class BranchFilterBackend(BaseFilterBackend):
    def filter_queryset(self, request, queryset, view):
        user = request.user
        
        # 2. Safety Gate: Block unauthenticated users immediately
        if not user or not user.is_authenticated:
            return queryset.none()
        
        # 3. FIXED: Allow Superadmins to see everything across the entire system
        if user.is_superuser or (hasattr(user, 'profile') and user.profile.role == 'super admin'):
            return queryset

        # 4. FIXED: Removed the premature return and placed Branch Admins check first
        if hasattr(user, 'profile') and user.profile.role == 'admin':
            user_branch = user.profile.branch
            if user_branch is not None:
                # Allows views to override the field name if it's not called 'branch'
                filter_field = getattr(view, 'branch_filter_field', 'branch')
                return queryset.filter(**{filter_field: user_branch})
            return queryset.none()
        
        # 5. Fallback: Drivers/Employees can only see their own records (if the model links to user)
        if hasattr(queryset.model, 'user'):
            return queryset.filter(user=user)
        
        # Safe default fallback block
        return queryset.none()




from rest_framework.filters import BaseFilterBackend

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
