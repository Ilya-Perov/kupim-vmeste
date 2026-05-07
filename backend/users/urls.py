from django.urls import path
from .views import search_users, me

urlpatterns = [
    path('search/', search_users),
    path("me/", me),

]