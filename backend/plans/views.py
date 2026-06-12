from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import DietPlan, MealSlot
from .serializers import DietPlanSerializer
from core.views import (calculate_bmi, calculate_bmr, calculate_tdee,
                        calculate_calories_by_goal, calculate_macros,
                        calculate_water, generate_meal_plan, ACTIVITY_LABELS)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_plans(request):
    plans = DietPlan.objects.filter(user=request.user)
    return Response(DietPlanSerializer(plans, many=True).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_plan(request):
    """Generate and save a new diet plan for the user."""
    user = request.user
    data = request.data

    # Allow override via POST body or fall back to user profile
    weight_kg = float(data.get('weight_kg', user.weight_kg or 70))
    height_cm = float(data.get('height_cm', user.height_cm or 170))
    age = int(data.get('age', user.age or 25))
    gender = data.get('gender', user.gender or 'male')
    activity_level = data.get('activity_level', user.activity_level or 'moderate')
    goal = data.get('goal', user.goal or 'maintain')
    diet_preference = data.get('diet_preference', user.diet_preference or 'none')
    plan_name = data.get('name', f'Diet Plan - {goal.capitalize()}')

    bmr = calculate_bmr(weight_kg, height_cm, age, gender)
    tdee = calculate_tdee(bmr, activity_level)
    calorie_data = calculate_calories_by_goal(tdee, goal)
    macros = calculate_macros(calorie_data['calories'], goal, weight_kg)
    water = calculate_water(weight_kg, activity_level)
    meal_plan = generate_meal_plan(
        calorie_data['calories'], goal,
        macros['protein_g'], macros['carbs_g'], macros['fat_g'],
        diet_preference=diet_preference,
        weight_kg=weight_kg,
        height_cm=height_cm,
        age=age,
        gender=gender
    )

    # Deactivate previous active plan
    DietPlan.objects.filter(user=user, is_active=True).update(is_active=False)

    plan = DietPlan.objects.create(
        user=user,
        name=plan_name,
        goal=goal,
        diet_preference=diet_preference,
        target_calories=calorie_data['calories'],
        protein_g=macros['protein_g'],
        carbs_g=macros['carbs_g'],
        fat_g=macros['fat_g'],
        water_liters=water['liters'],
        is_active=True,
    )

    for meal in meal_plan:
        MealSlot.objects.create(
            plan=plan,
            meal_type=meal['name'].lower(),
            time_suggestion=meal['time'],
            target_calories=meal['calories'],
            foods=meal['foods'],
        )

    return Response({
        'plan': DietPlanSerializer(plan).data,
        'bmi': calculate_bmi(weight_kg, height_cm),
        'water': water,
        'calorie_info': calorie_data,
        'macros': macros,
    }, status=201)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_plan(request, plan_id):
    try:
        plan = DietPlan.objects.get(id=plan_id, user=request.user)
        plan.delete()
        return Response({'message': 'Plan deleted.'}, status=204)
    except DietPlan.DoesNotExist:
        return Response({'error': 'Plan not found.'}, status=404)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def grocery_list(request, plan_id):
    """Generate grocery list from a diet plan's meals."""
    try:
        plan = DietPlan.objects.get(id=plan_id, user=request.user)
    except DietPlan.DoesNotExist:
        return Response({'error': 'Plan not found.'}, status=404)

    all_foods = []
    for slot in plan.meal_slots.all():
        all_foods.extend(slot.foods)

    # De-duplicate and categorize
    seen = set()
    unique_foods = []
    for f in all_foods:
        if f.lower() not in seen:
            seen.add(f.lower())
            unique_foods.append(f)

    # Simple categorization
    categories = {
        'Proteins': [],
        'Grains & Carbs': [],
        'Fruits & Vegetables': [],
        'Dairy & Eggs': [],
        'Beverages': [],
        'Others': [],
    }
    protein_keywords = ['chicken', 'fish', 'beef', 'salmon', 'tuna', 'egg', 'lentil', 'tofu', 'paneer', 'dal']
    grain_keywords = ['rice', 'bread', 'oat', 'wheat', 'quinoa', 'roti', 'chapati', 'pasta', 'cereal']
    fruit_veg_keywords = ['apple', 'banana', 'salad', 'broccoli', 'spinach', 'vegetable', 'fruit', 'tomato', 'cucumber', 'carrot']
    dairy_keywords = ['milk', 'yogurt', 'cheese', 'butter', 'curd', 'paneer']
    beverage_keywords = ['water', 'tea', 'coffee', 'juice', 'shake', 'smoothie']

    for food in unique_foods:
        fl = food.lower()
        if any(k in fl for k in protein_keywords):
            categories['Proteins'].append(food)
        elif any(k in fl for k in grain_keywords):
            categories['Grains & Carbs'].append(food)
        elif any(k in fl for k in fruit_veg_keywords):
            categories['Fruits & Vegetables'].append(food)
        elif any(k in fl for k in dairy_keywords):
            categories['Dairy & Eggs'].append(food)
        elif any(k in fl for k in beverage_keywords):
            categories['Beverages'].append(food)
        else:
            categories['Others'].append(food)

    return Response({
        'plan_name': plan.name,
        'grocery_list': [
            {'category': k, 'items': v}
            for k, v in categories.items() if v
        ],
        'total_items': len(unique_foods),
    })
