from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
import math


# ─────────────────────────────────────────────
# Helper Calculations
# ─────────────────────────────────────────────

def calculate_bmi(weight_kg: float, height_cm: float) -> dict:
    """Calculate BMI and return value + category."""
    height_m = height_cm / 100.0
    bmi = weight_kg / (height_m ** 2)
    bmi = round(bmi, 1)

    if bmi < 18.5:
        category = "Underweight"
        color = "#60a5fa"
        advice = "You are underweight. Consider increasing your calorie intake with nutritious foods."
    elif bmi < 25.0:
        category = "Normal Weight"
        color = "#34d399"
        advice = "Great! You have a healthy weight. Maintain your current lifestyle."
    elif bmi < 30.0:
        category = "Overweight"
        color = "#fbbf24"
        advice = "You are overweight. A moderate calorie deficit and regular exercise is recommended."
    else:
        category = "Obese"
        color = "#f87171"
        advice = "You are in the obese range. Please consult a healthcare provider for a safe plan."

    return {
        "bmi": bmi,
        "category": category,
        "color": color,
        "advice": advice,
    }


def calculate_bmr(weight_kg: float, height_cm: float, age: int, gender: str) -> float:
    """Mifflin-St Jeor BMR formula."""
    if gender.lower() == "male":
        return 10 * weight_kg + 6.25 * height_cm - 5 * age + 5
    else:
        return 10 * weight_kg + 6.25 * height_cm - 5 * age - 161


ACTIVITY_MULTIPLIERS = {
    "sedentary": 1.2,        # Little or no exercise
    "light": 1.375,           # 1-3 days/week
    "moderate": 1.55,         # 3-5 days/week
    "active": 1.725,          # 6-7 days/week
    "very_active": 1.9,       # Hard exercise 2x/day
}

ACTIVITY_LABELS = {
    "sedentary": "Sedentary (office job, no exercise)",
    "light": "Lightly Active (1–3 days/week)",
    "moderate": "Moderately Active (3–5 days/week)",
    "active": "Very Active (6–7 days/week)",
    "very_active": "Extra Active (twice a day workouts)",
}


def calculate_tdee(bmr: float, activity_level: str) -> float:
    """Total Daily Energy Expenditure."""
    multiplier = ACTIVITY_MULTIPLIERS.get(activity_level, 1.55)
    return bmr * multiplier


def calculate_calories_by_goal(tdee: float, goal: str) -> dict:
    """Adjust calories based on goal."""
    if goal == "lose":
        target = tdee - 500
        goal_label = "Weight Loss"
        goal_desc = "500 kcal daily deficit for ~0.5kg/week loss"
    elif goal == "gain":
        target = tdee + 400
        goal_label = "Muscle Gain"
        goal_desc = "400 kcal daily surplus for lean muscle gain"
    else:
        target = tdee
        goal_label = "Maintain Weight"
        goal_desc = "Maintain your current weight"
    return {
        "calories": round(target),
        "goal_label": goal_label,
        "goal_desc": goal_desc,
    }


def calculate_macros(calories: float, goal: str, weight_kg: float) -> dict:
    """
    Calculate macronutrients in grams.
    Protein: 2.0g/kg (lose/maintain) or 2.2g/kg (gain)
    Fat: 25% of total calories
    Carbs: Remaining calories
    """
    if goal == "gain":
        protein_g = round(weight_kg * 2.2)
    else:
        protein_g = round(weight_kg * 2.0)

    fat_calories = calories * 0.25
    fat_g = round(fat_calories / 9)

    protein_calories = protein_g * 4
    carb_calories = calories - protein_calories - fat_calories
    carb_g = round(carb_calories / 4)

    return {
        "protein_g": protein_g,
        "carbs_g": max(carb_g, 0),
        "fat_g": fat_g,
        "protein_kcal": protein_g * 4,
        "carbs_kcal": max(carb_g, 0) * 4,
        "fat_kcal": fat_g * 9,
    }


def calculate_water(weight_kg: float, activity_level: str) -> dict:
    """
    Base: 35ml per kg of body weight
    Activity adjustment:
      sedentary: +0
      light: +350ml
      moderate: +500ml
      active: +750ml
      very_active: +1000ml
    """
    base_ml = weight_kg * 35
    activity_bonus = {
        "sedentary": 0,
        "light": 350,
        "moderate": 500,
        "active": 750,
        "very_active": 1000,
    }.get(activity_level, 0)

    total_ml = base_ml + activity_bonus
    total_liters = round(total_ml / 1000, 2)
    total_glasses = math.ceil(total_ml / 250)  # 250ml per glass

    return {
        "liters": total_liters,
        "glasses": total_glasses,
        "ml": round(total_ml),
    }


