from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, AuditLog


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['email', 'username', 'role', 'is_active', 'is_profile_complete', 'created_at']
    list_filter = ['role', 'is_active', 'is_google_auth', 'gender', 'goal']
    search_fields = ['email', 'username', 'first_name', 'last_name']
    ordering = ['-created_at']
    readonly_fields = ['created_at', 'updated_at', 'last_active', 'bmi']

    fieldsets = (
        (None, {'fields': ('email', 'username', 'password')}),
        ('Role & Status', {'fields': ('role', 'is_active', 'is_staff', 'is_superuser', 'is_google_auth')}),
        ('Profile', {'fields': ('age', 'gender', 'height_cm', 'weight_kg', 'bmi',
                                'activity_level', 'goal', 'diet_preference', 'bio',
                                'avatar', 'avatar_url', 'target_weight_kg', 'budget_per_day')}),
        ('Health', {'fields': ('medical_conditions', 'allergies')}),
        ('Settings', {'fields': ('language', 'is_profile_complete')}),
        ('Timestamps', {'fields': ('created_at', 'updated_at', 'last_active', 'date_joined')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'role', 'password1', 'password2'),
        }),
    )


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ['user', 'action', 'ip_address', 'method', 'endpoint', 'created_at']
    list_filter = ['action', 'method']
    search_fields = ['user__email', 'ip_address', 'endpoint']
    readonly_fields = ['user', 'action', 'ip_address', 'user_agent', 'endpoint', 'method', 'status_code', 'extra_data', 'created_at']
    ordering = ['-created_at']

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False
