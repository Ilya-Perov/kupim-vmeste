from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()


class Command(BaseCommand):
    help = "Reset and create default superuser"

    def handle(self, *args, **kwargs):
        username = "admin"

        # =====================
        # DELETE OLD USER IF EXISTS
        # =====================
        User.objects.filter(username=username).delete()

        # =====================
        # CREATE NEW SUPERUSER
        # =====================
        User.objects.create_superuser(
            username=username,
            email="admin@test.com",
            password="admin123",
        )

        self.stdout.write(self.style.SUCCESS("👤 Admin superuser reset successfully"))
