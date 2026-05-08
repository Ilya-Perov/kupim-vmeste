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
    # GET GROUP
    # =====================
    def get_group(self, request):
        group_id = request.query_params.get("group_id") or request.data.get("group_id")

        if not group_id:
            return None

        return request.user.family_groups.filter(id=group_id).first()

    # =====================
    # GET CART
    # =====================
    def get_cart(self, request):
        group = self.get_group(request)

        if not group:
            self.get_logger(request).warning("group_not_found")
            return None

        cart, _ = GroupCart.objects.get_or_create(group=group)

        return cart

    # =====================
    # MY CART
    # =====================
    @action(detail=False, methods=["get"])
    def my_cart(self, request):
        cart = self.get_cart(request)

        if not cart:
            return Response(
                {"detail": "Group not found"},
                status=400,
            )

        self.get_logger(request).info(
            "cart_requested",
            extra={
                "group_id": cart.group.id,
            },
        )

        return Response(GroupCartSerializer(cart).data)

    # =====================
    # ADD ITEM
    # =====================
    @action(detail=False, methods=["post"])
    def add(self, request):
        cart = self.get_cart(request)

        if not cart:
            return Response(
                {"detail": "Group not found"},
                status=400,
            )

        product_id = request.data.get("product_id")

        if not product_id:
            return Response(
                {"detail": "product_id is required"},
                status=400,
            )

        try:
            product_id = int(product_id)

        except (TypeError, ValueError):
            return Response(
                {"detail": "invalid product_id"},
                status=400,
            )

        try:
            item, created = CartItem.objects.get_or_create(
                cart=cart,
                product_id=product_id,
                defaults={
                    "quantity": 1,
                    "added_by": request.user,
                },
            )

            if not created:
                item.quantity += 1
                item.save()

        except Exception as e:
            self.get_logger(request).exception("cart_add_failed")

            return Response(
                {"detail": str(e)},
                status=500,
            )

        self.get_logger(request).info(
            "product_added_to_cart",
            extra={
                "group_id": cart.group.id,
                "product_id": product_id,
            },
        )

        return Response(
            {
                "status": "added",
            }
        )

    # =====================
    # REMOVE ITEM
    # =====================
    @action(detail=False, methods=["post"])
    def remove(self, request):
        cart = self.get_cart(request)

        if not cart:
            return Response(
                {"detail": "Group not found"},
                status=400,
            )

        product_id = request.data.get("product_id")

        if not product_id:
            return Response(
                {"detail": "product_id is required"},
                status=400,
            )

        try:
            product_id = int(product_id)

            item = CartItem.objects.filter(
                cart=cart,
                product_id=product_id,
            ).first()

            if item:
                if item.quantity > 1:
                    item.quantity -= 1
                    item.save()
                else:
                    item.delete()

        except Exception as e:
            self.get_logger(request).exception("cart_remove_failed")

            return Response(
                {"detail": str(e)},
                status=500,
            )

        self.get_logger(request).info(
            "product_removed_from_cart",
            extra={
                "group_id": cart.group.id,
                "product_id": product_id,
            },
        )

        return Response(
            {
                "status": "removed",
            }
        )

    @action(detail=False, methods=["post"])
    def checkout(self, request):
        cart = self.get_cart(request)

        if not cart:
            return Response({"detail": "No group"}, status=400)

        cart.items.all().delete()

        self.get_logger(request).info("cart_checkout")

        return Response({"status": "success"})
