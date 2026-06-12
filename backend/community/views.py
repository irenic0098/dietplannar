from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from .models import Post, Comment, Dietician, Appointment
from .serializers import PostSerializer, CommentSerializer, DieticianSerializer, AppointmentSerializer


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def posts(request):
    if request.method == 'GET':
        category = request.query_params.get('category', '')
        all_posts = Post.objects.all()
        if category:
            all_posts = all_posts.filter(category=category)
        serializer = PostSerializer(all_posts, many=True, context={'request': request})
        return Response(serializer.data)
    serializer = PostSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        serializer.save(author=request.user)
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def like_post(request, post_id):
    try:
        post = Post.objects.get(id=post_id)
    except Post.DoesNotExist:
        return Response({'error': 'Post not found.'}, status=404)
    if request.user in post.likes.all():
        post.likes.remove(request.user)
        return Response({'liked': False, 'likes': post.like_count})
    else:
        post.likes.add(request.user)
        return Response({'liked': True, 'likes': post.like_count})


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def post_comments(request, post_id):
    try:
        post = Post.objects.get(id=post_id)
    except Post.DoesNotExist:
        return Response({'error': 'Post not found.'}, status=404)
    if request.method == 'GET':
        comments = post.comments.all()
        return Response(CommentSerializer(comments, many=True).data)
    serializer = CommentSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(post=post, author=request.user)
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)


@api_view(['GET'])
@permission_classes([AllowAny])
def dieticians(request):
    all_dieticians = Dietician.objects.filter(is_active=True)
    return Response(DieticianSerializer(all_dieticians, many=True).data)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def appointments(request):
    if request.method == 'GET':
        apps = Appointment.objects.filter(user=request.user)
        return Response(AppointmentSerializer(apps, many=True).data)
    serializer = AppointmentSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(user=request.user)
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)
