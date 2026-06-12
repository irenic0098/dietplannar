from django.contrib import admin
from .models import User

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['email', 'username', 'gender', 'age', 'weight_kg', 'height_cm', 'goal', 'is_active', 'date_joined']
    list_filter = ['gender', 'goal', 'diet_preference', 'activity_level', 'is_active']
    search_fields = ['email', 'username']
    ordering = ['-date_joined']
