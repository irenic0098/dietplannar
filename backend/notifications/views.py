from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Notification
from .serializers import NotificationSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_notifications(request):
    """GET /api/v1/notifications/ — Get user's notifications."""
    notifs = Notification.objects.filter(user=request.user)
    unread_only = request.query_params.get('unread', '')
    if unread_only.lower() == 'true':
        notifs = notifs.filter(is_read=False)
    notifs = notifs[:50]
    serializer = NotificationSerializer(notifs, many=True)
    unread_count = Notification.objects.filter(user=request.user, is_read=False).count()
    return Response({
        'count': len(serializer.data),
        'unread_count': unread_count,
        'notifications': serializer.data,
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_read(request, notif_id):
    """POST /api/v1/notifications/<id>/read/ — Mark one notification as read."""
    try:
        notif = Notification.objects.get(id=notif_id, user=request.user)
        notif.is_read = True
        notif.save(update_fields=['is_read'])
        return Response({'message': 'Marked as read.'})
    except Notification.DoesNotExist:
        return Response({'error': 'Notification not found.'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_all_read(request):
    """POST /api/v1/notifications/read-all/ — Mark all as read."""
    updated = Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
    return Response({'message': f'{updated} notifications marked as read.'})


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_notification(request, notif_id):
    """DELETE /api/v1/notifications/<id>/ — Delete a notification."""
    try:
        notif = Notification.objects.get(id=notif_id, user=request.user)
        notif.delete()
        return Response({'message': 'Deleted.'}, status=status.HTTP_204_NO_CONTENT)
    except Notification.DoesNotExist:
        return Response({'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def clear_all(request):
    """DELETE /api/v1/notifications/clear/ — Clear all notifications."""
    Notification.objects.filter(user=request.user).delete()
    return Response({'message': 'All notifications cleared.'})
