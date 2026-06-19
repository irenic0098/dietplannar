from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
from .models import User


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Adds role, email to the JWT payload."""
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = user.role
        token['email'] = user.email
        token['username'] = user.username
        return token


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'password', 'password2',
            'age', 'gender', 'height_cm', 'weight_kg',
            'activity_level', 'goal', 'diet_preference',
        ]

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError('An account with this email already exists.')
        return value.lower()

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({'password': 'Passwords do not match.'})
        return data

    def create(self, validated_data):
        from .services import AuthService
        return AuthService.register(validated_data)


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(username=data['email'].lower(), password=data['password'])
        if not user:
            raise serializers.ValidationError('Invalid email or password.')
        if not user.is_active:
            raise serializers.ValidationError('Account is disabled. Contact support.')
        data['user'] = user
        return data


class UserProfileSerializer(serializers.ModelSerializer):
    bmi = serializers.ReadOnlyField()
    avatar_display = serializers.SerializerMethodField()
    role_display = serializers.CharField(source='get_role_display', read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'role', 'role_display',
            'age', 'gender', 'height_cm', 'weight_kg',
            'activity_level', 'goal', 'diet_preference',
            'avatar', 'avatar_url', 'avatar_display', 'bio',
            'target_weight_kg', 'budget_per_day', 'language',
            'medical_conditions', 'allergies',
            'is_google_auth', 'is_profile_complete',
            'bmi', 'created_at', 'last_active',
        ]
        read_only_fields = [
            'id', 'email', 'role', 'created_at', 'bmi',
            'is_google_auth', 'last_active',
        ]

    def get_avatar_display(self, obj):
        return obj.get_avatar()


class PublicUserSerializer(serializers.ModelSerializer):
    """Safe public-facing profile (no sensitive fields)."""
    class Meta:
        model = User
        fields = ['id', 'username', 'avatar_url', 'role', 'bio', 'created_at']


class AdminUserSerializer(serializers.ModelSerializer):
    """Full details for admin views."""
    bmi = serializers.ReadOnlyField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'role', 'is_active', 'is_staff',
            'age', 'gender', 'height_cm', 'weight_kg', 'bmi',
            'activity_level', 'goal', 'diet_preference',
            'is_google_auth', 'is_profile_complete',
            'date_joined', 'last_active', 'created_at',
        ]
        read_only_fields = ['id', 'email', 'date_joined', 'created_at']


class GoogleAuthSerializer(serializers.Serializer):
    access_token = serializers.CharField(help_text='Google OAuth2 access token')


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)

    def validate_new_password(self, value):
        from django.contrib.auth.password_validation import validate_password
        validate_password(value)
        return value


class RoleUpdateSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()
    role = serializers.ChoiceField(choices=User.Role.choices)
