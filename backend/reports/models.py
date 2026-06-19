from django.db import models
from accounts.models import User


class HealthReport(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending Analysis'
        PROCESSING = 'processing', 'Processing'
        COMPLETED = 'completed', 'Completed'
        FAILED = 'failed', 'Failed'

    class ReportType(models.TextChoices):
        BLOOD_TEST = 'blood_test', 'Blood Test'
        BODY_COMPOSITION = 'body_composition', 'Body Composition'
        CHOLESTEROL = 'cholesterol', 'Cholesterol Panel'
        THYROID = 'thyroid', 'Thyroid Panel'
        VITAMIN = 'vitamin', 'Vitamin Panel'
        GENERAL = 'general', 'General Health Report'
        OTHER = 'other', 'Other'

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='health_reports')
    title = models.CharField(max_length=200)
    report_type = models.CharField(max_length=30, choices=ReportType.choices, default=ReportType.GENERAL)
    file = models.FileField(upload_to='health_reports/', null=True, blank=True)
    file_url = models.URLField(blank=True, help_text='Cloudinary URL after upload')

    # Raw extracted text (from PDF/image)
    extracted_text = models.TextField(blank=True)

    # AI-generated analysis
    ai_summary = models.TextField(blank=True)
    ai_deficiencies = models.JSONField(default=list, blank=True)
    ai_recommendations = models.JSONField(default=list, blank=True)
    ai_risk_level = models.CharField(
        max_length=20,
        choices=[('low', 'Low'), ('medium', 'Medium'), ('high', 'High')],
        blank=True
    )

    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    notes = models.TextField(blank=True)
    report_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email} — {self.title} ({self.status})"


class NutritionDeficiency(models.Model):
    """Stores detected nutrition deficiencies from tracking data or reports."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='deficiencies')
    nutrient = models.CharField(max_length=100)
    current_value = models.FloatField(null=True, blank=True)
    recommended_value = models.FloatField(null=True, blank=True)
    unit = models.CharField(max_length=20, default='mg')
    severity = models.CharField(
        max_length=10,
        choices=[('mild', 'Mild'), ('moderate', 'Moderate'), ('severe', 'Severe')],
        default='mild'
    )
    food_sources = models.JSONField(default=list)
    detected_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    is_resolved = models.BooleanField(default=False)

    class Meta:
        ordering = ['-detected_at']

    def __str__(self):
        return f"{self.user.email} — {self.nutrient} deficiency ({self.severity})"
