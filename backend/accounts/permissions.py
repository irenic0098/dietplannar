from rest_framework.permissions import BasePermission


class IsAdminRole(BasePermission):
    """Allows access only to Admin or Super Admin users."""
    message = 'Admin access required.'

    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role in ['admin', 'super_admin']
        )


class IsSuperAdmin(BasePermission):
    """Allows access only to Super Admin users."""
    message = 'Super Admin access required.'

    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role == 'super_admin'
        )


class IsDietician(BasePermission):
    """Allows access only to Dietician users."""
    message = 'Dietician access required.'

    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role == 'dietician'
        )


class IsDieticianOrAdmin(BasePermission):
    """Allows access to Dietician, Admin, or Super Admin."""
    message = 'Dietician or Admin access required.'

    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role in ['dietician', 'admin', 'super_admin']
        )


class IsOwnerOrAdmin(BasePermission):
    """Object-level: only owner or admin can access."""
    message = 'You do not have permission to access this resource.'

    def has_object_permission(self, request, view, obj):
        if request.user.role in ['admin', 'super_admin']:
            return True
        owner = getattr(obj, 'user', None) or getattr(obj, 'author', None)
        return owner == request.user


class IsVerifiedUser(BasePermission):
    """Authenticated users with complete profile."""
    message = 'Please complete your profile first.'

    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.is_active
        )
