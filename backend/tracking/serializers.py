from rest_framework import serializers
from .models import WeightLog, WaterLog, FoodLog, ExerciseLog


class WeightLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = WeightLog
        fields = ['id', 'weight_kg', 'date', 'note', 'created_at']
        read_only_fields = ['id', 'created_at']


class WaterLogSerializer(serializers.ModelSerializer):
    percentage = serializers.SerializerMethodField()

    class Meta:
        model = WaterLog
        fields = ['id', 'date', 'glasses', 'target_glasses', 'ml_consumed', 'percentage']
        read_only_fields = ['id']

    def get_percentage(self, obj):
        if obj.target_glasses > 0:
            return round((obj.glasses / obj.target_glasses) * 100)
        return 0


class FoodLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = FoodLog
        fields = ['id', 'food', 'food_name', 'meal_type', 'date',
                  'quantity_g', 'calories', 'protein_g', 'carbs_g', 'fat_g', 'created_at']
        read_only_fields = ['id', 'food_name', 'calories', 'protein_g', 'carbs_g', 'fat_g', 'created_at']


class ExerciseLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExerciseLog
        fields = ['id', 'exercise_type', 'name', 'duration_minutes',
                  'calories_burned', 'date', 'notes', 'created_at']
        read_only_fields = ['id', 'created_at']
