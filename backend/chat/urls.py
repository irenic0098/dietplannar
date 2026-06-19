from django.urls import path
from . import views

urlpatterns = [
    path('rooms/', views.rooms_list, name='chat-rooms-list'),
    path('rooms/direct/', views.get_or_create_direct_room, name='chat-room-direct'),
    path('rooms/<int:room_id>/messages/', views.room_messages, name='chat-room-messages'),
    path('rooms/<int:room_id>/read/', views.mark_room_as_read, name='chat-room-read'),
]
