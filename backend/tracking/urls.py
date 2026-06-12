from django.urls import path
from . import views

urlpatterns = [
    path('weight/', views.weight_log, name='weight-log'),
    path('water/', views.water_log, name='water-log'),
    path('food/', views.food_log, name='food-log'),
    path('food/<int:log_id>/delete/', views.delete_food_log, name='delete-food-log'),
    path('exercise/', views.exercise_log, name='exercise-log'),
    path('report/', views.report, name='report'),
]
