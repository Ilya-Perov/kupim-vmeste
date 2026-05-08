from django.contrib.auth.models import User
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import generics, permissions

from .serializers import UserSerializer, RegisterSerializer

from services.logger import get_logger


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me(request):
    get_logger(request).info("current_user_requested")

    return Response(UserSerializer(request.user).data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def search_users(request):
    q = request.GET.get("q", "")

    users = User.objects.filter(username__icontains=q)[:10]

    get_logger(request).info(
        "user_search",
        extra={"query": q},
    )

    return Response(UserSerializer(users, many=True).data)


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        user = serializer.save()

        get_logger(self.request).info(
            "user_registered",
            extra={"user_id": user.id, "username": user.username},
        )
