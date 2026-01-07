from import_export import resources, fields
from import_export.widgets import ForeignKeyWidget, ManyToManyWidget
from .models import (
    Order, OrderItem, ShippingMethod, ShippingTier, ShippingCategory,
    OrderPayment, OrderUpdate, Coupon, CashOnDelivery, ProductPreOrder
)
from users.models import User, Address
from products.models import Product, ProductVariant


class ShippingCategoryResource(resources.ModelResource):
    allowed_methods = fields.Field(
        column_name='allowed_shipping_methods',
        attribute='allowed_shipping_methods',
        widget=ManyToManyWidget(ShippingMethod, field='name', separator=',')
    )
    
    class Meta:
        model = ShippingCategory
        fields = ('id', 'name', 'description', 'allowed_methods')
        export_order = fields


class ShippingMethodResource(resources.ModelResource):
    class Meta:
        model = ShippingMethod
        fields = (
            'id', 'name', 'description', 'price', 'preferred_pricing_type',
            'delivery_estimated_time', 'max_weight', 'max_quantity', 'is_active'
        )
        export_order = fields


class ShippingTierResource(resources.ModelResource):
    shipping_method = fields.Field(
        column_name='shipping_method',
        attribute='shipping_method',
        widget=ForeignKeyWidget(ShippingMethod, 'name')
    )
    
    class Meta:
        model = ShippingTier
        fields = (
            'id', 'shipping_method', 'pricing_type', 'min_quantity', 'max_quantity',
            'min_weight', 'max_weight', 'base_price', 'has_incremental_pricing',
            'increment_per_unit', 'increment_unit_size', 'priority'
        )
        export_order = fields


class OrderResource(resources.ModelResource):
    user = fields.Field(
        column_name='user',
        attribute='user',
        widget=ForeignKeyWidget(User, 'email')
    )
    shipping_address = fields.Field(
        column_name='shipping_address',
        attribute='shipping_address',
        widget=ForeignKeyWidget(Address, 'id')
    )
    shipping_method = fields.Field(
        column_name='shipping_method',
        attribute='shipping_method',
        widget=ForeignKeyWidget(ShippingMethod, 'name')
    )
    
    class Meta:
        model = Order
        fields = (
            'id', 'order_number', 'user', 'customer_name', 'customer_email', 
            'customer_phone', 'shipping_address', 'shipping_method', 'status',
            'payment_status', 'cart_subtotal', 'total_amount', 'tracking_number',
            'ordered_at'
        )
        export_order = fields


class OrderItemResource(resources.ModelResource):
    order = fields.Field(
        column_name='order',
        attribute='order',
        widget=ForeignKeyWidget(Order, 'order_number')
    )
    product = fields.Field(
        column_name='product',
        attribute='product',
        widget=ForeignKeyWidget(Product, 'name')
    )
    
    class Meta:
        model = OrderItem
        fields = ('id', 'order', 'product', 'quantity', 'unit_price', 'color', 'size')
        export_order = fields


class CouponResource(resources.ModelResource):
    eligible_users = fields.Field(
        column_name='eligible_users',
        attribute='eligible_users',
        widget=ManyToManyWidget(User, field='email', separator=',')
    )
    
    class Meta:
        model = Coupon
        fields = (
            'id', 'code', 'type', 'discount_percent', 'min_quantity_required',
            'min_cart_total', 'active', 'valid_from', 'expires_at', 'eligible_users',
            'created_at'
        )
        export_order = fields


class CashOnDeliveryResource(resources.ModelResource):
    order = fields.Field(
        column_name='order',
        attribute='order',
        widget=ForeignKeyWidget(Order, 'order_number')
    )
    
    class Meta:
        model = CashOnDelivery
        fields = (
            'id', 'order', 'customer_full_name', 'alternative_phone', 'delivery_status',
            'scheduled_delivery_date', 'actual_delivery_date', 'amount_to_collect',
            'amount_collected', 'delivery_attempts', 'delivery_person_name',
            'delivery_person_phone', 'created_at', 'updated_at'
        )
        export_order = fields


class ProductPreOrderResource(resources.ModelResource):
    product = fields.Field(
        column_name='product',
        attribute='product',
        widget=ForeignKeyWidget(Product, 'name')
    )
    variant = fields.Field(
        column_name='variant',
        attribute='variant',
        widget=ForeignKeyWidget(ProductVariant, 'sku')
    )
    shipping_method = fields.Field(
        column_name='shipping_method',
        attribute='shipping_method',
        widget=ForeignKeyWidget(ShippingMethod, 'name')
    )
    
    class Meta:
        model = ProductPreOrder
        fields = (
            'id', 'order_number', 'product', 'variant', 'quantity', 'unit_price',
            'total_price', 'shipping_method', 'shipping_charge', 'expected_delivery_days',
            'full_name', 'email', 'phone', 'detailed_address', 'status',
            'created_at', 'updated_at'
        )
        export_order = fields
