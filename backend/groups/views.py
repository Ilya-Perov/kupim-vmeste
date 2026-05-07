from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import FamilyGroup, Invitation
from .serializers import FamilyGroupSerializer, InvitationSerializer

class GroupViewSet(viewsets.ModelViewSet):
    queryset = FamilyGroup.objects.all()
    serializer_class = FamilyGroupSerializer

    def perform_create(self, serializer):
        # Создатель группы автоматически становится админом и участником
        group = serializer.save(admin=self.request.user)
        group.members.add(self.request.user)

class InvitationViewSet(viewsets.ModelViewSet):
    serializer_class = InvitationSerializer

    def get_queryset(self):
        # Видим только те приглашения, которые прислали нам
        return Invitation.objects.filter(receiver=self.request.user, status='pending')

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        invitation = self.get_object()
        invitation.status = 'accepted'
        invitation.save()
        
        # Добавляем пользователя в группу
        invitation.group.members.add(request.user)
        return Response({'status': 'приглашение принято'})

    @action(detail=True, methods=['post'])
    def decline(self, request, pk=None):
        invitation = self.get_object()
        invitation.status = 'declined'
        invitation.save()
        return Response({'status': 'приглашение отклонено'})