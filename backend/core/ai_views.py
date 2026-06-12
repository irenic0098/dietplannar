import random
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response

# ─── AI Chatbot Knowledge Base ──────────────────────────────────────────────
CHATBOT_KB = [
    {"keywords": ["bmi", "body mass index"], "answer": "BMI (Body Mass Index) is a measure of body fat based on height and weight. BMI = weight(kg) / height(m)². Normal BMI is 18.5–24.9. Use our BMI Calculator above to check yours!"},
    {"keywords": ["calorie", "kcal", "how many calories"], "answer": "Your daily calorie needs depend on your BMR (basal metabolic rate) × activity multiplier. An average adult needs 1800–2500 kcal/day. Use our Diet Plan Generator for a personalized number!"},
    {"keywords": ["protein", "how much protein"], "answer": "For general health: 0.8g per kg of body weight. For muscle gain: 1.6–2.2g/kg. For weight loss: 1.5–2.0g/kg. Protein helps preserve muscle while losing fat."},
    {"keywords": ["water", "hydration", "how much water", "drink"], "answer": "A general rule is 35ml per kg of body weight. For a 70kg person, that's about 2.45 liters (≈10 glasses) per day. Increase intake during exercise or hot weather."},
    {"keywords": ["lose weight", "weight loss", "fat loss"], "answer": "For weight loss: create a 500 kcal daily deficit (lose ~0.5kg/week). Focus on high-protein foods, fiber, and reduce processed sugar. Combine with 30 min of cardio 3–5x/week."},
    {"keywords": ["gain weight", "muscle", "bulk"], "answer": "To gain muscle: eat 300–500 kcal above your TDEE, prioritize protein (2.0–2.2g/kg), and do progressive resistance training 3–5x/week. Sleep 7–9 hours for recovery."},
    {"keywords": ["vegetarian", "vegan", "plant based"], "answer": "Vegetarian/vegan diets can meet all nutritional needs! Focus on: lentils, chickpeas, tofu, paneer (vegetarian), quinoa, nuts, seeds. Supplement B12 if fully vegan."},
    {"keywords": ["diabetes", "diabetic", "blood sugar"], "answer": "For diabetes management: prefer low-GI foods (whole grains, vegetables, legumes), avoid refined carbs and sugary drinks, eat small frequent meals, and monitor carb intake (aim for 45–60g/meal)."},
    {"keywords": ["breakfast", "morning meal"], "answer": "A healthy breakfast should include: protein (eggs, yogurt, nuts), complex carbs (oats, whole wheat), and fruit. Aim for 300–400 kcal. Avoid skipping breakfast — it kickstarts your metabolism."},
    {"keywords": ["fiber", "digestion"], "answer": "Aim for 25–38g of fiber per day. Good sources: vegetables, fruits, whole grains, legumes, flaxseeds. Fiber improves digestion, controls blood sugar, and promotes satiety."},
    {"keywords": ["vitamins", "micronutrients", "supplements"], "answer": "Key vitamins to track: Vitamin D (sunshine + fatty fish), Vitamin B12 (meat, dairy or supplement for vegans), Iron (red meat, spinach), Calcium (dairy, fortified foods). A balanced diet covers most needs."},
    {"keywords": ["keto", "ketogenic", "low carb"], "answer": "Keto diet: Very low carb (<50g/day), high fat (70%), moderate protein (25%). It promotes fat burning but may be hard to sustain. Not recommended for people with liver/kidney issues."},
    {"keywords": ["intermittent fasting", "fasting", "16:8"], "answer": "Intermittent fasting (e.g., 16:8) involves eating within an 8-hour window. It can aid weight loss by reducing overall calorie intake. Ensure you still meet all nutritional needs within your eating window."},
    {"keywords": ["sleep", "rest", "recovery"], "answer": "Sleep is crucial for weight management and muscle recovery. Poor sleep increases ghrelin (hunger hormone) and decreases leptin (fullness hormone). Aim for 7–9 hours of quality sleep."},
    {"keywords": ["exercise", "workout", "gym"], "answer": "For weight loss: 150–300 min of moderate cardio/week. For muscle gain: 3–5x strength training/week. Always combine nutrition with exercise for best results. Rest days are equally important!"},
    {"keywords": ["cholesterol", "heart"], "answer": "To improve cholesterol: reduce saturated fats (red meat, butter), increase omega-3s (fish, flaxseed, walnuts), eat more soluble fiber (oats, beans), and exercise regularly."},
    {"keywords": ["hello", "hi", "hey", "how are you"], "answer": "Hello! 👋 I'm your AI Nutrition Assistant. Ask me anything about diet, nutrition, BMI, calories, proteins, or healthy eating habits!"},
    {"keywords": ["thank", "thanks", "helpful"], "answer": "You're welcome! 😊 Remember, consistency is key in your nutrition journey. Feel free to ask anything else!"},
    {"keywords": ["meal plan", "diet plan"], "answer": "Use our Diet Plan Generator to get a personalized meal plan! Just enter your weight, height, age, activity level, and goal. I'll calculate your exact calorie and macro needs."},
    {"keywords": ["snack", "snacks", "healthy snacks"], "answer": "Healthy snack ideas: Greek yogurt with berries, handful of almonds, apple with peanut butter, boiled eggs, hummus with veggies, or a banana. Keep snacks under 200 kcal."},
]

