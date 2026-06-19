import logging
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from .models import HealthReport, NutritionDeficiency
from .serializers import HealthReportSerializer, NutritionDeficiencySerializer
from .services import ReportAnalysisService, DeficiencyDetectionService

logger = logging.getLogger('dietplanner')


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def reports_list(request):
    """GET/POST /api/v1/reports/"""
    if request.method == 'GET':
        reports = HealthReport.objects.filter(user=request.user)
        serializer = HealthReportSerializer(reports, many=True)
        return Response({'count': reports.count(), 'reports': serializer.data})

    # POST — upload new report
    serializer = HealthReportSerializer(data=request.data)
    if serializer.is_valid():
        report = serializer.save(user=request.user)
        # Trigger async AI analysis
        try:
            from .tasks import analyze_health_report_task
            analyze_health_report_task.delay(report.id)
        except Exception:
            # Fallback: synchronous analysis if Celery not running
            ReportAnalysisService.analyze(report)
        return Response(HealthReportSerializer(report).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'DELETE'])
@permission_classes([IsAuthenticated])
def report_detail(request, report_id):
    """GET/DELETE /api/v1/reports/<id>/"""
    try:
        report = HealthReport.objects.get(id=report_id, user=request.user)
    except HealthReport.DoesNotExist:
        return Response({'error': 'Report not found.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response(HealthReportSerializer(report).data)

    report.delete()
    return Response({'message': 'Report deleted.'}, status=status.HTTP_204_NO_CONTENT)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reanalyze_report(request, report_id):
    """POST /api/v1/reports/<id>/analyze/ — Re-trigger AI analysis."""
    try:
        report = HealthReport.objects.get(id=report_id, user=request.user)
        report.status = HealthReport.Status.PENDING
        report.save(update_fields=['status'])
        try:
            from .tasks import analyze_health_report_task
            analyze_health_report_task.delay(report.id)
        except Exception:
            ReportAnalysisService.analyze(report)
        return Response({'message': 'Analysis queued.', 'status': report.status})
    except HealthReport.DoesNotExist:
        return Response({'error': 'Report not found.'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def deficiencies(request):
    """GET /api/v1/reports/deficiencies/ — Get user's detected nutrition deficiencies."""
    user = request.user
    detected = NutritionDeficiency.objects.filter(user=user, is_resolved=False)

    # Auto-detect from recent tracking if no existing records
    if not detected.exists():
        try:
            DetectionService = DeficiencyDetectionService(user)
            DetectionService.detect_and_save()
            detected = NutritionDeficiency.objects.filter(user=user, is_resolved=False)
        except Exception as e:
            logger.error(f'Deficiency detection error: {e}')

    serializer = NutritionDeficiencySerializer(detected, many=True)
    return Response({
        'count': detected.count(),
        'deficiencies': serializer.data,
        'summary': _build_deficiency_summary(detected),
    })


def _build_deficiency_summary(deficiencies):
    """Build a quick-glance summary of deficiencies."""
    if not deficiencies:
        return {'status': 'good', 'message': 'No significant deficiencies detected!'}
    severe = deficiencies.filter(severity='severe').count()
    moderate = deficiencies.filter(severity='moderate').count()
    if severe > 0:
        return {'status': 'critical', 'message': f'{severe} severe deficiency detected. Consult a doctor.'}
    if moderate > 0:
        return {'status': 'warning', 'message': f'{moderate} moderate deficiency. Adjust your diet.'}
    return {'status': 'mild', 'message': 'Minor deficiencies detected. Monitor your intake.'}


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def nutrition_analysis(request):
    """GET /api/v1/reports/nutrition-analysis/ — Weekly nutrition deficiency analysis."""
    from tracking.models import FoodLog
    from django.utils import timezone
    from datetime import timedelta
    import statistics

    user = request.user
    week_ago = timezone.now().date() - timedelta(days=7)
    logs = FoodLog.objects.filter(user=user, date__gte=week_ago)

    if not logs.exists():
        return Response({
            'message': 'No food logs found for the past week. Start logging meals for analysis.',
            'has_data': False,
        })

    # Aggregate nutrient totals
    total_days = 7
    nutrients = {
        'calories': sum(l.calories for l in logs) / total_days,
        'protein_g': sum(l.protein_g for l in logs) / total_days,
        'carbs_g': sum(l.carbs_g for l in logs) / total_days,
        'fat_g': sum(l.fat_g for l in logs) / total_days,
    }

    # Micronutrients from food data
    from food.models import Food
    food_ids = logs.values_list('food_id', flat=True)
    foods = Food.objects.filter(id__in=food_ids)
    micro = {
        'vitamin_c_mg': sum(f.vitamin_c_mg for f in foods) / max(total_days, 1),
        'calcium_mg': sum(f.calcium_mg for f in foods) / max(total_days, 1),
        'iron_mg': sum(f.iron_mg for f in foods) / max(total_days, 1),
        'potassium_mg': sum(f.potassium_mg for f in foods) / max(total_days, 1),
    }

    # Reference daily values
    rdv = {
        'protein_g': user.weight_kg * 0.8 if user.weight_kg else 56,
        'vitamin_c_mg': 90, 'calcium_mg': 1000, 'iron_mg': 18, 'potassium_mg': 4700,
    }

    deficiency_flags = []
    for nutrient, actual in {**nutrients, **micro}.items():
        if nutrient in rdv and actual < rdv[nutrient] * 0.7:
            pct = round((actual / rdv[nutrient]) * 100, 1)
            deficiency_flags.append({
                'nutrient': nutrient.replace('_', ' ').title(),
                'actual_avg': round(actual, 1),
                'recommended': rdv[nutrient],
                'percent_of_rdv': pct,
                'severity': 'severe' if pct < 50 else 'moderate' if pct < 70 else 'mild',
            })

    return Response({
        'has_data': True,
        'period_days': total_days,
        'avg_daily_nutrients': nutrients,
        'avg_micronutrients': micro,
        'deficiencies_detected': deficiency_flags,
        'overall_score': max(0, 100 - len(deficiency_flags) * 10),
    })
