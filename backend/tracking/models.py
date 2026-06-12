from django.db import models
from accounts.models import User
from food.models import Food


class WeightLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='weight_logs')
    weight_kg = models.FloatField()
    date = models.DateField()
    note = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date']
        unique_together = ['user', 'date']

    def __str__(self):
        return f"{self.user.email} - {self.weight_kg}kg on {self.date}"


class WaterLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='water_logs')
    date = models.DateField()
    glasses = models.PositiveIntegerField(default=0)
    target_glasses = models.PositiveIntegerField(default=8)
    ml_consumed = models.FloatField(default=0)

    class Meta:
        ordering = ['-date']
        unique_together = ['user', 'date']

    def __str__(self):
        return f"{self.user.email} - {self.glasses} glasses on {self.date}"


class FoodLog(models.Model):
    MEAL_CHOICES = [
        ('breakfast', 'Breakfast'),
        ('lunch', 'Lunch'),
        ('dinner', 'Dinner'),
        ('snack', 'Snack'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='food_logs')
    food = models.ForeignKey(Food, on_delete=models.SET_NULL, null=True)
    food_name = models.CharField(max_length=200)  # store name in case food deleted
    meal_type = models.CharField(max_length=20, choices=MEAL_CHOICES, default='lunch')
    date = models.DateField()
    quantity_g = models.FloatField(default=100)

    # Calculated at log time
    calories = models.FloatField(default=0)
    protein_g = models.FloatField(default=0)
    carbs_g = models.FloatField(default=0)
    fat_g = models.FloatField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date', '-created_at']

    def save(self, *args, **kwargs):
        if self.food:
            self.food_name = self.food.name
            ratio = self.quantity_g / self.food.serving_size_g
            self.calories = round(self.food.calories * ratio, 1)
            self.protein_g = round(self.food.protein_g * ratio, 1)
            self.carbs_g = round(self.food.carbs_g * ratio, 1)
            self.fat_g = round(self.food.fat_g * ratio, 1)
        super().save(*args, **kwargs)


class ExerciseLog(models.Model):
    EXERCISE_TYPES = [
        ('cardio', 'Cardio'),
        ('strength', 'Strength Training'),
        ('yoga', 'Yoga'),
        ('sports', 'Sports'),
        ('walking', 'Walking'),
        ('cycling', 'Cycling'),
        ('swimming', 'Swimming'),
        ('other', 'Other'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='exercise_logs')
    exercise_type = models.CharField(max_length=20, choices=EXERCISE_TYPES, default='cardio')
    name = models.CharField(max_length=200)
    duration_minutes = models.PositiveIntegerField()
    calories_burned = models.FloatField(default=0)
    date = models.DateField()
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date']

    def __str__(self):
        return f"{self.user.email} - {self.name} on {self.date}"
