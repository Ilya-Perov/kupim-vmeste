from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import ProductViewSet, GroupCartViewSet

router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='products')
router.register(r'cart', GroupCartViewSet, basename='cart')

urlpatterns = [
    path('', include(router.urls)),
]