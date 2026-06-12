"""
Seed script to populate the database with:
- Food categories and 100+ foods
- Sample dieticians
- Sample admin user

Run: python manage.py shell < seed_data.py
OR:  python seed_data.py (from backend directory)
"""

import os, sys, django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dietplanner.settings')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
django.setup()

from food.models import Food, FoodCategory
from community.models import Dietician
from accounts.models import User

print("Seeding database...")

# ── Food Categories ───────────────────────────────────────────────────────
categories_data = [
    ('Fruits', '🍎'), ('Vegetables', '🥦'), ('Grains & Cereals', '🌾'),
    ('Dairy & Eggs', '🥛'), ('Meat & Poultry', '🍗'), ('Fish & Seafood', '🐟'),
    ('Legumes & Pulses', '🫘'), ('Nuts & Seeds', '🥜'), ('Beverages', '🥤'),
    ('Snacks', '🍿'), ('Oils & Fats', '🫙'), ('Sweets & Desserts', '🍮'),
]

cats = {}
for name, icon in categories_data:
    cat, _ = FoodCategory.objects.get_or_create(name=name, defaults={'icon': icon})
    cats[name] = cat
print(f"✅ {len(cats)} food categories seeded.")

# ── Foods ─────────────────────────────────────────────────────────────────
foods_data = [
    # (name, cat, cal, prot, carb, fat, fiber, veg, vegan, gf, diab, keto, cost)
    # Fruits
    ('Apple', 'Fruits', 52, 0.3, 14, 0.2, 2.4, True, True, True, True, False, 20),
    ('Banana', 'Fruits', 89, 1.1, 23, 0.3, 2.6, True, True, True, False, False, 10),
    ('Orange', 'Fruits', 47, 0.9, 12, 0.1, 2.4, True, True, True, True, False, 15),
    ('Mango', 'Fruits', 60, 0.8, 15, 0.4, 1.6, True, True, True, False, False, 25),
    ('Papaya', 'Fruits', 43, 0.5, 11, 0.4, 1.7, True, True, True, True, False, 20),
    ('Watermelon', 'Fruits', 30, 0.6, 8, 0.2, 0.4, True, True, True, True, False, 15),
    ('Grapes', 'Fruits', 69, 0.7, 18, 0.2, 0.9, True, True, True, False, False, 40),
    ('Strawberry', 'Fruits', 32, 0.7, 8, 0.3, 2.0, True, True, True, True, True, 80),
    ('Blueberry', 'Fruits', 57, 0.7, 14, 0.3, 2.4, True, True, True, True, True, 100),
    ('Pineapple', 'Fruits', 50, 0.5, 13, 0.1, 1.4, True, True, True, False, False, 30),
    # Vegetables
    ('Spinach', 'Vegetables', 23, 2.9, 3.6, 0.4, 2.2, True, True, True, True, True, 20),
    ('Broccoli', 'Vegetables', 35, 2.4, 7, 0.4, 2.6, True, True, True, True, True, 40),
    ('Tomato', 'Vegetables', 18, 0.9, 3.9, 0.2, 1.2, True, True, True, True, True, 20),
    ('Carrot', 'Vegetables', 41, 0.9, 10, 0.2, 2.8, True, True, True, True, False, 15),
    ('Cucumber', 'Vegetables', 16, 0.7, 3.6, 0.1, 0.5, True, True, True, True, True, 15),
    ('Onion', 'Vegetables', 40, 1.1, 9.3, 0.1, 1.7, True, True, True, True, False, 10),
    ('Garlic', 'Vegetables', 149, 6.4, 33, 0.5, 2.1, True, True, True, True, False, 30),
    ('Bell Pepper', 'Vegetables', 31, 1.0, 6, 0.3, 2.1, True, True, True, True, True, 30),
    ('Cauliflower', 'Vegetables', 25, 1.9, 5, 0.3, 2.0, True, True, True, True, True, 30),
    ('Sweet Potato', 'Vegetables', 86, 1.6, 20, 0.1, 3.0, True, True, True, False, False, 20),
    ('Mushroom', 'Vegetables', 22, 3.1, 3.3, 0.3, 1.0, True, True, True, True, True, 60),
    ('Beetroot', 'Vegetables', 43, 1.6, 10, 0.2, 2.8, True, True, True, True, False, 20),
    ('Pumpkin', 'Vegetables', 26, 1.0, 6.5, 0.1, 0.5, True, True, True, True, False, 15),
    ('Bottle Gourd (Lauki)', 'Vegetables', 14, 0.6, 3.4, 0.1, 0.5, True, True, True, True, True, 10),
    # Grains
    ('Brown Rice (cooked)', 'Grains & Cereals', 216, 5, 45, 1.8, 3.5, True, True, True, False, False, 10),
    ('White Rice (cooked)', 'Grains & Cereals', 206, 4.3, 44, 0.4, 0.6, True, True, True, False, False, 8),
    ('Oatmeal (cooked)', 'Grains & Cereals', 158, 5.9, 27, 3.6, 4.0, True, True, True, True, False, 12),
    ('Whole Wheat Bread', 'Grains & Cereals', 247, 9, 43, 3.4, 7.0, True, True, False, False, False, 15),
    ('Quinoa (cooked)', 'Grains & Cereals', 222, 8, 39, 3.6, 5.2, True, True, True, True, False, 50),
    ('Roti (whole wheat)', 'Grains & Cereals', 120, 3.5, 22, 2.0, 2.5, True, True, False, False, False, 5),
    ('Poha (cooked)', 'Grains & Cereals', 180, 3.5, 38, 2.0, 1.0, True, True, True, False, False, 8),
    ('Upma (cooked)', 'Grains & Cereals', 200, 4, 32, 6, 2.0, True, True, False, False, False, 10),
    ('Corn (boiled)', 'Grains & Cereals', 130, 4.7, 29, 2.1, 2.4, True, True, True, False, False, 15),
    ('Barley (cooked)', 'Grains & Cereals', 193, 3.5, 44, 0.7, 6.0, True, True, False, True, False, 15),
    # Dairy & Eggs
    ('Whole Milk (250ml)', 'Dairy & Eggs', 149, 8, 11.5, 8, 0, True, False, True, False, False, 15),
    ('Skim Milk (250ml)', 'Dairy & Eggs', 83, 8, 12, 0.2, 0, True, False, True, True, False, 15),
    ('Greek Yogurt (170g)', 'Dairy & Eggs', 100, 17, 6, 0.7, 0, True, False, True, True, False, 50),
    ('Curd / Dahi (100g)', 'Dairy & Eggs', 98, 3.5, 5, 4.3, 0, True, False, True, True, False, 10),
    ('Egg (boiled)', 'Dairy & Eggs', 78, 6.3, 0.6, 5.3, 0, True, False, True, True, True, 10),
    ('Paneer (100g)', 'Dairy & Eggs', 265, 18.3, 1.2, 20.8, 0, True, False, True, True, True, 60),
    ('Cheese (cheddar, 30g)', 'Dairy & Eggs', 120, 7, 0.4, 10, 0, True, False, True, True, True, 40),
    ('Butter (10g)', 'Dairy & Eggs', 72, 0.1, 0, 8.1, 0, True, False, True, True, True, 10),
    # Meat & Poultry
    ('Chicken Breast (cooked, 100g)', 'Meat & Poultry', 165, 31, 0, 3.6, 0, False, False, True, True, True, 120),
    ('Chicken Thigh (cooked, 100g)', 'Meat & Poultry', 209, 26, 0, 10.9, 0, False, False, True, True, True, 100),
    ('Egg Omelette (2 eggs)', 'Dairy & Eggs', 190, 14, 2, 14, 0, True, False, True, True, True, 20),
    ('Lean Beef (100g)', 'Meat & Poultry', 250, 26, 0, 15, 0, False, False, True, True, True, 200),
    ('Turkey Breast (100g)', 'Meat & Poultry', 135, 30, 0, 1, 0, False, False, True, True, True, 150),
    # Fish
    ('Salmon (100g)', 'Fish & Seafood', 208, 20, 0, 13, 0, False, False, True, True, True, 300),
    ('Tuna (canned, 100g)', 'Fish & Seafood', 116, 26, 0, 1, 0, False, False, True, True, True, 100),
    ('Rohu Fish (100g)', 'Fish & Seafood', 97, 17, 0, 2.7, 0, False, False, True, True, True, 150),
    ('Sardines (100g)', 'Fish & Seafood', 208, 25, 0, 11, 0, False, False, True, True, True, 80),
    ('Prawns (100g)', 'Fish & Seafood', 99, 24, 0.2, 0.3, 0, False, False, True, True, True, 250),
    # Legumes
    ('Moong Dal (cooked, 100g)', 'Legumes & Pulses', 105, 7, 19, 0.4, 7.6, True, True, True, True, False, 15),
    ('Masoor Dal (cooked, 100g)', 'Legumes & Pulses', 116, 9, 20, 0.4, 7.9, True, True, True, True, False, 12),
    ('Chana Dal (cooked, 100g)', 'Legumes & Pulses', 164, 9, 27, 2.7, 7.6, True, True, True, True, False, 15),
    ('Rajma (cooked, 100g)', 'Legumes & Pulses', 127, 8.7, 22.8, 0.5, 6.4, True, True, True, True, False, 20),
    ('Chickpeas (cooked, 100g)', 'Legumes & Pulses', 164, 8.9, 27, 2.6, 7.6, True, True, True, True, False, 25),
    ('Black Bean (cooked, 100g)', 'Legumes & Pulses', 132, 8.9, 24, 0.5, 8.7, True, True, True, True, False, 20),
    ('Tofu (100g)', 'Legumes & Pulses', 76, 8, 1.9, 4.8, 0.3, True, True, True, True, True, 50),
    ('Soybean (cooked, 100g)', 'Legumes & Pulses', 173, 16.6, 9.9, 9, 6, True, True, True, True, False, 30),
    # Nuts & Seeds
    ('Almonds (30g)', 'Nuts & Seeds', 174, 6.3, 6, 15, 3.5, True, True, True, True, True, 60),
    ('Walnuts (30g)', 'Nuts & Seeds', 196, 4.6, 4.1, 19.6, 2, True, True, True, True, True, 80),
    ('Peanuts (30g)', 'Nuts & Seeds', 170, 7.7, 5, 14.7, 2.4, True, True, True, True, True, 20),
    ('Cashews (30g)', 'Nuts & Seeds', 163, 4.3, 9.2, 13.1, 0.9, True, True, True, False, False, 60),
    ('Flaxseeds (1 tbsp)', 'Nuts & Seeds', 55, 1.9, 3, 4.3, 2.8, True, True, True, True, True, 10),
    ('Chia Seeds (1 tbsp)', 'Nuts & Seeds', 58, 2, 5, 3.7, 4, True, True, True, True, True, 30),
    ('Pumpkin Seeds (30g)', 'Nuts & Seeds', 163, 8.5, 4.2, 13.9, 1.1, True, True, True, True, True, 40),
    ('Sunflower Seeds (30g)', 'Nuts & Seeds', 175, 5.5, 7.4, 14.9, 3, True, True, True, True, True, 25),
    # Beverages
    ('Green Tea (1 cup)', 'Beverages', 2, 0, 0.5, 0, 0, True, True, True, True, True, 5),
    ('Black Coffee (1 cup)', 'Beverages', 5, 0.3, 0, 0, 0, True, True, True, True, True, 10),
    ('Coconut Water (250ml)', 'Beverages', 45, 1.7, 9, 0.5, 2.6, True, True, True, True, False, 30),
    ('Orange Juice (250ml)', 'Beverages', 112, 1.7, 26, 0.5, 0.5, True, True, True, False, False, 30),
    ('Almond Milk (250ml)', 'Beverages', 39, 1.5, 3.5, 2.5, 0.5, True, True, True, True, True, 40),
    ('Buttermilk/Chaas (250ml)', 'Beverages', 40, 3.2, 4.8, 0.9, 0, True, False, True, True, False, 10),
    # Oils & Fats
    ('Olive Oil (1 tbsp)', 'Oils & Fats', 119, 0, 0, 13.5, 0, True, True, True, True, True, 20),
    ('Coconut Oil (1 tbsp)', 'Oils & Fats', 121, 0, 0, 13.5, 0, True, True, True, True, True, 15),
    ('Mustard Oil (1 tbsp)', 'Oils & Fats', 124, 0, 0, 14, 0, True, True, True, True, True, 8),
    ('Ghee (1 tbsp)', 'Oils & Fats', 112, 0, 0, 12.7, 0, True, False, True, True, True, 20),
    # Snacks
    ('Protein Bar (50g)', 'Snacks', 200, 15, 22, 7, 2, True, False, False, False, False, 80),
    ('Popcorn (30g, plain)', 'Snacks', 110, 3, 21, 1.3, 3.6, True, True, True, False, False, 15),
    ('Hummus (100g)', 'Snacks', 166, 7.9, 14, 9.6, 6, True, True, True, True, False, 60),
    ('Dark Chocolate (30g)', 'Snacks', 155, 2.2, 17, 9.1, 3.1, True, True, True, False, True, 40),
    ('Rice Cakes (2 pieces)', 'Snacks', 70, 1.5, 14, 0.5, 0.4, True, True, True, False, False, 15),
    ('Makhana Fox Nuts (30g)', 'Snacks', 107, 3.8, 21, 0.1, 0.4, True, True, True, True, False, 40),
    # Sweets
    ('Jalebi (1 piece, 50g)', 'Sweets & Desserts', 150, 0.5, 36, 0.8, 0.2, True, True, False, False, False, 10),
    ('Kheer (100g)', 'Sweets & Desserts', 180, 4, 28, 6, 0.2, True, False, True, False, False, 20),
    ('Rasgulla (1 piece)', 'Sweets & Desserts', 106, 2.2, 22, 0.9, 0, True, False, True, False, False, 15),
]

