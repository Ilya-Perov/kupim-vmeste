from django.db import models
from django.contrib.auth.models import User
from groups.models import FamilyGroup


class Product(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class GroupCart(models.Model):
    group = models.OneToOneField(
        FamilyGroup,
        on_delete=models.CASCADE,
        related_name='cart'
    )
    created_at = models.DateTimeField(auto_now_add=True)


class CartItem(models.Model):
    cart = models.ForeignKey(
        GroupCart,
        on_delete=models.CASCADE,
        related_name='items'
    )
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    added_by = models.ForeignKey(User, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('cart', 'product')

class GroupCartItem(models.Model):
    group = models.ForeignKey(FamilyGroup, on_delete=models.CASCADE, related_name='cart_items')
    product_id = models.IntegerField()
    added_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
