
# ===================================================================
# orders/admin.py

from django.contrib import admin
from django.forms import Media
from django.utils.html import format_html
from unfold.admin import ModelAdmin, TabularInline
from .models import (
    Order, OrderItem, ShippingMethod, OrderUpdate, OrderPayment, Coupon, ShippingTier,
    ShippingCategory, FreeShippingRule
)

class ShippingTierInline(TabularInline):
    model = ShippingTier
    extra = 1
    fields = (
        'pricing_type', 'min_quantity', 'max_quantity', 'min_weight', 'max_weight',
        'base_price', 'has_incremental_pricing', 'increment_per_unit', 'increment_unit_size', 'priority'
    )
    ordering = ['pricing_type', 'priority', 'min_quantity', 'min_weight']
    
    def get_readonly_fields(self, request, obj=None):
        # Make certain fields conditional based on pricing_type
        return []
    
    class Media:
        css = {
            'all': ('admin/css/shipping_tier_admin.css',)
        }
        js = ('admin/js/shipping_tier_admin.js',)

@admin.register(ShippingMethod)
class ShippingMethodAdmin(ModelAdmin):
    list_display = ('name', 'price', 'preferred_pricing_type', 'delivery_estimated_time', 'max_weight', 'max_quantity', 'is_active', 'tier_count')
    list_filter = ('is_active', 'preferred_pricing_type')
    fields = (
        'name', 'description', 'price', 'preferred_pricing_type', 
        'delivery_estimated_time', 'max_weight', 'max_quantity', 'is_active'
    )
    inlines = [ShippingTierInline]
    
    def tier_count(self, obj):
        quantity_tiers = obj.shipping_tiers.filter(pricing_type='quantity').count()
        weight_tiers = obj.shipping_tiers.filter(pricing_type='weight').count()
        return f"{quantity_tiers} qty, {weight_tiers} weight"
    tier_count.short_description = 'Pricing Tiers'
    
    def change_view(self, request, object_id, form_url='', extra_context=None):
        extra_context = extra_context or {}
        extra_context['shipping_tier_help_text'] = format_html("""
        <div class="shipping-tier-help" style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #007cba;">
            <h3 style="color: #007cba; margin-top: 0;">📋 How to Configure Shipping Tiers</h3>
            
            <div style="margin: 15px 0;">
                <h4>🎯 Priority System:</h4>
                <ul>
                    <li><strong>Lower numbers = Higher priority</strong> (Priority 1 beats Priority 10)</li>
                    <li>When ranges overlap, the tier with lowest priority number is selected</li>
                    <li>Use priority 10 for standard tiers, 5 for premium, 1 for special cases</li>
                </ul>
            </div>
            
            <div style="margin: 15px 0;">
                <h4>⚖️ Weight-Based Pricing:</h4>
                <ul>
                    <li><strong>Min/Max Weight:</strong> Define weight ranges (e.g., 0-0.5kg, 0.5-1kg)</li>
                    <li><strong>Base Price:</strong> Fixed cost for this weight range</li>
                    <li><strong>Incremental Pricing:</strong> Add extra cost per additional weight unit</li>
                    <li><strong>Example:</strong> 70 BDT + 20 BDT per additional kg above 1kg</li>
                </ul>
            </div>
            
            <div style="margin: 15px 0;">
                <h4>📦 Quantity-Based Pricing:</h4>
                <ul>
                    <li><strong>Min/Max Quantity:</strong> Define item count ranges (e.g., 1-5 items)</li>
                    <li><strong>Base Price:</strong> Fixed cost for this quantity range</li>
                    <li><strong>Incremental Pricing:</strong> Add extra cost per additional item</li>
                </ul>
            </div>
            
            <div style="margin: 15px 0;">
                <h4>💰 Incremental Pricing Settings:</h4>
                <ul>
                    <li><strong>Increment Per Unit:</strong> Extra cost per additional unit (e.g., 20 BDT)</li>
                    <li><strong>Increment Unit Size:</strong> How to count units (e.g., per 1kg or per 0.5kg)</li>
                    <li><strong>Calculation:</strong> Base Price + (excess_units × increment_per_unit)</li>
                </ul>
            </div>
            
            <div style="background: #fff3cd; padding: 10px; border-radius: 5px; border: 1px solid #ffeaa7;">
                <strong>💡 Pro Tip:</strong> Test your configuration using the shipping test page to verify calculations work as expected!
            </div>
        </div>
        """)
        return super().change_view(request, object_id, form_url, extra_context)
    
    class Media:
        css = {
            'all': ('admin/css/shipping_tier_admin.css',)
        }
        js = ('admin/js/shipping_tier_admin.js',)

