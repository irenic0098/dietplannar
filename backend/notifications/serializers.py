from rest_framework import serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    notif_type_display = serializers.CharField(source='get_notif_type_display', read_only=True)

    class Meta:
        model = Notification
        fields = [
            'id', 'title', 'message', 'notif_type', 'notif_type_display',
            'is_read', 'action_url', 'metadata', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']
