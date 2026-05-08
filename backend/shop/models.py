from django.db import models
from django.contrib.auth.models import User
from groups.models import FamilyGroup


class Product(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)

    price = models.DecimalField(max_digits=10, decimal_places=2)
    old_price = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )

    image = models.URLField(blank=True)

    category = models.CharField(max_length=100, blank=True)
    brand = models.CharField(max_length=100, blank=True)
    rating = models.FloatField(default=0)

    stock = models.PositiveIntegerField(default=0)
    is_available = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class GroupCart(models.Model):
    group = models.OneToOneField(
        FamilyGroup, on_delete=models.CASCADE, related_name="cart"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Cart({self.group.name})"

    @staticmethod
    def get_or_create_for_group(group):
        cart, _ = GroupCart.objects.get_or_create(group=group)
        return cart


class CartItem(models.Model):
    cart = models.ForeignKey(GroupCart, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    added_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("cart", "product")

    def increase(self, amount=1):
        self.quantity += amount
        self.save()

    def decrease(self, amount=1):
        self.quantity -= amount
        if self.quantity <= 0:
            self.delete()
        else:
            self.save()
