from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    GENDER_CHOICES = [('male', 'Male'), ('female', 'Female'), ('other', 'Other')]
    ACTIVITY_CHOICES = [
        ('sedentary', 'Sedentary'),
        ('light', 'Lightly Active'),
        ('moderate', 'Moderately Active'),
        ('active', 'Very Active'),
        ('very_active', 'Extra Active'),
    ]
    GOAL_CHOICES = [
        ('lose', 'Lose Weight'),
        ('maintain', 'Maintain Weight'),
        ('gain', 'Gain Muscle'),
        ('healthy', 'Healthy Eating'),
    ]
    DIET_CHOICES = [
        ('none', 'No Preference'),
        ('vegetarian', 'Vegetarian'),
        ('vegan', 'Vegan'),
        ('gluten_free', 'Gluten-Free'),
        ('diabetic', 'Diabetic-Friendly'),
        ('keto', 'Ketogenic'),
    ]

    email = models.EmailField(unique=True)
    age = models.PositiveIntegerField(null=True, blank=True)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, default='male')
    height_cm = models.FloatField(null=True, blank=True, help_text='Height in centimeters')
    weight_kg = models.FloatField(null=True, blank=True, help_text='Weight in kilograms')
    activity_level = models.CharField(max_length=20, choices=ACTIVITY_CHOICES, default='moderate')
    goal = models.CharField(max_length=20, choices=GOAL_CHOICES, default='maintain')
    diet_preference = models.CharField(max_length=20, choices=DIET_CHOICES, default='none')
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    bio = models.TextField(blank=True)
    target_weight_kg = models.FloatField(null=True, blank=True)
    budget_per_day = models.FloatField(null=True, blank=True, help_text='Daily food budget in INR')
    language = models.CharField(max_length=5, default='en', choices=[('en', 'English'), ('hi', 'Hindi')])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email

    @property
    def bmi(self):
        if self.height_cm and self.weight_kg:
            h = self.height_cm / 100
            return round(self.weight_kg / (h * h), 1)
        return None
