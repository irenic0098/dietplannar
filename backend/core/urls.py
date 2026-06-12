from django.urls import path
from . import views
from . import ai_views

urlpatterns = [
    path('health/', views.health_check, name='health'),
    path('bmi/', views.calculate_bmi_view, name='calculate-bmi'),
    path('diet-plan/', views.calculate_diet_plan, name='calculate-diet-plan'),
    path('water-intake/', views.calculate_water_view, name='calculate-water'),
    path('ai/chat/', ai_views.chatbot, name='ai-chat'),
    path('ai/recommend/', ai_views.ai_recommend, name='ai-recommend'),
    path('ai/recipe/', ai_views.ai_recipe, name='ai-recipe'),
]
