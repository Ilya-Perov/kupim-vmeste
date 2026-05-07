from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import GroupViewSet, InvitationViewSet

router = DefaultRouter()
router.register(r'my-groups', GroupViewSet)
router.register(r'invitations', InvitationViewSet, basename='invitations')

urlpatterns = [
    path('', include(router.urls)),
]