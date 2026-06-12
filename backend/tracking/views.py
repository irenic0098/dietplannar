from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Sum, Avg
from django.utils import timezone
from datetime import timedelta, date
from .models import WeightLog, WaterLog, FoodLog, ExerciseLog
from .serializers import WeightLogSerializer, WaterLogSerializer, FoodLogSerializer, ExerciseLogSerializer


# ─── Weight Logs ───────────────────────────────────────────────
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def weight_log(request):
    if request.method == 'GET':
        days = int(request.query_params.get('days', 30))
        since = date.today() - timedelta(days=days)
        logs = WeightLog.objects.filter(user=request.user, date__gte=since)
        return Response(WeightLogSerializer(logs, many=True).data)
    serializer = WeightLogSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(user=request.user)
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)


# ─── Water Logs ────────────────────────────────────────────────
@api_view(['GET', 'POST', 'PATCH'])
@permission_classes([IsAuthenticated])
def water_log(request):
    today = date.today()
    if request.method == 'GET':
        days = int(request.query_params.get('days', 7))
        since = today - timedelta(days=days)
        logs = WaterLog.objects.filter(user=request.user, date__gte=since)
        return Response(WaterLogSerializer(logs, many=True).data)

    if request.method == 'POST':
        log, created = WaterLog.objects.get_or_create(user=request.user, date=today)
        serializer = WaterLogSerializer(log, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=200)
        return Response(serializer.errors, status=400)

    if request.method == 'PATCH':
        log, _ = WaterLog.objects.get_or_create(user=request.user, date=today)
        glasses = request.data.get('glasses', log.glasses)
        log.glasses = glasses
        log.ml_consumed = glasses * 250
        log.save()
        return Response(WaterLogSerializer(log).data)


# ─── Food Logs ─────────────────────────────────────────────────
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def food_log(request):
    today = request.query_params.get('date', str(date.today()))
    if request.method == 'GET':
        logs = FoodLog.objects.filter(user=request.user, date=today)
        data = FoodLogSerializer(logs, many=True).data
        totals = logs.aggregate(
            total_calories=Sum('calories'),
            total_protein=Sum('protein_g'),
            total_carbs=Sum('carbs_g'),
            total_fat=Sum('fat_g'),
        )
        return Response({'logs': data, 'totals': totals, 'date': today})

    serializer = FoodLogSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(user=request.user)
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_food_log(request, log_id):
    try:
        log = FoodLog.objects.get(id=log_id, user=request.user)
        log.delete()
        return Response({'message': 'Food log deleted.'}, status=204)
    except FoodLog.DoesNotExist:
        return Response({'error': 'Log not found.'}, status=404)


# ─── Exercise Logs ─────────────────────────────────────────────
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def exercise_log(request):
    if request.method == 'GET':
        days = int(request.query_params.get('days', 7))
        since = date.today() - timedelta(days=days)
        logs = ExerciseLog.objects.filter(user=request.user, date__gte=since)
        return Response(ExerciseLogSerializer(logs, many=True).data)
    serializer = ExerciseLogSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(user=request.user)
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)


# ─── Reports ───────────────────────────────────────────────────
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def report(request):
    period = request.query_params.get('period', 'week')
    days = 7 if period == 'week' else 30
    since = date.today() - timedelta(days=days)
    user = request.user

    # Weight trend
    weight_logs = WeightLog.objects.filter(user=user, date__gte=since).order_by('date')

    # Nutrition totals per day
    food_logs = FoodLog.objects.filter(user=user, date__gte=since)
    daily_nutrition = {}
    for log in food_logs:
        d = str(log.date)
        if d not in daily_nutrition:
            daily_nutrition[d] = {'calories': 0, 'protein': 0, 'carbs': 0, 'fat': 0}
        daily_nutrition[d]['calories'] += log.calories
        daily_nutrition[d]['protein'] += log.protein_g
        daily_nutrition[d]['carbs'] += log.carbs_g
        daily_nutrition[d]['fat'] += log.fat_g

    # Water
    water_logs = WaterLog.objects.filter(user=user, date__gte=since).order_by('date')

    # Exercise
    exercise_logs = ExerciseLog.objects.filter(user=user, date__gte=since)
    total_exercise_calories = sum(e.calories_burned for e in exercise_logs)
    total_exercise_minutes = sum(e.duration_minutes for e in exercise_logs)

    # Nutrition deficiency analysis
    avg_calories = sum(d['calories'] for d in daily_nutrition.values()) / max(len(daily_nutrition), 1)
    avg_protein = sum(d['protein'] for d in daily_nutrition.values()) / max(len(daily_nutrition), 1)

    target_calories = 2000  # default
    target_protein = (user.weight_kg or 70) * 2.0

    deficiencies = []
    if avg_protein < target_protein * 0.8:
        deficiencies.append({
            'nutrient': 'Protein',
            'current': round(avg_protein, 1),
            'target': round(target_protein, 1),
            'suggestion': 'Add eggs, chicken, lentils, or Greek yogurt to your meals.'
        })
    if avg_calories < target_calories * 0.7:
        deficiencies.append({
            'nutrient': 'Total Calories',
            'current': round(avg_calories, 1),
            'target': target_calories,
            'suggestion': 'You may be under-eating. Add more whole grains and healthy fats.'
        })

    return Response({
        'period': period,
        'weight_trend': WeightLogSerializer(weight_logs, many=True).data,
        'daily_nutrition': [{'date': k, **v} for k, v in sorted(daily_nutrition.items())],
        'water_trend': WaterLogSerializer(water_logs, many=True).data,
        'exercise_summary': {
            'total_sessions': exercise_logs.count(),
            'total_calories_burned': round(total_exercise_calories, 1),
            'total_minutes': total_exercise_minutes,
        },
        'deficiency_alerts': deficiencies,
    })
