from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Context, Question, Option, QuestionPaper, GenerationHistory
from rest_framework.decorators import api_view
from django.shortcuts import get_object_or_404

from openai import OpenAI
from django.conf import settings
import openai

openai.api_key = settings.OPENAI_API_KEY
client = OpenAI(api_key=settings.OPENAI_API_KEY)

from .serializers import (
    UserRegisterSerializer, UserLoginSerializer,
    ContextSerializer, QuestionSerializer,
    QuestionPaperSerializer, GenerationHistorySerializer
)

# --------------------------
# 1️⃣ Registration
# --------------------------
class RegisterView(generics.CreateAPIView):
    serializer_class = UserRegisterSerializer
    permission_classes = [permissions.AllowAny]


# --------------------------
# 2️⃣ Login
# --------------------------
class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        username = serializer.validated_data['username']
        password = serializer.validated_data['password']

        user = authenticate(username=username, password=password)
        if not user:
            return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

        refresh = RefreshToken.for_user(user)
        return Response({
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "username": user.username
        })
# --------------------------
# 3️⃣ Context Creation + Question Generation
# --------------------------

from django.conf import settings
import openai
import json
import re

openai.api_key = settings.OPENAI_API_KEY


class ContextCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ContextSerializer(data=request.data)
        if serializer.is_valid():
            print("✅ OpenAI key loaded:", bool(openai.api_key))

            # Save the context with the logged-in user
            context = serializer.save(user=request.user)
            # -------------------------------------------
            # 1️⃣ Prepare dynamic question count
            # -------------------------------------------
            title = serializer.validated_data.get("title", "")
            content = serializer.validated_data.get("context", "")

            # Count words to decide how many questions to make
            word_count = len(content.split())

            # Example logic:
            #  - 0–100 words  → 3 questions
            #  - 101–300 words → 5 questions
            #  - 301–600 words → 8 questions
            #  - 601–1000 words → 10 questions
            #  - 1000+ words → 12 questions
            question_count = 10

            # -------------------------------------------
            # 2️⃣ AI Prompt
            # -------------------------------------------
            prompt = f"""
            Generate {question_count} concept-based multiple choice questions (MCQs) with 4 options each 
            related to the topic below.
            The questions should test conceptual understanding and reasoning about the subject — not reading comprehension.

            Topic: {title}
            Context: {content}

            Format the output as valid JSON like this:
            [
              {{
                "question": "What is ...?",
                "options": ["A", "B", "C", "D"],
                "answer": "B"
              }}
            ]
            """
            # -------------------------------------------
            # 3️⃣ Call OpenAI API
            # -------------------------------------------
            try:
                response = client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[
                        {"role": "system", "content": "You are a quiz generator that creates MCQs from educational topics."},
                        {"role": "user", "content": prompt},
                    ],
                    temperature=0.7
                )

                raw_output = response.choices[0].message.content

                # -------------------------------------------
                # 4️⃣ Extract valid JSON safely
                # -------------------------------------------
                try:
                    sample_questions = json.loads(raw_output)
                except json.JSONDecodeError:
                    json_text = re.search(r'\[.*\]', raw_output, re.DOTALL)
                    if json_text:
                        sample_questions = json.loads(json_text.group(0))
                    else:
                        sample_questions = []

            except Exception as e:
                print("❌ OpenAI API Error:", e)
                sample_questions = []

            # -------------------------------------------
            # 5️⃣ Save generated questions to database
            # -------------------------------------------
            for q in sample_questions:
                question = Question.objects.create(
                    context=context,
                    question_text=q.get("question", "Untitled Question"),
                    correct_option=q.get("answer", "")
                )

                for opt in q.get("options", []):
                    Option.objects.create(
                        question=question,
                        option_text=opt,
                        is_correct=(opt == q.get("answer", ""))
                    )
            # -------------------------------------------
            # 6️⃣ Log Generation History
            # -------------------------------------------
            GenerationHistory.objects.create(
                user=request.user,
                context=context,
                total_questions=len(sample_questions)
            )
            # -------------------------------------------
            # 7️⃣ Return response
            # -------------------------------------------
            return Response(
                {
                    "message": "Questions generated successfully!",
                    "context": ContextSerializer(context).data,
                    "generated_count": len(sample_questions),
                    "word_count": word_count,
                    "expected_questions": question_count,
                },
                status=status.HTTP_201_CREATED
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
# --------------------------
# 4️⃣ Question Paper Generation
# --------------------------
class QuestionPaperCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        title = request.data.get('title')
        question_ids = request.data.get('question_ids', [])

        paper = QuestionPaper.objects.create(user=request.user, title=title)
        paper.questions.set(question_ids)
        paper.save()

        return Response(QuestionPaperSerializer(paper).data, status=status.HTTP_201_CREATED)
# --------------------------
# 5️⃣ Dashboard / History
# --------------------------
class DashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        total_contexts = Context.objects.filter(user=request.user).count()
        total_questions = Question.objects.filter(context__user=request.user).count()
        total_papers = QuestionPaper.objects.filter(user=request.user).count()

        recent_history = GenerationHistory.objects.filter(user=request.user).order_by('-created_at')[:5]
        history_data = GenerationHistorySerializer(recent_history, many=True).data

        return Response({
            "stats": {
                "total_contexts": total_contexts,
                "total_questions": total_questions,
                "total_papers": total_papers,
            },
            "recent_history": history_data
        })
    
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status, permissions
from django.contrib.auth import get_user_model

User = get_user_model()

# 🟢 Fetch contexts based on username (from localStorage)
@api_view(['GET'])
@permission_classes([permissions.AllowAny])  # change to IsAuthenticated if you add auth
def get_user_contexts(request, username):
    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

    contexts = Context.objects.filter(user=user).order_by('-created_at')
    data = [{"id": c.id, "title": c.title, "paragraph": c.paragraph} for c in contexts]
    return Response(data, status=status.HTTP_200_OK)


# 🟣 Fetch questions for a context
@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def get_context_questions(request, context_id):
    try:
        context = Context.objects.get(id=context_id)
    except Context.DoesNotExist:
        return Response({"error": "Context not found"}, status=status.HTTP_404_NOT_FOUND)

    questions = Question.objects.filter(context=context)
    serialized = QuestionSerializer(questions, many=True)
    return Response({"context": context.title, "questions": serialized.data}, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def add_question(request):
    context_id = request.data.get("context")
    question_text = request.data.get("question_text")
    correct_option = request.data.get("correct_option")
    options = request.data.get("options", [])

    try:
        context = Context.objects.get(id=context_id)
    except Context.DoesNotExist:
        return Response({"error": "Invalid context"}, status=status.HTTP_400_BAD_REQUEST)

    question = Question.objects.create(
        context=context,
        question_text=question_text,
        correct_option=correct_option,
    )

    for opt_text in options:
        Option.objects.create(
            question=question,
            option_text=opt_text,
            is_correct=(opt_text == correct_option),
        )

    return Response({"message": "Question and options added successfully!"}, status=status.HTTP_201_CREATED)
