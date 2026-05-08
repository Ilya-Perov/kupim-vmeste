from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Product, GroupCart, CartItem
from .serializers import ProductSerializer, GroupCartSerializer

from services.logger import get_logger


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]

    def logger(self, request):
        return get_logger(request)

    def list(self, request, *args, **kwargs):
        logger = self.logger(request)

        logger.info("products_requested")

        return super().list(request, *args, **kwargs)


class GroupCartViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def logger(self, request):
        return get_logger(request)

    def get_cart(self, request):
        user = request.user
        group = user.family_groups.first()

        logger = self.logger(request)

        if not group:
            logger.error("group_not_found_for_cart")
            return None

        return GroupCart.objects.get_or_create(group=group)[0]

    @action(detail=False, methods=["get"])
    def my_cart(self, request):
        cart = self.get_cart(request)

        if not cart:
            return Response({"detail": "No group"}, status=400)

        self.logger(request).info("cart_requested")

        return Response(GroupCartSerializer(cart).data)

    @action(detail=False, methods=["post"])
    def add(self, request):
        cart = self.get_cart(request)

        if not cart:
            return Response({"detail": "No group"}, status=400)

        product_id = request.data.get("product_id")

        item, created = CartItem.objects.get_or_create(
            cart=cart,
            product_id=product_id,
            defaults={"quantity": 1, "added_by": request.user},
        )

        if not created:
            item.quantity += 1
            item.save()

        self.logger(request).info(
            "product_added_to_cart",
            extra={"product_id": product_id},
        )

        return Response({"status": "added"})

    @action(detail=False, methods=["post"])
    def remove(self, request):
        cart = self.get_cart(request)

        if not cart:
            return Response({"detail": "No group"}, status=400)

        product_id = request.data.get("product_id")

        CartItem.objects.filter(
            cart=cart,
            product_id=product_id,
        ).delete()

        self.logger(request).info(
            "product_removed_from_cart",
            extra={"product_id": product_id},
        )

        return Response({"status": "removed"})
