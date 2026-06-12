from rest_framework import serializers
from .models import Food, FoodCategory


class FoodCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = FoodCategory
        fields = '__all__'


class FoodSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Food
        fields = [
            'id', 'name', 'category', 'category_name',
            'serving_size_g', 'serving_description',
            'calories', 'protein_g', 'carbs_g', 'fat_g', 'fiber_g', 'sugar_g',
            'vitamin_c_mg', 'vitamin_a_iu', 'calcium_mg', 'iron_mg',
            'potassium_mg', 'sodium_mg',
            'is_vegetarian', 'is_vegan', 'is_gluten_free', 'is_diabetic_friendly', 'is_keto',
            'cost_inr', 'is_custom',
        ]
        read_only_fields = ['id', 'is_custom', 'category_name']
