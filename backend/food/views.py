from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q
from .models import Food, FoodCategory
from .serializers import FoodSerializer, FoodCategorySerializer


@api_view(['GET'])
@permission_classes([AllowAny])
def search_food(request):
    """GET /api/food/search/?q=&category=&diet=&budget="""
    q = request.query_params.get('q', '')
    category = request.query_params.get('category', '')
    diet = request.query_params.get('diet', '')
    budget = request.query_params.get('budget', '')

    foods = Food.objects.all()

    if q:
        foods = foods.filter(name__icontains=q)
    if category:
        foods = foods.filter(category__name__icontains=category)
    if diet == 'vegetarian':
        foods = foods.filter(is_vegetarian=True)
    elif diet == 'vegan':
        foods = foods.filter(is_vegan=True)
    elif diet == 'gluten_free':
        foods = foods.filter(is_gluten_free=True)
    elif diet == 'diabetic':
        foods = foods.filter(is_diabetic_friendly=True)
    elif diet == 'keto':
        foods = foods.filter(is_keto=True)
    if budget:
        try:
            foods = foods.filter(cost_inr__lte=float(budget))
        except ValueError:
            pass

    foods = foods[:50]
    serializer = FoodSerializer(foods, many=True)
    return Response({'count': foods.count(), 'results': serializer.data})


@api_view(['GET'])
@permission_classes([AllowAny])
def food_detail(request, food_id):
    """GET /api/food/<id>/"""
    try:
        food = Food.objects.get(id=food_id)
        serializer = FoodSerializer(food)
        return Response(serializer.data)
    except Food.DoesNotExist:
        return Response({'error': 'Food not found.'}, status=404)


@api_view(['GET'])
@permission_classes([AllowAny])
def categories(request):
    """GET /api/food/categories/"""
    cats = FoodCategory.objects.all()
    serializer = FoodCategorySerializer(cats, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_custom_food(request):
    """POST /api/food/custom/ — Add a custom food item"""
    serializer = FoodSerializer(data=request.data)
    if serializer.is_valid():
        food = serializer.save(added_by=request.user, is_custom=True)
        return Response(FoodSerializer(food).data, status=201)
    return Response(serializer.errors, status=400)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def manage_food(request, food_id):
    """Admin: Manage food items"""
    try:
        food = Food.objects.get(id=food_id)
    except Food.DoesNotExist:
        return Response({'error': 'Food not found.'}, status=404)

    if request.method == 'GET':
        return Response(FoodSerializer(food).data)

    if not request.user.is_staff and food.added_by != request.user:
        return Response({'error': 'Not authorized.'}, status=403)

    if request.method == 'PUT':
        serializer = FoodSerializer(food, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    if request.method == 'DELETE':
        food.delete()
        return Response({'message': 'Food deleted.'}, status=204)