def find_answer(message: str) -> str:
    message_lower = message.lower()
    for entry in CHATBOT_KB:
        if any(kw in message_lower for kw in entry['keywords']):
            return entry['answer']
    return ("I'm not sure about that specific question. Here are some topics I can help with:\n"
            "• BMI & weight assessment\n• Daily calorie needs\n• Protein & macro targets\n"
            "• Hydration guidance\n• Weight loss & gain tips\n• Diet types (vegan, keto, diabetic)\n"
            "• Meal planning & healthy snacks\n\nTry asking one of those! 🥗")


@api_view(['POST'])
@permission_classes([AllowAny])
def chatbot(request):
    message = request.data.get('message', '').strip()
    if not message:
        return Response({'error': 'Message is required.'}, status=400)
    answer = find_answer(message)
    return Response({'message': message, 'reply': answer})


# ─── AI Diet Recommendation ─────────────────────────────────────────────────
FOOD_RECOMMENDATIONS = {
    'lose': {
        'none': ['Grilled chicken breast', 'Brown rice', 'Steamed broccoli', 'Greek yogurt', 'Lentil soup', 'Oatmeal', 'Boiled eggs', 'Cucumber salad'],
        'vegetarian': ['Lentil soup', 'Paneer tikka', 'Quinoa salad', 'Greek yogurt', 'Vegetable stir-fry', 'Chickpea curry', 'Tofu scramble'],
        'vegan': ['Lentil soup', 'Tofu stir-fry', 'Quinoa bowl', 'Chickpea curry', 'Mixed nuts', 'Fruit smoothie', 'Brown rice with vegetables'],
        'gluten_free': ['Grilled salmon', 'Brown rice', 'Egg omelette', 'Greek yogurt', 'Sweet potato', 'Almond flour pancakes'],
        'diabetic': ['Grilled fish', 'Barley soup', 'Steamed vegetables', 'Greek yogurt', 'Mixed nuts', 'Low-GI fruits'],
        'keto': ['Grilled chicken', 'Avocado', 'Eggs', 'Almonds', 'Salmon', 'Cheese', 'Olive oil dressing'],
    },
    'gain': {
        'none': ['Whole milk', 'Chicken breast 200g', 'White rice', 'Peanut butter', 'Banana', 'Protein shake', 'Lean beef', 'Sweet potato'],
        'vegetarian': ['Paneer 200g', 'Whole milk', 'Eggs', 'Nuts mix', 'Brown rice', 'Banana', 'Chickpeas', 'Full-fat yogurt'],
        'vegan': ['Tofu 200g', 'Almond butter', 'Brown rice', 'Banana', 'Avocado', 'Lentils', 'Pumpkin seeds', 'Coconut milk'],
        'gluten_free': ['Eggs', 'Sweet potato', 'Brown rice', 'Chicken 200g', 'Almonds', 'Avocado', 'Greek yogurt'],
        'diabetic': ['Eggs', 'Chicken', 'Quinoa', 'Avocado', 'Nuts', 'Greek yogurt', 'Salmon'],
        'keto': ['Fatty steak', 'Eggs', 'Avocado', 'Coconut oil', 'Almonds', 'Cheese', 'Sardines'],
    },
    'maintain': {
        'none': ['Mixed grains bowl', 'Grilled protein', 'Seasonal vegetables', 'Fruit salad', 'Yogurt parfait'],
        'vegetarian': ['Paneer curry', 'Dal rice', 'Mixed vegetable sabzi', 'Curd', 'Fruit chaat'],
        'vegan': ['Dal chawal', 'Tofu curry', 'Mixed vegetables', 'Fruit bowl', 'Hummus'],
        'gluten_free': ['Rice bowl', 'Grilled chicken', 'Roasted vegetables', 'Yogurt', 'Fresh fruit'],
        'diabetic': ['Barley khichdi', 'Grilled fish', 'Salad', 'Low-fat yogurt', 'Berries'],
        'keto': ['Eggs', 'Avocado', 'Cheese', 'Nuts', 'Salmon', 'Olive oil veggies'],
    },
    'healthy': {
        'none': ['Rainbow salad', 'Grilled salmon', 'Whole grain toast', 'Mixed berries', 'Green smoothie'],
        'vegetarian': ['Spinach paneer', 'Quinoa salad', 'Vegetable soup', 'Mixed fruits', 'Yogurt'],
        'vegan': ['Green smoothie bowl', 'Lentil salad', 'Vegetable curry', 'Mixed nuts', 'Fruit platter'],
        'gluten_free': ['Grilled fish', 'Salad', 'Rice', 'Fruit', 'Yogurt'],
        'diabetic': ['Methi sabzi', 'Brown rice', 'Grilled chicken', 'Low sugar fruits', 'Nuts'],
        'keto': ['Avocado salad', 'Eggs', 'Salmon', 'Almonds', 'Leafy greens'],
    },
}


