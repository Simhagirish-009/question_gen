from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from .models import Context, Question, Option, QuestionPaper, GenerationHistory

User = get_user_model()


# --------------------------
# 1️⃣ User Serializers
# --------------------------
class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'full_name', 'password', 'password2']

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user


class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)


# --------------------------
# 2️⃣ Option Serializer
# --------------------------
class OptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Option
        fields = ['id', 'option_text', 'is_correct']


# --------------------------
# 3️⃣ Question Serializer
# --------------------------
class QuestionSerializer(serializers.ModelSerializer):
    options = OptionSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = ['id', 'question_text', 'correct_option', 'options']


# --------------------------
# 4️⃣ Context Serializer
# --------------------------
class ContextSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Context
        fields = ['id', 'title', 'paragraph', 'created_at', 'questions']


# --------------------------
# 5️⃣ Question Paper Serializer
# --------------------------
class QuestionPaperSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)

    class Meta:
        model = QuestionPaper
        fields = ['id', 'title', 'questions', 'created_at']


# --------------------------
# 6️⃣ Generation History Serializer
# --------------------------
class GenerationHistorySerializer(serializers.ModelSerializer):
    context_title = serializers.CharField(source='context.title', read_only=True)

    class Meta:
        model = GenerationHistory
        fields = ['id', 'context_title', 'total_questions', 'created_at']
