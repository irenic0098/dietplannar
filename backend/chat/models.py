from django.db import models
from accounts.models import User


class ChatRoom(models.Model):
    """A private 1-on-1 or group chat room."""
    class RoomType(models.TextChoices):
        DIRECT = 'direct', 'Direct Message'
        GROUP = 'group', 'Group Chat'
        SUPPORT = 'support', 'Dietician Support'

    name = models.CharField(max_length=200, blank=True)
    room_type = models.CharField(max_length=20, choices=RoomType.choices, default=RoomType.DIRECT)
    participants = models.ManyToManyField(User, related_name='chat_rooms', blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_rooms')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name or f"Room {self.id} ({self.room_type})"

    @classmethod
    def get_or_create_direct(cls, user1, user2):
        """Get or create a direct message room between two users."""
        existing = cls.objects.filter(
            room_type=cls.RoomType.DIRECT,
            participants=user1
        ).filter(participants=user2)
        if existing.exists():
            return existing.first(), False
        room = cls.objects.create(
            room_type=cls.RoomType.DIRECT,
            created_by=user1,
        )
        room.participants.add(user1, user2)
        return room, True


class Message(models.Model):
    """A chat message in a room."""
    class MessageType(models.TextChoices):
        TEXT = 'text', 'Text'
        IMAGE = 'image', 'Image'
        FILE = 'file', 'File'
        SYSTEM = 'system', 'System'

    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='sent_messages')
    content = models.TextField()
    message_type = models.CharField(max_length=10, choices=MessageType.choices, default=MessageType.TEXT)
    file_url = models.URLField(blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['created_at']
        indexes = [models.Index(fields=['room', 'created_at'])]

    def __str__(self):
        return f"{self.sender}: {self.content[:50]}"
