from rest_framework import serializers
from .models import ChatRoom, Message
from accounts.serializers import UserProfileSerializer

class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.username', read_only=True)
    sender_email = serializers.EmailField(source='sender.email', read_only=True)
    sender_role = serializers.CharField(source='sender.role', read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'room', 'sender', 'sender_name', 'sender_email', 'sender_role', 'content', 'message_type', 'file_url', 'is_read', 'created_at']
        read_only_fields = ['sender', 'is_read', 'created_at']


class ChatRoomSerializer(serializers.ModelSerializer):
    participants = UserProfileSerializer(many=True, read_only=True)
    participant_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = ChatRoom
        fields = ['id', 'name', 'room_type', 'participants', 'participant_ids', 'created_by', 'is_active', 'created_at', 'last_message', 'unread_count']
        read_only_fields = ['created_by', 'is_active', 'created_at']

    def get_last_message(self, obj):
        last_msg = obj.messages.order_by('-created_at').first()
        if last_msg:
            return MessageSerializer(last_msg).data
        return None

    def get_unread_count(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.messages.filter(is_read=False).exclude(sender=request.user).count()
        return 0

    def create(self, validated_data):
        participant_ids = validated_data.pop('participant_ids', [])
        user = self.context['request'].user
        
        # Default behavior: make sure creator is in the participants list
        room = ChatRoom.objects.create(created_by=user, **validated_data)
        
        participants = [user]
        for p_id in participant_ids:
            if p_id != user.id:
                participants.append(p_id)
                
        room.participants.add(*participants)
        return room
