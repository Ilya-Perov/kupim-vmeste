from rest_framework import serializers
from .models import Product, GroupCart, CartItem


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = "__all__"


class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer()
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = ["id", "product", "quantity", "added_by", "total_price"]

    def get_total_price(self, obj):
        return obj.product.price * obj.quantity


class GroupCartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_cart_price = serializers.SerializerMethodField()

    class Meta:
        model = GroupCart
        fields = ["id", "group", "items", "total_cart_price"]

    def get_total_cart_price(self, obj):
        return sum(item.product.price * item.quantity for item in obj.items.all())
