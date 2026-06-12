from django.urls import path
from . import views

urlpatterns = [
    path('search/', views.search_food, name='food-search'),
    path('categories/', views.categories, name='food-categories'),
    path('custom/', views.add_custom_food, name='add-custom-food'),
    path('<int:food_id>/', views.food_detail, name='food-detail'),
    path('<int:food_id>/manage/', views.manage_food, name='manage-food'),
]
