from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Order, OrderItem
from .serializers import OrderSerializer

from shop.models import GroupCart


class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)

    # =========================
    # CREATE ORDER FROM CART
    # =========================
    @action(detail=False, methods=["post"])
    def create_from_cart(self, request):
        group_id = request.data.get("group_id")

        if not group_id:
            return Response({"detail": "group_id required"}, status=400)

        cart = GroupCart.objects.filter(group_id=group_id).first()

        if not cart or not cart.items.exists():
            return Response({"detail": "Cart is empty"}, status=400)

        order = Order.objects.create(
            user=request.user,
            group_id=group_id,
            total_price=0,
        )

        total = 0

        for item in cart.items.all():
            OrderItem.objects.create(
                order=order,
                product=item.product,
                quantity=item.quantity,
                price=item.product.price,
            )
            total += item.quantity * float(item.product.price)

        order.total_price = total
        order.save()

        # очистка корзины
        cart.items.all().delete()

        return Response(OrderSerializer(order).data)
