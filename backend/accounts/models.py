from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Role(models.TextChoices):
        USER = 'user', 'User'
        DIETICIAN = 'dietician', 'Dietician'
        ADMIN = 'admin', 'Admin'
        SUPER_ADMIN = 'super_admin', 'Super Admin'

    GENDER_CHOICES = [('male', 'Male'), ('female', 'Female'), ('other', 'Other')]
    ACTIVITY_CHOICES = [
        ('sedentary', 'Sedentary'),
        ('light', 'Lightly Active'),
        ('moderate', 'Moderately Active'),
        ('active', 'Very Active'),
        ('very_active', 'Extra Active'),
    ]
    GOAL_CHOICES = [
        ('lose', 'Lose Weight'),
        ('maintain', 'Maintain Weight'),
        ('gain', 'Gain Muscle'),
        ('healthy', 'Healthy Eating'),
    ]
    DIET_CHOICES = [
        ('none', 'No Preference'),
        ('vegetarian', 'Vegetarian'),
        ('vegan', 'Vegan'),
        ('gluten_free', 'Gluten-Free'),
        ('diabetic', 'Diabetic-Friendly'),
        ('keto', 'Ketogenic'),
    ]

    # Core auth
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.USER, db_index=True)

    # OAuth
    is_google_auth = models.BooleanField(default=False)
    google_id = models.CharField(max_length=200, blank=True, db_index=True)
    avatar_url = models.URLField(blank=True, help_text='Cloudinary or Google avatar URL')

    # Profile
    age = models.PositiveIntegerField(null=True, blank=True)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, default='male')
    height_cm = models.FloatField(null=True, blank=True)
    weight_kg = models.FloatField(null=True, blank=True)
    activity_level = models.CharField(max_length=20, choices=ACTIVITY_CHOICES, default='moderate')
    goal = models.CharField(max_length=20, choices=GOAL_CHOICES, default='maintain')
    diet_preference = models.CharField(max_length=20, choices=DIET_CHOICES, default='none')
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    bio = models.TextField(blank=True)
    target_weight_kg = models.FloatField(null=True, blank=True)
    budget_per_day = models.FloatField(null=True, blank=True)
    language = models.CharField(max_length=5, default='en', choices=[('en', 'English'), ('hi', 'Hindi')])

    # Health alerts
    medical_conditions = models.TextField(blank=True, help_text='Comma-separated conditions')
    allergies = models.TextField(blank=True, help_text='Comma-separated allergies')

    # Status
    is_profile_complete = models.BooleanField(default=False)
    last_active = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['email', 'role']),
            models.Index(fields=['is_active', 'role']),
        ]

    def __str__(self):
        return f"{self.email} ({self.role})"

    @property
    def bmi(self):
        if self.height_cm and self.weight_kg:
            h = self.height_cm / 100
            return round(self.weight_kg / (h * h), 1)
        return None

    @property
    def is_dietician(self):
        return self.role == self.Role.DIETICIAN

    @property
    def is_admin_user(self):
        return self.role in [self.Role.ADMIN, self.Role.SUPER_ADMIN]

    def get_avatar(self):
        """Return best available avatar URL."""
        if self.avatar:
            return self.avatar.url
        if self.avatar_url:
            return self.avatar_url
        return None


class AuditLog(models.Model):
    """System-wide audit trail for security and compliance."""
    ACTION_TYPES = [
        ('login', 'Login'), ('logout', 'Logout'), ('register', 'Register'),
        ('profile_update', 'Profile Update'), ('password_change', 'Password Change'),
        ('data_export', 'Data Export'), ('admin_action', 'Admin Action'),
    ]
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='audit_logs')
    action = models.CharField(max_length=50, choices=ACTION_TYPES)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    endpoint = models.CharField(max_length=500, blank=True)
    method = models.CharField(max_length=10, blank=True)
    status_code = models.PositiveSmallIntegerField(null=True, blank=True)
    extra_data = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [models.Index(fields=['user', 'action', 'created_at'])]

    def __str__(self):
        return f"{self.user} - {self.action} at {self.created_at}"
