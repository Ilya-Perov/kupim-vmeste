from django.urls import path
from .views import search_users, me, RegisterView

urlpatterns = [
    path("search/", search_users),
    path("me/", me),
    path("auth/register/", RegisterView.as_view()),
]
