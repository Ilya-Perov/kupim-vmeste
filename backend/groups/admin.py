from django.contrib import admin
from .models import FamilyGroup, Invitation

@admin.register(FamilyGroup)
class FamilyGroupAdmin(admin.ModelAdmin):
    list_display = ('name', 'admin', 'created_at')
    filter_horizontal = ('members',) # Удобный интерфейс выбора участников

@admin.register(Invitation)
class InvitationAdmin(admin.ModelAdmin):
    list_display = ('sender', 'receiver', 'group', 'status', 'created_at')
    list_filter = ('status',)