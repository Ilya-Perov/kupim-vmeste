from django.db import models
from django.contrib.auth.models import User

class FamilyGroup(models.Model):
    name = models.CharField(max_length=255)
    admin = models.ForeignKey(User, on_delete=models.CASCADE, related_name='admin_groups')
    members = models.ManyToManyField(User, related_name='family_groups', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Invitation(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Ожидает'),
        ('accepted', 'Принято'),
        ('declined', 'Отклонено'),
    ]

    group = models.ForeignKey(FamilyGroup, on_delete=models.CASCADE, related_name='invites')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_invites')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_invites')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # Чтобы нельзя было спамить одинаковыми приглашениями
        unique_together = ('group', 'receiver', 'status')