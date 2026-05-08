from rest_framework import serializers
from django.contrib.auth.models import User
from .models import FamilyGroup, Invitation

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class FamilyGroupSerializer(serializers.ModelSerializer):
    admin = UserSerializer(read_only=True)
    members = UserSerializer(many=True, read_only=True)

    class Meta:
        model = FamilyGroup
        fields = ['id', 'name', 'admin', 'members', 'created_at']

class InvitationSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    receiver_username = serializers.CharField(write_only=True)
    group_name = serializers.CharField(source='group.name', read_only=True)

    class Meta:
        model = Invitation
        fields = ['id', 'group', 'group_name', 'sender', 'receiver_username', 'status', 'created_at']

    def create(self, validated_data):
        receiver_username = validated_data.pop('receiver_username')
        try:
            receiver = User.objects.get(username=receiver_username)
        except User.DoesNotExist:
            raise serializers.ValidationError({"error": "Пользователь не найден"})
        
        return Invitation.objects.create(receiver=receiver, **validated_data)