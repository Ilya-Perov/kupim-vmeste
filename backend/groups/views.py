from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth.models import User

from .models import FamilyGroup, Invitation
from .serializers import FamilyGroupSerializer, InvitationSerializer, UserSerializer


class GroupViewSet(viewsets.ModelViewSet):
    serializer_class = FamilyGroupSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.request.user.family_groups.all()

    def perform_create(self, serializer):
        group = serializer.save(admin=self.request.user)

        # важно: гарантируем сохранение
        group.save()

        # добавляем создателя в участники
        group.members.add(self.request.user)

    @action(detail=True, methods=['get'])
    def members(self, request, pk=None):
        group = self.get_object()
        return Response(UserSerializer(group.members.all(), many=True).data)

    @action(detail=True, methods=['post'])
    def add_member(self, request, pk=None):
        group = self.get_object()
        username = request.data.get("username")

        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)

        group.members.add(user)
        return Response({"status": "added"})


class InvitationViewSet(viewsets.ModelViewSet):
    serializer_class = InvitationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Invitation.objects.filter(
            receiver=self.request.user,
            status='pending'
        )

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        invitation = self.get_object()
        invitation.status = 'accepted'
        invitation.save()

        invitation.group.members.add(request.user)
        return Response({'status': 'accepted'})

    @action(detail=True, methods=['post'])
    def decline(self, request, pk=None):
        invitation = self.get_object()
        invitation.status = 'declined'
        invitation.save()
        return Response({'status': 'declined'})