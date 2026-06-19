"""
Service layer for accounts — encapsulates all business logic,
keeping views thin and testable.
"""
import logging
import requests
from django.conf import settings
from django.contrib.auth import authenticate
from django.core.cache import cache
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User, AuditLog

logger = logging.getLogger('dietplanner')


class AuthService:
    """Handles all authentication operations."""

    @staticmethod
    def get_tokens_for_user(user: User) -> dict:
        refresh = RefreshToken.for_user(user)
        refresh['role'] = user.role
        refresh['email'] = user.email
        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }

    @staticmethod
    def register(validated_data: dict) -> User:
        validated_data.pop('password2', None)
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        logger.info(f"New user registered: {user.email}")
        return user

    @staticmethod
    def login(email: str, password: str) -> User | None:
        user = authenticate(username=email, password=password)
        if user and user.is_active:
            return user
        return None

    @staticmethod
    def google_auth(token: str) -> dict:
        """Verify Google OAuth token and return/create user."""
        try:
            google_url = f'https://www.googleapis.com/oauth2/v3/userinfo'
            response = requests.get(
                google_url,
                headers={'Authorization': f'Bearer {token}'},
                timeout=10
            )
            if response.status_code != 200:
                raise ValueError('Invalid Google token')

            google_data = response.json()
            email = google_data.get('email')
            if not email:
                raise ValueError('Email not provided by Google')

            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'username': email.split('@')[0],
                    'is_google_auth': True,
                    'google_id': google_data.get('sub', ''),
                    'avatar_url': google_data.get('picture', ''),
                    'first_name': google_data.get('given_name', ''),
                    'last_name': google_data.get('family_name', ''),
                    'is_active': True,
                }
            )

            if not created:
                # Update google fields on subsequent logins
                user.is_google_auth = True
                user.google_id = google_data.get('sub', user.google_id)
                if google_data.get('picture'):
                    user.avatar_url = google_data['picture']
                user.save(update_fields=['is_google_auth', 'google_id', 'avatar_url'])

            tokens = AuthService.get_tokens_for_user(user)
            return {'user': user, 'tokens': tokens, 'created': created}

        except requests.RequestException as e:
            logger.error(f"Google OAuth network error: {e}")
            raise ValueError('Failed to connect to Google services')

    @staticmethod
    def change_password(user: User, old_password: str, new_password: str) -> bool:
        if not user.check_password(old_password):
            return False
        user.set_password(new_password)
        user.save()
        AuditService.log(user, 'password_change')
        return True


class UserService:
    """Handles user profile operations."""

    CACHE_PREFIX = 'user_profile'
    CACHE_TTL = 300  # 5 minutes

    @staticmethod
    def get_profile_cache_key(user_id: int) -> str:
        return f'{UserService.CACHE_PREFIX}:{user_id}'

    @staticmethod
    def invalidate_cache(user_id: int):
        cache.delete(UserService.get_profile_cache_key(user_id))

    @staticmethod
    def update_profile(user: User, data: dict) -> User:
        allowed_fields = [
            'username', 'age', 'gender', 'height_cm', 'weight_kg',
            'activity_level', 'goal', 'diet_preference', 'bio',
            'target_weight_kg', 'budget_per_day', 'language',
            'medical_conditions', 'allergies', 'first_name', 'last_name',
        ]
        for field in allowed_fields:
            if field in data:
                setattr(user, field, data[field])

        # Check profile completeness
        user.is_profile_complete = all([
            user.age, user.height_cm, user.weight_kg
        ])
        user.save()
        UserService.invalidate_cache(user.id)
        return user

    @staticmethod
    def get_all_users(role_filter: str = None, search: str = None):
        qs = User.objects.all().order_by('-date_joined')
        if role_filter:
            qs = qs.filter(role=role_filter)
        if search:
            qs = qs.filter(email__icontains=search) | qs.filter(username__icontains=search)
        return qs

    @staticmethod
    def set_user_role(user: User, new_role: str, requesting_user: User) -> User:
        if requesting_user.role != 'super_admin':
            raise PermissionError('Only Super Admin can change roles')
        if new_role not in [r[0] for r in User.Role.choices]:
            raise ValueError(f'Invalid role: {new_role}')
        user.role = new_role
        user.save(update_fields=['role'])
        AuditService.log(requesting_user, 'admin_action',
                         extra={'target_user': user.email, 'new_role': new_role})
        return user


class AuditService:
    """Handles audit logging."""

    @staticmethod
    def log(user, action: str, request=None, extra: dict = None):
        try:
            ip = None
            user_agent = ''
            endpoint = ''
            method = ''

            if request:
                ip = AuditService._get_client_ip(request)
                user_agent = request.META.get('HTTP_USER_AGENT', '')[:500]
                endpoint = request.path
                method = request.method

            AuditLog.objects.create(
                user=user,
                action=action,
                ip_address=ip,
                user_agent=user_agent,
                endpoint=endpoint,
                method=method,
                extra_data=extra or {},
            )
        except Exception as e:
            logger.warning(f"Audit log failed: {e}")

    @staticmethod
    def _get_client_ip(request) -> str:
        x_forwarded = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded:
            return x_forwarded.split(',')[0].strip()
        return request.META.get('REMOTE_ADDR', '')
