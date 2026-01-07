# ===================================================================
# orders/admin.py

from django.contrib import admin
from django.utils.html import format_html
from import_export.admin import ImportExportModelAdmin
from .models import (
    Order, OrderItem, ShippingMethod, OrderUpdate, OrderPayment, Coupon, ShippingTier,
    ShippingCategory, FreeShippingRule, CashOnDelivery, ProductPreOrder
)
from .resources import (
    ShippingCategoryResource, ShippingMethodResource, ShippingTierResource,
    OrderResource, OrderItemResource, CouponResource, CashOnDeliveryResource, ProductPreOrderResource
)

class ShippingTierInline(admin.TabularInline):
    model = ShippingTier
    extra = 1
    fields = (
        'pricing_type', 'min_quantity', 'max_quantity', 'min_weight', 'max_weight',
        'base_price', 'has_incremental_pricing', 'increment_per_unit', 'increment_unit_size', 'priority'
    )
    ordering = ['pricing_type', 'priority', 'min_quantity', 'min_weight']

@admin.register(ShippingMethod)
class ShippingMethodAdmin(ImportExportModelAdmin, admin.ModelAdmin):
    resource_class = ShippingMethodResource
    list_display = ('name', 'price', 'preferred_pricing_type', 'delivery_estimated_time', 'max_weight', 'max_quantity', 'is_active')
    list_filter = ('is_active', 'preferred_pricing_type')
    search_fields = ('name', 'description')
    fields = (
        'name', 'description', 'price', 'preferred_pricing_type', 
        'delivery_estimated_time', 'max_weight', 'max_quantity', 'is_active'
    )
    inlines = [ShippingTierInline]

@admin.register(ShippingTier)
class ShippingTierAdmin(ImportExportModelAdmin, admin.ModelAdmin):
    resource_class = ShippingTierResource
    list_display = (
        'shipping_method', 'pricing_type', 'tier_range', 'pricing_display', 
        'has_incremental_pricing', 'priority'
    )
    list_filter = ('pricing_type', 'has_incremental_pricing', 'shipping_method')
    autocomplete_fields = ['shipping_method']
    ordering = ['shipping_method', 'pricing_type', 'priority', 'min_quantity', 'min_weight']
    
    fields = (
        'shipping_method', 'pricing_type', 'priority',
        ('min_quantity', 'max_quantity'),
        ('min_weight', 'max_weight'),
        'base_price',
        ('has_incremental_pricing', 'increment_per_unit', 'increment_unit_size')
    )
    
    def tier_range(self, obj):
        if obj.pricing_type == 'weight':
            range_str = f"{obj.min_weight}kg"
            if obj.max_weight:
                range_str += f" - {obj.max_weight}kg"
            else:
                range_str += "+"
            return range_str
        else:
            range_str = f"{obj.min_quantity}"
            if obj.max_quantity:
                range_str += f" - {obj.max_quantity} items"
            else:
                range_str += "+ items"
            return range_str
    tier_range.short_description = 'Range'
    
    def pricing_display(self, obj):
        if obj.has_incremental_pricing:
            unit_type = "kg" if obj.pricing_type == 'weight' else "items"
            return f"{obj.base_price} BDT + {obj.increment_per_unit}/per {obj.increment_unit_size}{unit_type}"
        return f"{obj.base_price} BDT (fixed)"
    pricing_display.short_description = 'Pricing'

@admin.register(Coupon)
class CouponAdmin(ImportExportModelAdmin, admin.ModelAdmin):
    resource_class = CouponResource
    list_display = ('code', 'type', 'discount_percent', 'active', 'valid_from', 'expires_at')
    list_filter = ('type', 'active', 'created_at', 'valid_from', 'expires_at')
    search_fields = ('code',)
    readonly_fields = ('created_at',)
    filter_horizontal = ('eligible_users',)
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('code', 'type', 'active')
        }),
        ('Discount Settings', {
            'fields': ('discount_percent', 'min_quantity_required', 'min_cart_total')
        }),
        ('User Restrictions', {
            'fields': ('eligible_users',),
            'classes': ('collapse',)
        }),
        ('Validity Period', {
            'fields': ('created_at', 'valid_from', 'expires_at')
        }),
    )

