from django.db import models


class FoodCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    icon = models.CharField(max_length=10, default='🍽️')

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = 'Food Categories'


class Food(models.Model):
    DIET_TAGS = [
        ('vegetarian', 'Vegetarian'),
        ('vegan', 'Vegan'),
        ('gluten_free', 'Gluten-Free'),
        ('diabetic', 'Diabetic-Friendly'),
        ('keto', 'Ketogenic'),
        ('none', 'No Restriction'),
    ]

    name = models.CharField(max_length=200)
    category = models.ForeignKey(FoodCategory, on_delete=models.SET_NULL, null=True, related_name='foods')
    serving_size_g = models.FloatField(default=100, help_text='Serving size in grams')
    serving_description = models.CharField(max_length=100, default='100g', help_text='e.g. 1 cup, 1 piece')

    # Macronutrients per serving
    calories = models.FloatField(default=0)
    protein_g = models.FloatField(default=0)
    carbs_g = models.FloatField(default=0)
    fat_g = models.FloatField(default=0)
    fiber_g = models.FloatField(default=0)
    sugar_g = models.FloatField(default=0)

    # Micronutrients
    vitamin_c_mg = models.FloatField(default=0)
    vitamin_a_iu = models.FloatField(default=0)
    calcium_mg = models.FloatField(default=0)
    iron_mg = models.FloatField(default=0)
    potassium_mg = models.FloatField(default=0)
    sodium_mg = models.FloatField(default=0)

    # Tags
    is_vegetarian = models.BooleanField(default=False)
    is_vegan = models.BooleanField(default=False)
    is_gluten_free = models.BooleanField(default=False)
    is_diabetic_friendly = models.BooleanField(default=False)
    is_keto = models.BooleanField(default=False)

    # Budget (approx cost per serving in INR)
    cost_inr = models.FloatField(default=10)

    # Custom food by user
    added_by = models.ForeignKey('accounts.User', on_delete=models.SET_NULL,
                                  null=True, blank=True, related_name='custom_foods')
    is_custom = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.calories} kcal / {self.serving_description})"

    class Meta:
        ordering = ['name']