def generate_meal_plan(calories: int, goal: str, protein_g: int, carbs_g: int, fat_g: int,
                       diet_preference: str = 'none', weight_kg: float = 70, height_cm: float = 170,
                       age: int = 25, gender: str = 'male') -> list:
    """
    Generate a dynamic, personalized meal plan by query matching and portion scaling
    from the Food database.
    """
    from food.models import Food
    import random

    # 1. Fetch matching foods based on diet_preference
    foods = Food.objects.all()
    if diet_preference == 'vegetarian':
        foods = foods.filter(is_vegetarian=True)
    elif diet_preference == 'vegan':
        foods = foods.filter(is_vegan=True)
    elif diet_preference == 'gluten_free':
        foods = foods.filter(is_gluten_free=True)
    elif diet_preference == 'diabetic':
        foods = foods.filter(is_diabetic_friendly=True)
    elif diet_preference == 'keto':
        foods = foods.filter(is_keto=True)

    foods_list = list(foods)

    # 2. Group foods by functional categories for meals
    breakfast_mains = [f for f in foods_list if f.category and f.category.name in ['Grains & Cereals', 'Dairy & Eggs', 'Legumes & Pulses']]
    breakfast_sides = [f for f in foods_list if f.category and f.category.name in ['Fruits', 'Nuts & Seeds']]
    breakfast_bevs = [f for f in foods_list if f.category and f.category.name in ['Beverages']]

    lunch_dinner_proteins = [f for f in foods_list if f.category and f.category.name in ['Meat & Poultry', 'Fish & Seafood', 'Legumes & Pulses', 'Dairy & Eggs'] and f.protein_g > 3]
    lunch_dinner_grains = [f for f in foods_list if f.category and f.category.name in ['Grains & Cereals']]
    lunch_dinner_veggies = [f for f in foods_list if f.category and f.category.name in ['Vegetables']]

    snack_mains = [f for f in foods_list if f.category and f.category.name in ['Snacks', 'Nuts & Seeds', 'Fruits', 'Sweets & Desserts']]
    snack_bevs = [f for f in foods_list if f.category and f.category.name in ['Beverages', 'Dairy & Eggs']]

    # 3. Define the meals and target percentages
    meals_config = [
        {
            "name": "Breakfast",
            "time": "7:00 – 8:00 AM",
            "icon": "🌅",
            "pct": 0.25,
            "mains": breakfast_mains,
            "sides": breakfast_sides,
            "bevs": breakfast_bevs,
            "fallback_mains": ["Oatmeal (cooked)", "Roti (whole wheat)", "Egg (boiled)", "Tofu (100g)"],
            "fallback_sides": ["Apple", "Banana", "Almonds (30g)"],
            "fallback_bevs": ["Whole Milk (250ml)", "Skim Milk (250ml)", "Green Tea (1 cup)"]
        },
        {
            "name": "Lunch",
            "time": "12:00 – 1:00 PM",
            "icon": "☀️",
            "pct": 0.35,
            "mains": lunch_dinner_proteins,
            "sides": lunch_dinner_grains,
            "bevs": lunch_dinner_veggies,
            "fallback_mains": ["Chicken Breast (cooked, 100g)", "Paneer (100g)", "Moong Dal (cooked, 100g)", "Tofu (100g)"],
            "fallback_sides": ["Brown Rice (cooked)", "Roti (whole wheat)", "Quinoa (cooked)"],
            "fallback_bevs": ["Spinach", "Broccoli", "Tomato", "Cucumber"]
        },
        {
            "name": "Dinner",
            "time": "7:00 – 8:00 PM",
            "icon": "🌙",
            "pct": 0.30,
            "mains": lunch_dinner_proteins,
            "sides": lunch_dinner_grains,
            "bevs": lunch_dinner_veggies,
            "fallback_mains": ["Chicken Breast (cooked, 100g)", "Paneer (100g)", "Masoor Dal (cooked, 100g)", "Tofu (100g)"],
            "fallback_sides": ["Brown Rice (cooked)", "Roti (whole wheat)", "Quinoa (cooked)"],
            "fallback_bevs": ["Broccoli", "Cucumber", "Cauliflower", "Mushroom"]
        },
        {
            "name": "Snacks",
            "time": "Between meals",
            "icon": "🍎",
            "pct": 0.10,
            "mains": snack_mains,
            "sides": None,
            "bevs": snack_bevs,
            "fallback_mains": ["Almonds (30g)", "Popcorn (30g, plain)", "Makhana Fox Nuts (30g)", "Dark Chocolate (30g)"],
            "fallback_sides": None,
            "fallback_bevs": ["Buttermilk/Chaas (250ml)", "Coconut Water (250ml)", "Green Tea (1 cup)"]
        }
    ]

    meal_plan_slots = []
    # Seed control so random choices remain semi-stable or just select nice pairings
    person_seed = int(weight_kg + height_cm + age + len(gender) + len(diet_preference))
    random.seed(person_seed)

    for m in meals_config:
        meal_cal_target = round(calories * m["pct"])
        
        # 1. Select food items
        # Select Main
        main_food = None
        if m["mains"]:
            main_food = random.choice(m["mains"])
        else:
            fb_name = random.choice(m["fallback_mains"])
            main_food = Food.objects.filter(name__icontains=fb_name.split(' (')[0]).first()
            if not main_food:
                main_food = Food(name=fb_name, calories=150, protein_g=10, carbs_g=15, fat_g=5)

        # Select Side
        side_food = None
        if m["sides"] is not None:
            if m["sides"]:
                side_food = random.choice(m["sides"])
            else:
                fb_name = random.choice(m["fallback_sides"])
                side_food = Food.objects.filter(name__icontains=fb_name.split(' (')[0]).first()
                if not side_food:
                    side_food = Food(name=fb_name, calories=80, protein_g=1, carbs_g=20, fat_g=0)

        # Select Beverage/Veggie
        bev_food = None
        if m["bevs"]:
            bev_food = random.choice(m["bevs"])
        else:
            fb_name = random.choice(m["fallback_bevs"])
            bev_food = Food.objects.filter(name__icontains=fb_name.split(' (')[0]).first()
            if not bev_food:
                bev_food = Food(name=fb_name, calories=50, protein_g=2, carbs_g=5, fat_g=1)

        # 2. Distribute calorie allocations
        if side_food:
            main_cal = meal_cal_target * 0.50
            side_cal = meal_cal_target * 0.35
            bev_cal = meal_cal_target * 0.15
        else:
            main_cal = meal_cal_target * 0.75
            side_cal = 0
            bev_cal = meal_cal_target * 0.25

        food_items_descriptions = []
        actual_meal_cal = 0
        actual_meal_prot = 0
        actual_meal_carbs = 0
        actual_meal_fat = 0

        def add_food_to_list(food, target_cal):
            nonlocal actual_meal_cal, actual_meal_prot, actual_meal_carbs, actual_meal_fat
            if not food:
                return
            
            if food.calories <= 5:
                serving_str = food.serving_description or "1 cup"
                food_items_descriptions.append(f"{food.name} ({serving_str})")
                actual_meal_cal += food.calories
                actual_meal_prot += food.protein_g
                actual_meal_carbs += food.carbs_g
                actual_meal_fat += food.fat_g
                return

            portion_g = round((target_cal / food.calories) * food.serving_size_g)
            
            # Bound portions to sensible sizes
            if food.category and food.category.name in ['Grains & Cereals']:
                portion_g = max(min(portion_g, 250), 40)
            elif food.category and food.category.name in ['Meat & Poultry', 'Fish & Seafood', 'Legumes & Pulses', 'Dairy & Eggs']:
                portion_g = max(min(portion_g, 220), 50)
            elif food.category and food.category.name in ['Nuts & Seeds']:
                portion_g = max(min(portion_g, 40), 10)
            elif food.category and food.category.name in ['Vegetables']:
                portion_g = max(min(portion_g, 200), 50)
            else:
                portion_g = max(min(portion_g, 300), 30)

            cal = round((portion_g / food.serving_size_g) * food.calories)
            prot = round((portion_g / food.serving_size_g) * food.protein_g, 1)
            carb = round((portion_g / food.serving_size_g) * food.carbs_g, 1)
            fat = round((portion_g / food.serving_size_g) * food.fat_g, 1)

            food_items_descriptions.append(f"{food.name} - {portion_g}g ({cal} kcal, P: {prot}g)")
            
            actual_meal_cal += cal
            actual_meal_prot += prot
            actual_meal_carbs += carb
            actual_meal_fat += fat

        add_food_to_list(main_food, main_cal)
        add_food_to_list(side_food, side_cal)
        add_food_to_list(bev_food, bev_cal)

        meal_plan_slots.append({
            "name": m["name"],
            "time": m["time"],
            "icon": m["icon"],
            "calories": round(actual_meal_cal),
            "protein_g": round(actual_meal_prot),
            "carbs_g": round(actual_meal_carbs),
            "fat_g": round(actual_meal_fat),
            "foods": food_items_descriptions
        })

    random.seed(None)
    return meal_plan_slots


