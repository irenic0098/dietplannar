from rest_framework import serializers
from .models import Post, Comment, Dietician, Appointment


class CommentSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.username', read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'author_name', 'content', 'created_at']
        read_only_fields = ['id', 'author_name', 'created_at']


class PostSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.username', read_only=True)
    like_count = serializers.ReadOnlyField()
    comment_count = serializers.SerializerMethodField()
    comments = CommentSerializer(many=True, read_only=True)
    is_liked = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = ['id', 'author_name', 'title', 'content', 'category',
                  'like_count', 'comment_count', 'comments', 'is_liked', 'created_at']
        read_only_fields = ['id', 'author_name', 'like_count', 'comment_count', 'created_at']

    def get_comment_count(self, obj):
        return obj.comments.count()

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(id=request.user.id).exists()
        return False


class DieticianSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dietician
        fields = '__all__'


class AppointmentSerializer(serializers.ModelSerializer):
    dietician_name = serializers.CharField(source='dietician.name', read_only=True)

    class Meta:
        model = Appointment
        fields = ['id', 'dietician', 'dietician_name', 'appointment_date',
                  'appointment_time', 'status', 'notes', 'created_at']
        read_only_fields = ['id', 'status', 'created_at', 'dietician_name']
