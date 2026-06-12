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


def generate_meal_plan(calories: int, goal: str, protein_g: int, carbs_g: int, fat_g: int) -> list:
    """Generate a sample meal breakdown with food suggestions."""

    # Meal splits (approximate)
    breakfast_pct = 0.25
    lunch_pct = 0.35
    dinner_pct = 0.30
    snack_pct = 0.10

    def meal_macros(pct):
        return {
            "calories": round(calories * pct),
            "protein_g": round(protein_g * pct),
            "carbs_g": round(carbs_g * pct),
            "fat_g": round(fat_g * pct),
        }

    # Food suggestions based on goal
    if goal == "lose":
        breakfast_foods = ["2 boiled eggs", "1 cup oatmeal", "1 apple", "Green tea"]
        lunch_foods = ["Grilled chicken breast (150g)", "Brown rice (½ cup)", "Mixed salad", "Cucumber slices"]
        dinner_foods = ["Baked salmon (120g)", "Steamed broccoli", "Quinoa (½ cup)", "Lemon water"]
        snack_foods = ["Greek yogurt (low fat)", "A handful of almonds", "1 banana"]
    elif goal == "gain":
        breakfast_foods = ["3 scrambled eggs", "Whole wheat toast (2 slices)", "Peanut butter (1 tbsp)", "Banana", "Whole milk (1 cup)"]
        lunch_foods = ["Chicken breast (200g)", "White rice (1 cup)", "Sweet potato", "Olive oil dressing"]
        dinner_foods = ["Lean beef (180g)", "Mashed potatoes", "Mixed vegetables", "Glass of milk"]
        snack_foods = ["Protein shake", "Mixed nuts (30g)", "Cheese slice", "Whole fruit"]
    else:
        breakfast_foods = ["2 eggs any style", "Whole grain toast", "1 fruit of choice", "Coffee or tea"]
        lunch_foods = ["Grilled chicken or fish (150g)", "Mixed greens salad", "Whole wheat pita", "Olive oil & vinegar"]
        dinner_foods = ["Lean protein (150g)", "Roasted vegetables", "Brown rice or quinoa", "Herbal tea"]
        snack_foods = ["Mixed nuts (20g)", "Low-fat yogurt", "Seasonal fruit"]

    return [
        {
            "name": "Breakfast",
            "time": "7:00 – 8:00 AM",
            "icon": "🌅",
            **meal_macros(breakfast_pct),
            "foods": breakfast_foods,
        },
        {
            "name": "Lunch",
            "time": "12:00 – 1:00 PM",
            "icon": "☀️",
            **meal_macros(lunch_pct),
            "foods": lunch_foods,
        },
        {
            "name": "Dinner",
            "time": "7:00 – 8:00 PM",
            "icon": "🌙",
            **meal_macros(dinner_pct),
            "foods": dinner_foods,
        },
        {
            "name": "Snacks",
            "time": "Between meals",
            "icon": "🍎",
            **meal_macros(snack_pct),
            "foods": snack_foods,
        },
    ]


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

        # Calculations
        bmi_data = calculate_bmi(weight_kg, height_cm)
        bmr = round(calculate_bmr(weight_kg, height_cm, age, gender))
        tdee = round(calculate_tdee(bmr, activity_level))
        calorie_data = calculate_calories_by_goal(tdee, goal)
        macros = calculate_macros(calorie_data['calories'], goal, weight_kg)
        water_data = calculate_water(weight_kg, activity_level)
        meal_plan = generate_meal_plan(
            calorie_data['calories'], goal,
            macros['protein_g'], macros['carbs_g'], macros['fat_g']
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
