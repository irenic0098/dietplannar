from django.db import models
from accounts.models import User


class Post(models.Model):
    CATEGORIES = [
        ('recipe', 'Recipe'),
        ('tip', 'Health Tip'),
        ('motivation', 'Motivation'),
        ('question', 'Question'),
    ]
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    title = models.CharField(max_length=300)
    content = models.TextField()
    category = models.CharField(max_length=20, choices=CATEGORIES, default='tip')
    likes = models.ManyToManyField(User, blank=True, related_name='liked_posts')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title

    @property
    def like_count(self):
        return self.likes.count()


class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"Comment by {self.author.username} on {self.post.title}"


class Dietician(models.Model):
    name = models.CharField(max_length=200)
    specialization = models.CharField(max_length=200)
    experience_years = models.PositiveIntegerField(default=1)
    rating = models.FloatField(default=4.5)
    bio = models.TextField()
    avatar = models.ImageField(upload_to='dieticians/', null=True, blank=True)
    fee_per_session = models.FloatField(default=500)
    available_days = models.CharField(max_length=200, default='Mon,Tue,Wed,Thu,Fri')
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class Appointment(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='appointments')
    dietician = models.ForeignKey(Dietician, on_delete=models.CASCADE, related_name='appointments')
    appointment_date = models.DateField()
    appointment_time = models.TimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-appointment_date']

    def __str__(self):
        return f"{self.user.email} with {self.dietician.name} on {self.appointment_date}"
