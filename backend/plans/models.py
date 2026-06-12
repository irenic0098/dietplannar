from django.db import models
from accounts.models import User


class DietPlan(models.Model):
    GOAL_CHOICES = [
        ('lose', 'Lose Weight'), ('maintain', 'Maintain'), ('gain', 'Gain Muscle'), ('healthy', 'Healthy Eating'),
    ]
    DIET_CHOICES = [
        ('none', 'No Preference'),
        ('vegetarian', 'Vegetarian'),
        ('vegan', 'Vegan'),
        ('gluten_free', 'Gluten-Free'),
        ('diabetic', 'Diabetic-Friendly'),
        ('keto', 'Ketogenic'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='diet_plans')
    name = models.CharField(max_length=200, default='My Diet Plan')
    goal = models.CharField(max_length=20, choices=GOAL_CHOICES)
    diet_preference = models.CharField(max_length=20, choices=DIET_CHOICES, default='none')
    target_calories = models.IntegerField()
    protein_g = models.FloatField()
    carbs_g = models.FloatField()
    fat_g = models.FloatField()
    water_liters = models.FloatField(default=2.0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email} - {self.name}"


class MealSlot(models.Model):
    MEAL_TYPES = [
        ('breakfast', 'Breakfast'), ('lunch', 'Lunch'), ('dinner', 'Dinner'), ('snack', 'Snack'),
    ]
    plan = models.ForeignKey(DietPlan, on_delete=models.CASCADE, related_name='meal_slots')
    meal_type = models.CharField(max_length=20, choices=MEAL_TYPES)
    time_suggestion = models.CharField(max_length=50, default='')
    target_calories = models.IntegerField(default=0)
    foods = models.JSONField(default=list)  # List of food suggestion strings
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ['id']
