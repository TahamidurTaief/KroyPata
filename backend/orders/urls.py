# orders/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    OrderViewSet, ShippingMethodViewSet, OrderPaymentViewSet, ShippingMethodListAPIView, 
    CouponViewSet, PaymentAccountsAPIView, ShippingCategoryViewSet, FreeShippingRuleViewSet,
    analyze_cart_shipping, enhanced_checkout_calculation, debug_orders_api
)

# Create router for ViewSets
router = DefaultRouter()
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'order-payments', OrderPaymentViewSet, basename='order-payment')
router.register(r'shipping-methods', ShippingMethodViewSet, basename='shipping-method')
router.register(r'shipping-categories', ShippingCategoryViewSet, basename='shipping-category')
router.register(r'free-shipping-rules', FreeShippingRuleViewSet, basename='free-shipping-rule')
router.register(r'coupons', CouponViewSet, basename='coupon')

app_name = 'orders'

urlpatterns = [
    # Order-related API endpoints
    path('', include(router.urls)),
    
    # Additional API endpoints
    path('shipping-methods-list/', ShippingMethodListAPIView.as_view(), name='shipping-methods-list'),
    path('payment/accounts/', PaymentAccountsAPIView.as_view(), name='payment-accounts'),
    
    # Advanced shipping and checkout endpoints
    path('analyze-cart-shipping/', analyze_cart_shipping, name='analyze-cart-shipping'),
    path('enhanced-checkout-calculation/', enhanced_checkout_calculation, name='enhanced-checkout-calculation'),
    
    # Debug endpoint
    path('debug/', debug_orders_api, name='debug-orders'),
]