Food.objects.all().delete()
created = 0
for row in foods_data:
    name, cat_name, cal, prot, carb, fat, fiber, veg, vgn, gf, diab, keto, cost = row
    Food.objects.create(
        name=name,
        category=cats.get(cat_name),
        calories=cal, protein_g=prot, carbs_g=carb, fat_g=fat, fiber_g=fiber,
        is_vegetarian=veg, is_vegan=vgn, is_gluten_free=gf,
        is_diabetic_friendly=diab, is_keto=keto, cost_inr=cost,
        serving_size_g=100,
    )
    created += 1

print(f"✅ {created} foods seeded.")

# ── Dieticians ───────────────────────────────────────────────────────────
Dietician.objects.all().delete()
dieticians = [
    {'name': 'Dr. Priya Sharma', 'specialization': 'Weight Management & Sports Nutrition', 'experience_years': 8, 'rating': 4.9, 'bio': 'Expert in personalized weight management with 8+ years of clinical experience.', 'fee_per_session': 800, 'available_days': 'Mon,Wed,Fri'},
    {'name': 'Dr. Arjun Mehta', 'specialization': 'Diabetic Diet & Gut Health', 'experience_years': 12, 'rating': 4.8, 'bio': 'Specializes in diabetes management and microbiome nutrition.', 'fee_per_session': 1200, 'available_days': 'Tue,Thu,Sat'},
    {'name': 'Ms. Kavya Reddy', 'specialization': 'Vegan & Plant-Based Nutrition', 'experience_years': 5, 'rating': 4.7, 'bio': 'Passionate about plant-based diets for optimal health and sustainability.', 'fee_per_session': 600, 'available_days': 'Mon,Tue,Wed,Thu'},
    {'name': 'Dr. Rohit Verma', 'specialization': 'Pediatric & Family Nutrition', 'experience_years': 10, 'rating': 4.8, 'bio': 'Helping families build healthy eating habits from childhood.', 'fee_per_session': 1000, 'available_days': 'Mon,Wed,Thu,Fri'},
    {'name': 'Ms. Sneha Patel', 'specialization': 'PCOS, Thyroid & Hormonal Balance', 'experience_years': 6, 'rating': 4.9, 'bio': 'Expert in hormonal nutrition disorders with functional medicine approach.', 'fee_per_session': 900, 'available_days': 'Tue,Wed,Fri,Sat'},
]
for d in dieticians:
    Dietician.objects.create(**d)
print(f"✅ {len(dieticians)} dieticians seeded.")

# ── Admin User ───────────────────────────────────────────────────────────
if not User.objects.filter(email='admin@dietplanner.com').exists():
    User.objects.create_superuser(
        username='admin',
        email='admin@dietplanner.com',
        password='admin123',
    )
    print("✅ Admin user created: admin@dietplanner.com / admin123")
else:
    print("✅ Admin user already exists.")

print("\n🎉 Database seeded successfully!")
