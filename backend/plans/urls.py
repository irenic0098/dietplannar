from django.urls import path
from . import views

urlpatterns = [
    path('', views.my_plans, name='my-plans'),
    path('generate/', views.generate_plan, name='generate-plan'),
    path('<int:plan_id>/delete/', views.delete_plan, name='delete-plan'),
    path('<int:plan_id>/grocery-list/', views.grocery_list, name='grocery-list'),
]