# Order Admin Configuration
class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('product', 'color', 'size', 'quantity', 'unit_price')
    can_delete = False
    
    def has_add_permission(self, request, obj=None):
        return False

class OrderPaymentInline(admin.StackedInline):
    model = OrderPayment
    extra = 0
    readonly_fields = ('payment_method', 'sender_number', 'transaction_id', 'admin_account_number', 'created_at', 'updated_at')
    can_delete = False
    
    fieldsets = (
        ('Payment Information', {
            'fields': ('payment_method', 'admin_account_number', 'sender_number', 'transaction_id')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def has_add_permission(self, request, obj=None):
        return False

class CashOnDeliveryInline(admin.StackedInline):
    model = CashOnDelivery
    extra = 0
    readonly_fields = ('created_at', 'updated_at', 'payment_collected_at', 'actual_delivery_date')
    
    fieldsets = (
        ('Customer Contact Details', {
            'fields': ('customer_full_name', 'alternative_phone', 'special_instructions')
        }),
        ('Delivery Information', {
            'fields': ('delivery_status', 'scheduled_delivery_date', 'actual_delivery_date', 'delivery_attempts')
        }),
        ('Payment Collection', {
            'fields': ('amount_to_collect', 'amount_collected', 'payment_collected_at')
        }),
        ('Delivery Team', {
            'fields': ('delivery_person_name', 'delivery_person_phone'),
            'classes': ('collapse',)
        }),
        ('Notes & Tracking', {
            'fields': ('delivery_notes',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

class OrderUpdateInline(admin.TabularInline):
    model = OrderUpdate
    extra = 1
    readonly_fields = ('timestamp',)

@admin.register(Order)
class OrderAdmin(ImportExportModelAdmin, admin.ModelAdmin):
    resource_class = OrderResource
    list_display = ('order_number', 'customer_name', 'status', 'created_at')
    list_filter = ('status', 'payment_status', 'shipping_method', 'ordered_at')
    search_fields = ('order_number', 'customer_email')
    readonly_fields = ('order_number', 'total_amount', 'cart_subtotal', 'ordered_at')
    autocomplete_fields = ['user', 'shipping_address', 'shipping_method']
    inlines = [OrderItemInline, OrderPaymentInline, CashOnDeliveryInline, OrderUpdateInline]
    
    fieldsets = (
        ('Order Information', {
            'fields': ('order_number', 'user', 'status', 'payment_status', 'ordered_at')
        }),
        ('Customer Information', {
            'fields': ('customer_name', 'customer_email', 'customer_phone')
        }),
        ('Shipping Information', {
            'fields': ('shipping_address', 'shipping_method', 'tracking_number')
        }),
        ('Financial Information', {
            'fields': ('cart_subtotal', 'total_amount'),
            'classes': ('collapse',)
        }),
    )
    
    def created_at(self, obj):
        return obj.ordered_at
    created_at.short_description = 'Created'
    created_at.admin_order_field = 'ordered_at'
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('user', 'shipping_method', 'shipping_address').prefetch_related('items')

@admin.register(OrderPayment)
class OrderPaymentAdmin(admin.ModelAdmin):
    list_display = ('order', 'payment_method', 'sender_number', 'transaction_id', 'created_at')
    list_filter = ('payment_method', 'created_at')
    search_fields = ('order__order_number', 'sender_number', 'transaction_id')
    readonly_fields = ('created_at', 'updated_at')
    autocomplete_fields = ['order']
    
    fieldsets = (
        ('Order Information', {
            'fields': ('order',)
        }),
        ('Payment Details', {
            'fields': ('payment_method', 'sender_number', 'transaction_id', 'admin_account_number')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

@admin.register(ShippingCategory)
class ShippingCategoryAdmin(ImportExportModelAdmin, admin.ModelAdmin):
    resource_class = ShippingCategoryResource
    list_display = ('name', 'description', 'allowed_methods_count')
    search_fields = ('name', 'description')
    filter_horizontal = ('allowed_shipping_methods',)
    
    def allowed_methods_count(self, obj):
        return obj.allowed_shipping_methods.count()
    allowed_methods_count.short_description = 'Allowed Methods'

@admin.register(FreeShippingRule)
class FreeShippingRuleAdmin(admin.ModelAdmin):
    list_display = ('threshold_amount', 'active', 'applicable_categories_count', 'created_at')
    list_filter = ('active', 'created_at')
    filter_horizontal = ('applicable_categories',)
    readonly_fields = ('created_at',)
    
    def applicable_categories_count(self, obj):
        count = obj.applicable_categories.count()
        return f"{count} categories" if count > 0 else "All categories"
    applicable_categories_count.short_description = 'Applies To'

@admin.register(CashOnDelivery)
class CashOnDeliveryAdmin(ImportExportModelAdmin, admin.ModelAdmin):
    resource_class = CashOnDeliveryResource
    list_display = (
        'order_number', 'customer_full_name', 'delivery_status', 
        'amount_to_collect', 'created_at'
    )
    list_filter = ('delivery_status', 'created_at', 'scheduled_delivery_date')
    search_fields = (
        'order__order_number', 'customer_full_name', 'alternative_phone'
    )
    readonly_fields = ('created_at', 'updated_at', 'payment_collected_at', 'actual_delivery_date')
    autocomplete_fields = ['order']
    
    fieldsets = (
        ('Order Information', {
            'fields': ('order',)
        }),
        ('Customer Contact Details', {
            'fields': ('customer_full_name', 'alternative_phone', 'special_instructions')
        }),
        ('Delivery Management', {
            'fields': ('delivery_status', 'scheduled_delivery_date', 'actual_delivery_date', 'delivery_attempts')
        }),
        ('Payment Collection', {
            'fields': ('amount_to_collect', 'amount_collected', 'payment_collected_at')
        }),
        ('Delivery Team Assignment', {
            'fields': ('delivery_person_name', 'delivery_person_phone'),
            'classes': ('collapse',)
        }),
        ('Delivery Notes', {
            'fields': ('delivery_notes',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def order_number(self, obj):
        return obj.order.order_number
    order_number.short_description = 'Order Number'
    order_number.admin_order_field = 'order__order_number'
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('order')
    
    actions = ['mark_out_for_delivery', 'mark_delivered']
    
    def mark_out_for_delivery(self, request, queryset):
        updated = queryset.update(delivery_status=CashOnDelivery.DeliveryStatus.OUT_FOR_DELIVERY)
        self.message_user(request, f'{updated} orders marked as out for delivery.')
    mark_out_for_delivery.short_description = 'Mark as out for delivery'
    
    def mark_delivered(self, request, queryset):
        for cod in queryset:
            cod.mark_as_delivered()
        self.message_user(request, f'{queryset.count()} orders marked as delivered and paid.')
    mark_delivered.short_description = 'Mark as delivered & paid'


@admin.register(ProductPreOrder)
class ProductPreOrderAdmin(ImportExportModelAdmin, admin.ModelAdmin):
    resource_class = ProductPreOrderResource
    list_display = ('order_number', 'product', 'quantity', 'total_price', 'status', 'full_name', 'created_at')
    list_filter = ('status', 'created_at', 'product')
    search_fields = ('order_number', 'full_name', 'email', 'phone', 'product__name')
    readonly_fields = ('order_number', 'created_at', 'updated_at')
    autocomplete_fields = ['product', 'variant', 'shipping_method']
    list_per_page = 50
    ordering = ('-created_at',)
    
    fieldsets = (
        ('Order Information', {
            'fields': ('order_number', 'status', 'created_at', 'updated_at')
        }),
        ('Product Details', {
            'fields': ('product', 'variant', 'quantity', 'unit_price', 'total_price')
        }),
        ('Shipping', {
            'fields': ('shipping_method', 'shipping_charge', 'expected_delivery_days')
        }),
        ('Customer Information', {
            'fields': ('full_name', 'email', 'phone', 'detailed_address')
        }),
        ('Additional Information', {
            'fields': ('preorder_note',)
        }),
    )
