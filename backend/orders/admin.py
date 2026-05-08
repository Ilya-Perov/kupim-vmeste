from django.contrib import admin
from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ("product", "quantity", "price")
    can_delete = False


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "group", "status", "created_at")
    list_filter = ("status", "created_at", "group")
    search_fields = ("user__username", "group__name")
    inlines = [OrderItemInline]
    readonly_fields = ("created_at",)

    fieldsets = (
        ("Основная информация", {"fields": ("user", "group", "status", "created_at")}),
    )


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ("order", "product", "quantity", "price")
    list_filter = ("order",)
    search_fields = ("product__name",)
