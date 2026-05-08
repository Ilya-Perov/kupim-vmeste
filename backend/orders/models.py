from django.db import models
from django.contrib.auth.models import User
from groups.models import FamilyGroup
from shop.models import Product


class Order(models.Model):
    STATUS_CHOICES = [
        ("new", "New"),
        ("paid", "Paid"),
        ("done", "Done"),
        ("canceled", "Canceled"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    group = models.ForeignKey(FamilyGroup, on_delete=models.CASCADE)

    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="new")

    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    def __str__(self):
        return f"Order #{self.id}"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")

    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.product.name} x{self.quantity}"
