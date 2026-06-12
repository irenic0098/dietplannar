from rest_framework import serializers
from .models import DietPlan, MealSlot


class MealSlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = MealSlot
        fields = ['id', 'meal_type', 'time_suggestion', 'target_calories', 'foods', 'notes']


class DietPlanSerializer(serializers.ModelSerializer):
    meal_slots = MealSlotSerializer(many=True, read_only=True)

    class Meta:
        model = DietPlan
        fields = ['id', 'name', 'goal', 'target_calories', 'protein_g',
                  'carbs_g', 'fat_g', 'water_liters', 'is_active', 'created_at', 'meal_slots']
        read_only_fields = ['id', 'created_at']
