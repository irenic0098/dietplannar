from django.urls import path
from . import views

urlpatterns = [
    path('posts/', views.posts, name='posts'),
    path('posts/<int:post_id>/like/', views.like_post, name='like-post'),
    path('posts/<int:post_id>/comments/', views.post_comments, name='post-comments'),
    path('dieticians/', views.dieticians, name='dieticians'),
    path('appointments/', views.appointments, name='appointments'),
]
