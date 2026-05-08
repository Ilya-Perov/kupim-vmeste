from django.core.management.base import BaseCommand
from django.contrib.auth.models import User

from shop.models import Product
from groups.models import FamilyGroup


class Command(BaseCommand):
    help = "Seed initial data if DB is empty"

    def handle(self, *args, **kwargs):
        self.stdout.write("🌱 Checking seed data...")

        # =====================
        # USER
        # =====================
        if not User.objects.filter(username="admin").exists():
            User.objects.create_user(
                username="admin",
                password="admin123",
            )
            self.stdout.write("👤 Created admin user")

        admin = User.objects.get(username="admin")

        # =====================
        # GROUP
        # =====================
        if not FamilyGroup.objects.exists():
            group = FamilyGroup.objects.create(
                name="Demo Group",
                admin=admin,
            )
            group.members.add(admin)
            self.stdout.write("👨‍👩‍👧 Created demo group")

        # =====================
        # PRODUCTS
        # =====================
        if not Product.objects.exists():
            Product.objects.bulk_create(
                [
                    Product(
                        name="iPhone 15 Pro",
                        description="Флагманский смартфон Apple с чипом A17 Pro и отличной камерой",
                        price=99900,
                        old_price=109900,
                        image="https://apple-avenue.ru/upload/iblock/29c/dwh4w0naak8bgkpvrlcbe5rncqwxx5bf.jpg",
                        category="smartphones",
                        brand="Apple",
                        rating=4.9,
                        stock=15,
                        is_available=True,
                    ),
                    Product(
                        name="MacBook Air M2",
                        description="Лёгкий и мощный ноутбук для работы, учёбы и разработки",
                        price=129900,
                        old_price=139900,
                        image="https://ipac31.ru/image/cache/data/product/mac/Macbook%20Air%20M2/macbook-air-m2-space-gray-2-700x700.png",
                        category="laptops",
                        brand="Apple",
                        rating=4.8,
                        stock=8,
                        is_available=True,
                    ),
                    Product(
                        name="AirPods Pro 2",
                        description="Беспроводные наушники с активным шумоподавлением",
                        price=24900,
                        old_price=29900,
                        image="https://cdn-sh1.vigbo.com/shops/5217383d95fb1498cee4dbec9a9898a2/products/22170626/images/2-9cef92250752e513ec2ea666fa5607d0.png",
                        category="audio",
                        brand="Apple",
                        rating=4.7,
                        stock=30,
                        is_available=True,
                    ),
                    Product(
                        name="Samsung Galaxy S24",
                        description="Флагман Android с камерой 200MP и AI-функциями",
                        price=89900,
                        old_price=99900,
                        image="https://hi-stores.ru/upload/iblock/9d0/h83gx1fr203h7ywpf072u9zmfzxzgtdw.jpg",
                        category="smartphones",
                        brand="Samsung",
                        rating=4.6,
                        stock=20,
                        is_available=True,
                    ),
                    Product(
                        name="Xiaomi Redmi Note 13",
                        description="Бюджетный смартфон с хорошей камерой и батареей",
                        price=19900,
                        old_price=22900,
                        image="https://static.insales-cdn.com/r/l1nY5nOd4rU/rs:fit:1000:0:1/q:100/plain/images/products/1/8124/878796732/11111_10.jpg@jpg",
                        category="smartphones",
                        brand="Xiaomi",
                        rating=4.4,
                        stock=50,
                        is_available=True,
                    ),
                    Product(
                        name="Sony WH-1000XM5",
                        description="Премиальные наушники с лучшим шумоподавлением",
                        price=34900,
                        old_price=39900,
                        image="https://topcomputer.ru/upload/resize_cache/images/a0/1024_768_140cd750bba9870f18aada2478b24840a/a0a14ee7019bb3d1830a25e1f0d523f8.png",
                        category="audio",
                        brand="Sony",
                        rating=4.9,
                        stock=12,
                        is_available=True,
                    ),
                ]
            )

            self.stdout.write("📦 Created demo products")
        else:
            self.stdout.write("📦 Products already exist")

        self.stdout.write(self.style.SUCCESS("✅ Seeding complete"))
