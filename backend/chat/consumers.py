import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async

logger = logging.getLogger('dietplanner')


class ChatConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for real-time chat."""

    async def connect(self):
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.room_group_name = f'chat_{self.room_id}'
        self.user = self.scope.get('user')

        # Reject unauthenticated connections
        if not self.user or not self.user.is_authenticated:
            await self.close(code=4001)
            return

        # Verify user is a participant of this room
        is_participant = await self._is_participant()
        if not is_participant:
            await self.close(code=4003)
            return

        # Join channel group
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

        # Send last 30 messages on connect
        messages = await self._get_recent_messages()
        await self.send(text_data=json.dumps({
            'type': 'history',
            'messages': messages,
        }))
        logger.info(f'User {self.user.email} connected to room {self.room_id}')

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
        logger.info(f'User {getattr(self.user, "email", "anon")} disconnected from room {self.room_id}')

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            msg_type = data.get('type', 'message')

            if msg_type == 'message':
                content = data.get('content', '').strip()
                if not content:
                    return

                # Save to DB
                message = await self._save_message(content)

                # Broadcast to group
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'chat_message',
                        'id': message['id'],
                        'content': content,
                        'sender_id': self.user.id,
                        'sender_name': self.user.username,
                        'sender_avatar': self.user.get_avatar(),
                        'created_at': message['created_at'],
                    }
                )

            elif msg_type == 'typing':
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'typing_indicator',
                        'user_id': self.user.id,
                        'username': self.user.username,
                        'is_typing': data.get('is_typing', False),
                    }
                )

        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({'error': 'Invalid JSON'}))

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'type': 'message',
            'id': event['id'],
            'content': event['content'],
            'sender_id': event['sender_id'],
            'sender_name': event['sender_name'],
            'sender_avatar': event.get('sender_avatar'),
            'created_at': event['created_at'],
        }))

    async def typing_indicator(self, event):
        if event['user_id'] != self.user.id:
            await self.send(text_data=json.dumps({
                'type': 'typing',
                'user_id': event['user_id'],
                'username': event['username'],
                'is_typing': event['is_typing'],
            }))

    @database_sync_to_async
    def _is_participant(self):
        from chat.models import ChatRoom
        return ChatRoom.objects.filter(
            id=self.room_id,
            participants=self.user,
            is_active=True,
        ).exists()

    @database_sync_to_async
    def _save_message(self, content):
        from chat.models import ChatRoom, Message
        room = ChatRoom.objects.get(id=self.room_id)
        msg = Message.objects.create(
            room=room,
            sender=self.user,
            content=content,
        )
        return {
            'id': msg.id,
            'created_at': msg.created_at.isoformat(),
        }

    @database_sync_to_async
    def _get_recent_messages(self):
        from chat.models import Message
        msgs = Message.objects.filter(room_id=self.room_id).select_related('sender').order_by('-created_at')[:30]
        return [{
            'id': m.id,
            'content': m.content,
            'sender_id': m.sender_id,
            'sender_name': m.sender.username if m.sender else 'Unknown',
            'sender_avatar': m.sender.get_avatar() if m.sender else None,
            'created_at': m.created_at.isoformat(),
        } for m in reversed(list(msgs))]
