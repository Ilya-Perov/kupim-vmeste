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

    def get_logger(self, request):
        return get_logger(request)

    def list(self, request, *args, **kwargs):
        self.get_logger(request).info("products_requested")
        return super().list(request, *args, **kwargs)


class GroupCartViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    # =====================
    # LOGGER
    # =====================
    def get_logger(self, request):
        return get_logger(request)

    # =====================
    # GROUP SELECTION
    # =====================
    def get_group(self, request):
        group_id = request.query_params.get("group_id")

        if group_id:
            return request.user.family_groups.filter(id=group_id).first()

        return request.user.family_groups.first()

    # =====================
    # CART
    # =====================
    def get_cart(self, request):
        group = self.get_group(request)

        logger = self.get_logger(request)

        if not group:
            logger.error("group_not_found_for_cart")
            return None

        cart, _ = GroupCart.objects.get_or_create(group=group)
        return cart

    # =====================
    # GET CART
    # =====================
    @action(detail=False, methods=["get"])
    def my_cart(self, request):
        cart = self.get_cart(request)

        if not cart:
            return Response({"detail": "No group"}, status=400)

        self.get_logger(request).info("cart_requested")

        return Response(GroupCartSerializer(cart).data)

    # =====================
    # ADD ITEM
    # =====================
    @action(detail=False, methods=["post"])
    def add(self, request):
        cart = self.get_cart(request)

        if not cart:
            return Response({"detail": "No group"}, status=400)

        product_id = request.data.get("product_id")

        if not product_id:
            return Response({"detail": "product_id is required"}, status=400)

        try:
            product_id = int(product_id)
        except (TypeError, ValueError):
            return Response({"detail": "invalid product_id"}, status=400)

        try:
            item, created = CartItem.objects.get_or_create(
                cart=cart,
                product_id=product_id,
                defaults={"quantity": 1, "added_by": request.user},
            )

            if not created:
                item.quantity += 1
                item.save()

        except Exception as e:
            return Response({"detail": str(e)}, status=500)

        self.get_logger(request).info(
            "product_added_to_cart",
            extra={"product_id": product_id},
        )

        return Response({"status": "added"})

    # =====================
    # REMOVE ITEM
    # =====================
    @action(detail=False, methods=["post"])
    def remove(self, request):
        cart = self.get_cart(request)

        if not cart:
            return Response({"detail": "No group"}, status=400)

        product_id = request.data.get("product_id")

        if not product_id:
            return Response({"detail": "product_id is required"}, status=400)

        try:
            item = CartItem.objects.filter(
                cart=cart, product_id=int(product_id)
            ).first()

            if item:
                if item.quantity > 1:
                    item.quantity -= 1
                    item.save()
                else:
                    item.delete()

        except Exception as e:
            return Response({"detail": str(e)}, status=500)

        self.get_logger(request).info(
            "product_removed_from_cart",
            extra={"product_id": product_id},
        )

        return Response({"status": "removed"})
