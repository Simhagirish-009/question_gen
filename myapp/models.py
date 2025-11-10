from django.db import models
from django.contrib.auth.models import AbstractUser

# --------------------------
# 1️⃣ Custom User Model
# --------------------------
class User(AbstractUser):
    email = models.EmailField(unique=True)
    
    # Optional profile info
    full_name = models.CharField(max_length=150, blank=True)
    
    def __str__(self):
        return self.username


# --------------------------
# 2️⃣ Context Model
# --------------------------
class Context(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="contexts")
    title = models.CharField(max_length=200)
    paragraph = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.title


# --------------------------
# 3️⃣ Question Model
# --------------------------
class Question(models.Model):
    context = models.ForeignKey(Context, on_delete=models.CASCADE, related_name="questions")
    question_text = models.TextField()
    correct_option = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.question_text[:50]


# --------------------------
# 4️⃣ Option Model (for 4 MCQ options)
# --------------------------
class Option(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name="options")
    option_text = models.CharField(max_length=255)
    is_correct = models.BooleanField(default=False)
    
    def __str__(self):
        return f"Option for {self.question.id}"


# --------------------------
# 5️⃣ Question Paper Model
# --------------------------
class QuestionPaper(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="papers")
    title = models.CharField(max_length=200)
    questions = models.ManyToManyField(Question, related_name="papers")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


# --------------------------
# 6️⃣ History / Activity Log
# --------------------------
class GenerationHistory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="history")
    context = models.ForeignKey(Context, on_delete=models.SET_NULL, null=True, blank=True)
    total_questions = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.created_at.strftime('%Y-%m-%d %H:%M')}"
