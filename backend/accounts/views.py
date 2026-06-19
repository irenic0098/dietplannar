import logging
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.throttling import AnonRateThrottle
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

from .models import User, AuditLog
from .serializers import (
    RegisterSerializer, LoginSerializer, UserProfileSerializer,
    AdminUserSerializer, GoogleAuthSerializer, ChangePasswordSerializer,
    RoleUpdateSerializer, PublicUserSerializer,
)
from .services import AuthService, UserService, AuditService
from .permissions import IsAdminRole, IsSuperAdmin

logger = logging.getLogger('dietplanner')


class LoginRateThrottle(AnonRateThrottle):
    rate = '10/min'


# ─── Auth Endpoints ───────────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([LoginRateThrottle])
def register(request):
    """POST /api/v1/auth/register/"""
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        tokens = AuthService.get_tokens_for_user(user)
        AuditService.log(user, 'register', request)
        return Response({
            'message': 'Account created successfully!',
            'tokens': tokens,
            'user': UserProfileSerializer(user, context={'request': request}).data,
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([LoginRateThrottle])
def login(request):
    """POST /api/v1/auth/login/"""
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        tokens = AuthService.get_tokens_for_user(user)
        user.last_active = timezone.now()
        user.save(update_fields=['last_active'])
        AuditService.log(user, 'login', request)
        return Response({
            'message': 'Login successful!',
            'tokens': tokens,
            'user': UserProfileSerializer(user, context={'request': request}).data,
        })
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    """POST /api/v1/auth/logout/"""
    try:
        refresh_token = request.data.get('refresh')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
        AuditService.log(request.user, 'logout', request)
        return Response({'message': 'Logged out successfully.'})
    except TokenError:
        return Response({'error': 'Invalid token.'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def google_auth(request):
    """POST /api/v1/auth/google/ — Exchange Google OAuth token for JWT."""
    serializer = GoogleAuthSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    try:
        result = AuthService.google_auth(serializer.validated_data['access_token'])
        user = result['user']
        user.last_active = timezone.now()
        user.save(update_fields=['last_active'])
        action = 'register' if result['created'] else 'login'
        AuditService.log(user, action, request)
        return Response({
            'message': 'Google authentication successful!',
            'tokens': result['tokens'],
            'user': UserProfileSerializer(user, context={'request': request}).data,
            'is_new_user': result['created'],
        })
    except ValueError as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


# ─── Profile Endpoints ────────────────────────────────────────────────────────

@api_view(['GET', 'PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def profile(request):
    """GET/PUT/PATCH /api/v1/auth/profile/"""
    user = request.user
    if request.method == 'GET':
        return Response(UserProfileSerializer(user, context={'request': request}).data)

    serializer = UserProfileSerializer(
        user, data=request.data,
        partial=(request.method == 'PATCH'),
        context={'request': request}
    )
    if serializer.is_valid():
        updated_user = UserService.update_profile(user, serializer.validated_data)
        AuditService.log(user, 'profile_update', request)
        return Response(UserProfileSerializer(updated_user, context={'request': request}).data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    """POST /api/v1/auth/change-password/"""
    serializer = ChangePasswordSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    success = AuthService.change_password(
        request.user,
        serializer.validated_data['old_password'],
        serializer.validated_data['new_password'],
    )
    if not success:
        return Response({'error': 'Current password is incorrect.'}, status=status.HTTP_400_BAD_REQUEST)
    return Response({'message': 'Password changed successfully.'})


# ─── Admin Endpoints ──────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminRole])
def all_users(request):
    """GET /api/v1/auth/users/ — Admin: list all users with filters."""
    role_filter = request.query_params.get('role', '')
    search = request.query_params.get('search', '')
    users = UserService.get_all_users(
        role_filter=role_filter or None,
        search=search or None,
    )
    from rest_framework.pagination import PageNumberPagination
    paginator = PageNumberPagination()
    paginator.page_size = 20
    page = paginator.paginate_queryset(users, request)
    serializer = AdminUserSerializer(page, many=True)
    return paginator.get_paginated_response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminRole])
def user_detail_admin(request, user_id):
    """GET /api/v1/auth/users/<id>/ — Admin: get single user details."""
    try:
        user = User.objects.get(id=user_id)
        return Response(AdminUserSerializer(user).data)
    except User.DoesNotExist:
        return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsSuperAdmin])
def update_user_role(request):
    """POST /api/v1/auth/users/role/ — Super Admin: change user role."""
    serializer = RoleUpdateSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    try:
        target_user = User.objects.get(id=serializer.validated_data['user_id'])
        updated = UserService.set_user_role(
            target_user,
            serializer.validated_data['role'],
            request.user
        )
        return Response({
            'message': f'Role updated to {updated.role}',
            'user': AdminUserSerializer(updated).data,
        })
    except User.DoesNotExist:
        return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
    except (PermissionError, ValueError) as e:
        return Response({'error': str(e)}, status=status.HTTP_403_FORBIDDEN)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminRole])
def toggle_user_active(request, user_id):
    """POST /api/v1/auth/users/<id>/toggle-active/ — Admin: activate/deactivate user."""
    try:
        user = User.objects.get(id=user_id)
        user.is_active = not user.is_active
        user.save(update_fields=['is_active'])
        AuditService.log(request.user, 'admin_action', request,
                         extra={'action': 'toggle_active', 'target': user.email, 'is_active': user.is_active})
        return Response({'message': f'User {"activated" if user.is_active else "deactivated"}.', 'is_active': user.is_active})
    except User.DoesNotExist:
        return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminRole])
def audit_logs(request):
    """GET /api/v1/auth/audit-logs/ — Admin: view audit trail."""
    logs = AuditLog.objects.select_related('user').order_by('-created_at')[:200]
    data = [{
        'id': log.id,
        'user': log.user.email if log.user else 'Anonymous',
        'action': log.action,
        'ip_address': log.ip_address,
        'endpoint': log.endpoint,
        'method': log.method,
        'status_code': log.status_code,
        'created_at': log.created_at,
    } for log in logs]
    return Response({'count': len(data), 'logs': data})


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminRole])
def platform_stats(request):
    """GET /api/v1/auth/stats/ — Admin: platform-wide statistics."""
    from django.db.models import Count
    from tracking.models import FoodLog, WeightLog
    from plans.models import DietPlan

    stats = {
        'total_users': User.objects.count(),
        'active_users': User.objects.filter(is_active=True).count(),
        'users_by_role': dict(User.objects.values_list('role').annotate(count=Count('id'))),
        'total_plans': DietPlan.objects.count(),
        'total_food_logs': FoodLog.objects.count(),
        'new_users_today': User.objects.filter(
            date_joined__date=timezone.now().date()
        ).count(),
    }
    return Response(stats)
