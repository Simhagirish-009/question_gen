from django.urls import path
from .views import *

urlpatterns = [
    # 🔐 Auth
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),

    path("contexts/<str:username>/", get_user_contexts, name="get_user_contexts"),
    path("contexts/<int:context_id>/questions/", get_context_questions, name="get_context_questions"),


    # 🧠 Context and Question Generation
    path('context/', ContextCreateView.as_view(), name='context-create'),

    # 📄 Question Paper
    path('questionpaper/', QuestionPaperCreateView.as_view(), name='questionpaper-create'),
    path("questions/", add_question, name="add_question"),

    # 📊 Dashboard
    path('dashboard/', DashboardView.as_view(), name='dashboard'),
]
