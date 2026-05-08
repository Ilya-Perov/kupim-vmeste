from django.contrib.auth.models import User
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import FamilyGroup, Invitation
from .serializers import (
    FamilyGroupSerializer,
    InvitationSerializer,
    UserSerializer,
)

from services.logger import get_logger


class GroupViewSet(viewsets.ModelViewSet):
    serializer_class = FamilyGroupSerializer
    permission_classes = [permissions.IsAuthenticated]

    # helper
    def logger(self, request):
        return get_logger(request)

    def get_queryset(self):
        logger = self.logger(self.request)

        logger.info("groups_list_requested")

        return self.request.user.family_groups.all()

    def perform_create(self, serializer):
        group = serializer.save(admin=self.request.user)
        group.members.add(self.request.user)

        logger = self.logger(self.request)

        logger.info(
            "group_created",
            extra={"group_id": group.id},
        )

    @action(detail=True, methods=["get"])
    def members(self, request, pk=None):
        group = self.get_object()

        logger = self.logger(request)

        logger.info(
            "group_members_requested",
            extra={"group_id": group.id},
        )

        return Response(UserSerializer(group.members.all(), many=True).data)

    @action(detail=True, methods=["post"])
    def add_member(self, request, pk=None):
        group = self.get_object()
        username = request.data.get("username")

        logger = self.logger(request)

        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            logger.error(
                "add_member_user_not_found",
                extra={"target": username},
            )
            return Response({"error": "User not found"}, status=404)

        group.members.add(user)

        logger.info(
            "member_added",
            extra={
                "added_user": user.username,
                "group_id": group.id,
            },
        )

        return Response({"status": "added"})


class InvitationViewSet(viewsets.ModelViewSet):
    serializer_class = InvitationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def logger(self, request):
        return get_logger(request)

    def get_queryset(self):
        logger = self.logger(self.request)

        logger.info("invitations_requested")

        return Invitation.objects.filter(
            receiver=self.request.user,
            status="pending",
        )

    def perform_create(self, serializer):
        invitation = serializer.save(sender=self.request.user)

        logger = self.logger(self.request)

        logger.info(
            "invitation_created",
            extra={"group_id": invitation.group_id},
        )

    @action(detail=True, methods=["post"])
    def accept(self, request, pk=None):
        invitation = self.get_object()
        invitation.status = "accepted"
        invitation.save()

        invitation.group.members.add(request.user)

        logger = self.logger(request)

        logger.info(
            "invitation_accepted",
            extra={"group_id": invitation.group_id},
        )

        return Response({"status": "accepted"})

    @action(detail=True, methods=["post"])
    def decline(self, request, pk=None):
        invitation = self.get_object()
        invitation.status = "declined"
        invitation.save()

        logger = self.logger(request)

        logger.info(
            "invitation_declined",
            extra={"group_id": invitation.group_id},
        )

        return Response({"status": "declined"})
