from rest_framework import serializers
from .models import HealthReport, NutritionDeficiency


class HealthReportSerializer(serializers.ModelSerializer):
    report_type_display = serializers.CharField(source='get_report_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = HealthReport
        fields = [
            'id', 'title', 'report_type', 'report_type_display',
            'file', 'file_url', 'status', 'status_display',
            'ai_summary', 'ai_deficiencies', 'ai_recommendations', 'ai_risk_level',
            'notes', 'report_date', 'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'status', 'ai_summary', 'ai_deficiencies',
            'ai_recommendations', 'ai_risk_level', 'created_at', 'updated_at',
        ]


class NutritionDeficiencySerializer(serializers.ModelSerializer):
    class Meta:
        model = NutritionDeficiency
        fields = [
            'id', 'nutrient', 'current_value', 'recommended_value', 'unit',
            'severity', 'food_sources', 'detected_at', 'is_resolved', 'resolved_at',
        ]
        read_only_fields = ['id', 'detected_at']
