"""Report analysis service using Gemini AI."""
import logging
from django.conf import settings

logger = logging.getLogger('dietplanner')


class ReportAnalysisService:
    @staticmethod
    def analyze(report):
        """Run AI analysis on a HealthReport object."""
        try:
            report.status = 'processing'
            report.save(update_fields=['status'])

            api_key = settings.GEMINI_API_KEY
            if not api_key:
                ReportAnalysisService._fallback_analysis(report)
                return

            import google.generativeai as genai
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel('gemini-1.5-flash')

            text_to_analyze = report.extracted_text or report.notes or report.title
            prompt = f"""
You are a clinical nutritionist AI. Analyze this health report and provide:
1. A brief summary (2-3 sentences)
2. Key nutrient deficiencies found (as JSON array of strings)
3. Dietary recommendations (as JSON array of strings)
4. Risk level (low/medium/high)

Report: {text_to_analyze}
Report Type: {report.report_type}

Respond ONLY in valid JSON with keys: summary, deficiencies, recommendations, risk_level
"""
            response = model.generate_content(prompt)
            import json
            text = response.text.strip()
            if text.startswith('```'):
                text = text.split('```')[1]
                if text.startswith('json'):
                    text = text[4:]
            result = json.loads(text)

            report.ai_summary = result.get('summary', '')
            report.ai_deficiencies = result.get('deficiencies', [])
            report.ai_recommendations = result.get('recommendations', [])
            report.ai_risk_level = result.get('risk_level', 'low')
            report.status = 'completed'
            report.save()
            logger.info(f'AI analysis completed for report {report.id}')

        except Exception as e:
            logger.error(f'AI analysis failed for report {report.id}: {e}')
            ReportAnalysisService._fallback_analysis(report)

    @staticmethod
    def _fallback_analysis(report):
        """Rule-based fallback when Gemini is unavailable."""
        report.ai_summary = (
            f'This {report.get_report_type_display()} report has been received. '
            'AI analysis is currently unavailable. Please consult your healthcare provider.'
        )
        report.ai_deficiencies = []
        report.ai_recommendations = [
            'Maintain a balanced diet rich in fruits and vegetables.',
            'Stay hydrated with 2-3 liters of water daily.',
            'Consult your doctor for personalized advice.',
        ]
        report.ai_risk_level = 'low'
        report.status = 'completed'
        report.save()


class DeficiencyDetectionService:
    """Detect nutritional deficiencies from food logs."""

    THRESHOLDS = {
        'Vitamin C': {'rdv': 90, 'unit': 'mg', 'sources': ['oranges', 'bell peppers', 'broccoli', 'strawberries']},
        'Calcium': {'rdv': 1000, 'unit': 'mg', 'sources': ['dairy', 'tofu', 'almonds', 'leafy greens']},
        'Iron': {'rdv': 18, 'unit': 'mg', 'sources': ['red meat', 'spinach', 'lentils', 'fortified cereals']},
        'Potassium': {'rdv': 4700, 'unit': 'mg', 'sources': ['bananas', 'potatoes', 'avocados', 'beans']},
    }

    def __init__(self, user):
        self.user = user

    def detect_and_save(self):
        """Analyze recent food logs and save deficiency records."""
        from tracking.models import FoodLog
        from food.models import Food
        from django.utils import timezone
        from datetime import timedelta
        from .models import NutritionDeficiency

        week_ago = timezone.now().date() - timedelta(days=7)
        logs = FoodLog.objects.filter(user=self.user, date__gte=week_ago)
        if not logs.exists():
            return

        food_ids = list(logs.values_list('food_id', flat=True))
        foods = Food.objects.filter(id__in=food_ids)

        totals = {
            'Vitamin C': sum(f.vitamin_c_mg for f in foods) / 7,
            'Calcium': sum(f.calcium_mg for f in foods) / 7,
            'Iron': sum(f.iron_mg for f in foods) / 7,
            'Potassium': sum(f.potassium_mg for f in foods) / 7,
        }

        # Clear old unresolved records for this user
        NutritionDeficiency.objects.filter(user=self.user, is_resolved=False).delete()

        for nutrient, avg_value in totals.items():
            threshold = self.THRESHOLDS[nutrient]
            rdv = threshold['rdv']
            pct = avg_value / rdv if rdv else 1

            if pct < 0.7:
                severity = 'severe' if pct < 0.5 else 'moderate' if pct < 0.6 else 'mild'
                NutritionDeficiency.objects.create(
                    user=self.user,
                    nutrient=nutrient,
                    current_value=round(avg_value, 2),
                    recommended_value=rdv,
                    unit=threshold['unit'],
                    severity=severity,
                    food_sources=threshold['sources'],
                )