@admin.register(ShippingTier)
class ShippingTierAdmin(ModelAdmin):
    list_display = (
        'shipping_method', 'pricing_type', 'tier_range', 'pricing_display', 
        'has_incremental_pricing', 'priority'
    )
    list_filter = ('pricing_type', 'has_incremental_pricing', 'shipping_method')
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
class CouponAdmin(ModelAdmin):
    list_display = ('code', 'type', 'discount_percent', 'min_quantity_required', 'min_cart_total', 'active', 'valid_from', 'expires_at', 'eligible_users_count')
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
            'classes': ('collapse',),
            'description': 'Select specific users for USER_SPECIFIC coupon type'
        }),
        ('Validity Period', {
            'fields': ('created_at', 'valid_from', 'expires_at')
        }),
    )
    
    def eligible_users_count(self, obj):
        if obj.type == obj.CouponType.USER_SPECIFIC:
            return obj.eligible_users.count()
        return '-'
    eligible_users_count.short_description = 'Eligible Users'
    
    def get_queryset(self, request):
        """Add custom ordering and filters"""
        qs = super().get_queryset(request)
        return qs.select_related()

# Order Admin Configuration
class OrderItemInline(admin.TabularInline):
    """Inline for order items"""
    model = OrderItem
    extra = 0
    readonly_fields = ('product', 'color', 'size', 'quantity', 'unit_price')
    can_delete = False
    
    def has_add_permission(self, request, obj=None):
        return False

class OrderPaymentInline(admin.StackedInline):
    """Inline for order payment"""
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

class OrderUpdateInline(TabularInline):
    model = OrderUpdate
    extra = 1
    readonly_fields = ('timestamp',)

@admin.register(Order)
class OrderAdmin(ModelAdmin):
    list_display = ('order_number', 'customer_name', 'customer_email', 'total_amount', 'payment_status', 'status', 'ordered_at')
    list_filter = ('status', 'payment_status', 'shipping_method', 'ordered_at')
    search_fields = ('order_number', 'customer_name', 'customer_email', 'customer_phone', 'tracking_number')
    readonly_fields = ('order_number', 'total_amount', 'cart_subtotal', 'ordered_at')
    inlines = [OrderItemInline, OrderPaymentInline, OrderUpdateInline]
    
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
    
    def get_queryset(self, request):
        """Optimize queryset with related objects"""
        qs = super().get_queryset(request)
        return qs.select_related('user', 'shipping_method', 'shipping_address').prefetch_related('items', 'payment')

@admin.register(OrderPayment)
class OrderPaymentAdmin(ModelAdmin):
    list_display = ('order', 'payment_method', 'sender_number', 'transaction_id', 'created_at')
    list_filter = ('payment_method', 'created_at')
    search_fields = ('order__order_number', 'sender_number', 'transaction_id', 'admin_account_number')
    readonly_fields = ('created_at', 'updated_at')
    
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
class ShippingCategoryAdmin(ModelAdmin):
    list_display = ('name', 'description', 'allowed_methods_count')
    search_fields = ('name', 'description')
    filter_horizontal = ('allowed_shipping_methods',)
    
    def allowed_methods_count(self, obj):
        return obj.allowed_shipping_methods.count()
    allowed_methods_count.short_description = 'Allowed Methods'

@admin.register(FreeShippingRule)
class FreeShippingRuleAdmin(ModelAdmin):
    list_display = ('threshold_amount', 'active', 'applicable_categories_count', 'created_at')
    list_filter = ('active', 'created_at')
    filter_horizontal = ('applicable_categories',)
    readonly_fields = ('created_at',)
    
    def applicable_categories_count(self, obj):
        count = obj.applicable_categories.count()
        return f"{count} categories" if count > 0 else "All categories"
    applicable_categories_count.short_description = 'Applies To'
