from django.db import models
from accounts.models import User


class Notification(models.Model):
    class NotifType(models.TextChoices):
        SYSTEM = 'system', 'System'
        DIET_PLAN = 'diet_plan', 'Diet Plan'
        WATER_REMINDER = 'water_reminder', 'Water Reminder'
        MEAL_REMINDER = 'meal_reminder', 'Meal Reminder'
        WEIGHT_LOG = 'weight_log', 'Weight Log'
        APPOINTMENT = 'appointment', 'Appointment'
        COMMUNITY = 'community', 'Community'
        ACHIEVEMENT = 'achievement', 'Achievement'

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=200)
    message = models.TextField()
    notif_type = models.CharField(max_length=30, choices=NotifType.choices, default=NotifType.SYSTEM)
    is_read = models.BooleanField(default=False, db_index=True)
    action_url = models.CharField(max_length=200, blank=True, help_text='Frontend route to navigate to')
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [models.Index(fields=['user', 'is_read', 'created_at'])]

    def __str__(self):
        return f'{self.user.email}: {self.title}'

    @classmethod
    def create_for_user(cls, user, title, message, notif_type='system', action_url='', metadata=None):
        return cls.objects.create(
            user=user,
            title=title,
            message=message,
            notif_type=notif_type,
            action_url=action_url,
            metadata=metadata or {},
        )

    @classmethod
    def bulk_create_for_users(cls, users, title, message, notif_type='system'):
        notifications = [
            cls(user=user, title=title, message=message, notif_type=notif_type)
            for user in users
        ]
        return cls.objects.bulk_create(notifications)
