from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import ChatRoom, Message
from .serializers import ChatRoomSerializer, MessageSerializer
from accounts.models import User

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def rooms_list(request):
    """List or create chat rooms."""
    if request.method == 'GET':
        rooms = ChatRoom.objects.filter(participants=request.user, is_active=True)
        serializer = ChatRoomSerializer(rooms, many=True, context={'request': request})
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = ChatRoomSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def get_or_create_direct_room(request):
    """Get or create a direct chat room with another user by ID."""
    other_user_id = request.data.get('user_id')
    if not other_user_id:
        return Response({'error': 'user_id is required.'}, status=status.HTTP_400_BAD_REQUEST)
    
    other_user = get_object_or_404(User, id=other_user_id)
    room, created = ChatRoom.get_or_create_direct(request.user, other_user)
    
    serializer = ChatRoomSerializer(room, context={'request': request})
    return Response({
        'room': serializer.data,
        'created': created
    }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def room_messages(request, room_id):
    """Get messages in a specific room (accessible only to participants)."""
    room = get_object_or_404(ChatRoom, id=room_id, is_active=True)
    if not room.participants.filter(id=request.user.id).exists():
        return Response({'error': 'You are not a participant in this room.'}, status=status.HTTP_403_FORBIDDEN)
    
    messages = room.messages.order_by('created_at')[:100]  # Return last 100 messages
    serializer = MessageSerializer(messages, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_room_as_read(request, room_id):
    """Mark all unread messages in a room sent by others as read."""
    room = get_object_or_404(ChatRoom, id=room_id, is_active=True)
    if not room.participants.filter(id=request.user.id).exists():
        return Response({'error': 'You are not a participant in this room.'}, status=status.HTTP_403_FORBIDDEN)
    
    room.messages.filter(is_read=False).exclude(sender=request.user).update(is_read=True)
    return Response({'status': 'messages marked as read'})