# ─────────────────────────────────────────────
# API Views
# ─────────────────────────────────────────────

@api_view(['GET'])
def health_check(request):
    return Response({"status": "ok", "message": "Diet Planner API is running 🥗"})


@api_view(['POST'])
def calculate_bmi_view(request):
    """POST /api/calculate/bmi/"""
    try:
        data = request.data
        weight_kg = float(data.get('weight_kg', 0))
        height_cm = float(data.get('height_cm', 0))

        if weight_kg <= 0 or height_cm <= 0:
            return Response(
                {"error": "Weight and height must be positive values."},
                status=status.HTTP_400_BAD_REQUEST
            )
        if weight_kg > 500 or height_cm > 300:
            return Response(
                {"error": "Please enter realistic weight and height values."},
                status=status.HTTP_400_BAD_REQUEST
            )

        result = calculate_bmi(weight_kg, height_cm)
        return Response(result)

    except (ValueError, TypeError) as e:
        return Response(
            {"error": f"Invalid input: {str(e)}"},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['POST'])
def calculate_diet_plan(request):
    """POST /api/calculate/diet-plan/"""
    try:
        data = request.data
        weight_kg = float(data.get('weight_kg', 0))
        height_cm = float(data.get('height_cm', 0))
        age = int(data.get('age', 0))
        gender = str(data.get('gender', 'male')).lower()
        activity_level = str(data.get('activity_level', 'moderate')).lower()
        goal = str(data.get('goal', 'maintain')).lower()

        # Validation
        if weight_kg <= 0 or height_cm <= 0 or age <= 0:
            return Response(
                {"error": "Please provide valid weight, height, and age."},
                status=status.HTTP_400_BAD_REQUEST
            )
        if age < 5 or age > 120:
            return Response(
                {"error": "Age must be between 5 and 120."},
                status=status.HTTP_400_BAD_REQUEST
            )
        if gender not in ['male', 'female']:
            return Response(
                {"error": "Gender must be 'male' or 'female'."},
                status=status.HTTP_400_BAD_REQUEST
            )
        if activity_level not in ACTIVITY_MULTIPLIERS:
            return Response(
                {"error": f"Activity level must be one of: {list(ACTIVITY_MULTIPLIERS.keys())}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        if goal not in ['lose', 'maintain', 'gain']:
            return Response(
                {"error": "Goal must be 'lose', 'maintain', or 'gain'."},
                status=status.HTTP_400_BAD_REQUEST
            )

        diet_preference = str(data.get('diet_preference', 'none')).lower()

        # Calculations
        bmi_data = calculate_bmi(weight_kg, height_cm)
        bmr = round(calculate_bmr(weight_kg, height_cm, age, gender))
        tdee = round(calculate_tdee(bmr, activity_level))
        calorie_data = calculate_calories_by_goal(tdee, goal)
        macros = calculate_macros(calorie_data['calories'], goal, weight_kg)
        water_data = calculate_water(weight_kg, activity_level)
        meal_plan = generate_meal_plan(
            calorie_data['calories'], goal,
            macros['protein_g'], macros['carbs_g'], macros['fat_g'],
            diet_preference=diet_preference,
            weight_kg=weight_kg,
            height_cm=height_cm,
            age=age,
            gender=gender
        )

        # Ideal weight range (BMI 18.5–24.9)
        height_m = height_cm / 100
        ideal_min = round(18.5 * (height_m ** 2), 1)
        ideal_max = round(24.9 * (height_m ** 2), 1)

        return Response({
            "input_summary": {
                "weight_kg": weight_kg,
                "height_cm": height_cm,
                "age": age,
                "gender": gender.capitalize(),
                "activity_level": ACTIVITY_LABELS.get(activity_level, activity_level),
                "goal": goal,
            },
            "bmi": bmi_data,
            "ideal_weight_range_kg": {"min": ideal_min, "max": ideal_max},
            "bmr": bmr,
            "tdee": tdee,
            "calories": calorie_data,
            "macros": macros,
            "water": water_data,
            "meal_plan": meal_plan,
        })

    except (ValueError, TypeError) as e:
        return Response(
            {"error": f"Invalid input: {str(e)}"},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['POST'])
def calculate_water_view(request):
    """POST /api/calculate/water-intake/"""
    try:
        data = request.data
        weight_kg = float(data.get('weight_kg', 0))
        activity_level = str(data.get('activity_level', 'moderate')).lower()

        if weight_kg <= 0:
            return Response(
                {"error": "Weight must be a positive value."},
                status=status.HTTP_400_BAD_REQUEST
            )

        result = calculate_water(weight_kg, activity_level)
        return Response(result)

    except (ValueError, TypeError) as e:
        return Response(
            {"error": f"Invalid input: {str(e)}"},
            status=status.HTTP_400_BAD_REQUEST
        )
