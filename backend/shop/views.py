from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Product, GroupCart, CartItem
from .serializers import ProductSerializer, GroupCartSerializer


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]


class GroupCartViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_cart(self, user):
        group = user.family_groups.first()
        if not group:
            return None

        cart, _ = GroupCart.objects.get_or_create(group=group)
        return cart

    @action(detail=False, methods=['get'])
    def my_cart(self, request):
        cart = self.get_cart(request.user)
        if not cart:
            return Response({"detail": "No group"}, status=400)

        return Response(GroupCartSerializer(cart).data)

    @action(detail=False, methods=['post'])
    def add(self, request):
        cart = self.get_cart(request.user)
        if not cart:
            return Response({"detail": "No group"}, status=400)

        product_id = request.data.get('product_id')

        item, created = CartItem.objects.get_or_create(
            cart=cart,
            product_id=product_id,
            defaults={
                'quantity': 1,
                'added_by': request.user
            }
        )

        if not created:
            item.quantity += 1
            item.save()

        return Response({"status": "added"})

    @action(detail=False, methods=['post'])
    def remove(self, request):
        cart = self.get_cart(request.user)
        if not cart:
            return Response({"detail": "No group"}, status=400)

        product_id = request.data.get('product_id')

        CartItem.objects.filter(
            cart=cart,
            product_id=product_id
        ).delete()

        return Response({"status": "removed"})