@api_view(['POST'])
@permission_classes([AllowAny])
def ai_recommend(request):
    goal = request.data.get('goal', 'maintain')
    diet = request.data.get('diet_preference', 'none')
    meal_type = request.data.get('meal_type', 'all')

    recs = FOOD_RECOMMENDATIONS.get(goal, FOOD_RECOMMENDATIONS['maintain'])
    foods = recs.get(diet, recs.get('none', []))

    random.shuffle(foods)
    top = foods[:6]

    return Response({
        'goal': goal,
        'diet_preference': diet,
        'recommended_foods': top,
        'tip': f"Based on your {goal} goal and {diet.replace('_', ' ')} preference, these foods are optimal for you!",
    })


# ─── AI Recipe Generator ────────────────────────────────────────────────────
RECIPES = [
    {
        'name': 'High-Protein Egg Bowl',
        'ingredients': ['3 eggs', 'spinach', 'tomato', 'onion', 'olive oil', 'salt', 'pepper'],
        'instructions': ['Heat olive oil in a pan.', 'Sauté onion and tomato for 2 min.', 'Add spinach, cook until wilted.', 'Crack eggs over veggies, scramble gently.', 'Season with salt and pepper. Serve hot!'],
        'calories': 320, 'protein_g': 22, 'carbs_g': 8, 'fat_g': 18,
        'tags': ['vegetarian', 'gluten_free', 'keto', 'high_protein'],
        'time_min': 10,
    },
    {
        'name': 'Lentil Power Soup',
        'ingredients': ['1 cup red lentils', 'carrot', 'onion', 'garlic', 'cumin', 'turmeric', 'vegetable broth'],
        'instructions': ['Sauté onion and garlic in a pot.', 'Add spices, stir for 1 min.', 'Add lentils, carrot, and broth.', 'Simmer 20 min until soft.', 'Blend partially for creamy texture. Serve warm.'],
        'calories': 280, 'protein_g': 18, 'carbs_g': 42, 'fat_g': 3,
        'tags': ['vegan', 'vegetarian', 'gluten_free', 'diabetic'],
        'time_min': 25,
    },
    {
        'name': 'Grilled Chicken & Quinoa Salad',
        'ingredients': ['150g chicken breast', '½ cup quinoa', 'cucumber', 'cherry tomatoes', 'olive oil', 'lemon juice', 'herbs'],
        'instructions': ['Cook quinoa in water for 15 min, cool.', 'Season chicken with herbs, grill 6 min each side.', 'Dice cucumber and halve tomatoes.', 'Combine quinoa, veggies, sliced chicken.', 'Dress with olive oil and lemon juice.'],
        'calories': 420, 'protein_g': 38, 'carbs_g': 32, 'fat_g': 12,
        'tags': ['gluten_free', 'high_protein', 'weight_loss'],
        'time_min': 30,
    },
    {
        'name': 'Avocado Egg Toast',
        'ingredients': ['2 eggs', '1 avocado', 'whole wheat bread', 'salt', 'chili flakes', 'lemon juice'],
        'instructions': ['Toast the bread slices.', 'Mash avocado with lemon juice, salt.', 'Poach or fry eggs to liking.', 'Spread avocado on toast.', 'Top with eggs and chili flakes.'],
        'calories': 380, 'protein_g': 16, 'carbs_g': 28, 'fat_g': 24,
        'tags': ['vegetarian', 'high_protein'],
        'time_min': 12,
    },
    {
        'name': 'Paneer Tikka Bowl',
        'ingredients': ['200g paneer', 'bell peppers', 'yogurt', 'tikka masala', 'brown rice', 'onion'],
        'instructions': ['Marinate paneer in yogurt + tikka masala for 30 min.', 'Skewer paneer and peppers, grill 10 min.', 'Cook brown rice separately.', 'Serve paneer tikka over rice with sliced onion.'],
        'calories': 480, 'protein_g': 28, 'carbs_g': 48, 'fat_g': 18,
        'tags': ['vegetarian', 'gluten_free', 'high_protein'],
        'time_min': 45,
    },
    {
        'name': 'Green Detox Smoothie',
        'ingredients': ['1 banana', 'spinach (handful)', '1 cup almond milk', 'chia seeds', 'honey', 'ginger'],
        'instructions': ['Add all ingredients to a blender.', 'Blend until smooth.', 'Add ice cubes if desired.', 'Serve immediately for best nutrition.'],
        'calories': 210, 'protein_g': 5, 'carbs_g': 38, 'fat_g': 6,
        'tags': ['vegan', 'vegetarian', 'gluten_free', 'diabetic'],
        'time_min': 5,
    },
    {
        'name': 'Oatmeal Power Bowl',
        'ingredients': ['1 cup oats', 'banana', 'mixed berries', 'peanut butter', 'honey', 'milk or almond milk'],
        'instructions': ['Cook oats with milk for 5 min, stirring.', 'Pour into bowl.', 'Top with sliced banana and berries.', 'Drizzle peanut butter and honey on top.'],
        'calories': 350, 'protein_g': 12, 'carbs_g': 52, 'fat_g': 10,
        'tags': ['vegetarian', 'high_fiber'],
        'time_min': 8,
    },
    {
        'name': 'Baked Salmon with Veggies',
        'ingredients': ['150g salmon fillet', 'broccoli', 'bell pepper', 'olive oil', 'garlic', 'lemon', 'herbs'],
        'instructions': ['Preheat oven to 200°C.', 'Place salmon and veggies on baking tray.', 'Drizzle olive oil, add garlic and herbs.', 'Bake 18–20 min until salmon flakes.', 'Squeeze lemon before serving.'],
        'calories': 390, 'protein_g': 34, 'carbs_g': 14, 'fat_g': 22,
        'tags': ['gluten_free', 'keto', 'high_protein', 'heart_healthy'],
        'time_min': 25,
    },
]


@api_view(['POST'])
@permission_classes([AllowAny])
def ai_recipe(request):
    ingredients = request.data.get('ingredients', [])
    diet = request.data.get('diet_preference', 'none')
    max_time = int(request.data.get('max_time_min', 60))

    filtered = RECIPES.copy()

    if diet and diet != 'none':
        filtered = [r for r in filtered if diet in r['tags']]

    if ingredients:
        ingredient_lower = [i.lower() for i in ingredients]
        scored = []
        for recipe in filtered:
            matches = sum(1 for ing in recipe['ingredients'] if any(i in ing.lower() for i in ingredient_lower))
            scored.append((matches, recipe))
        scored.sort(key=lambda x: -x[0])
        filtered = [r for _, r in scored]

    filtered = [r for r in filtered if r['time_min'] <= max_time]

    if not filtered:
        filtered = random.sample(RECIPES, min(3, len(RECIPES)))

    top = filtered[:3]
    return Response({'recipes': top, 'count': len(top)})
