# products/admin.py
from django.contrib import admin
from unfold.admin import ModelAdmin, TabularInline, StackedInline
from .models import *

@admin.register(Brand)
class BrandAdmin(ModelAdmin):
    list_display = ('name', 'is_active', 'website', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('name', 'description')
    prepopulated_fields = {'slug': ('name',)}
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'slug', 'logo', 'description')
        }),
        ('Contact & Settings', {
            'fields': ('website', 'is_active')
        }),
    )

@admin.register(Color)
class ColorAdmin(ModelAdmin):
    list_display = ('name', 'hex_code')
    search_fields = ('name',)

@admin.register(Size)
class SizeAdmin(ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)

@admin.register(Category)
class CategoryAdmin(ModelAdmin):
    list_display = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ('name', 'slug')

@admin.register(SubCategory)
class SubCategoryAdmin(ModelAdmin):
    list_display = ('name', 'category', 'slug')
    prepopulated_fields = {'slug': ('name',)}

class ProductSpecificationInline(TabularInline):
    model = ProductSpecification
    extra = 1

class ProductAdditionalImageInline(TabularInline):
    model = ProductAdditionalImage
    extra = 1

class VariantImageInline(TabularInline):
    model = VariantImage
    extra = 1
    fields = ('image', 'is_primary', 'order')

class ProductVariantInline(TabularInline):
    model = ProductVariant
    extra = 0
    fields = ('sku', 'color', 'size', 'material', 'price', 'discount_price', 'wholesale_price', 'minimum_purchase', 'stock', 'weight', 'is_active', 'is_default')
    readonly_fields = ('sku',)

@admin.register(ProductVariant)
class ProductVariantAdmin(ModelAdmin):
    list_display = ('__str__', 'product', 'sku', 'color', 'size', 'material', 'price', 'stock', 'is_default', 'is_active')
    list_filter = ('is_active', 'is_default', 'color', 'size', 'product__sub_category')
    search_fields = ('sku', 'product__name', 'material')
    readonly_fields = ('sku', 'created_at', 'updated_at')
    inlines = [VariantImageInline]
    
    fieldsets = (
        ('Product & Identification', {
            'fields': ('product', 'sku', 'is_default', 'is_active')
        }),
        ('Variant Attributes', {
            'fields': ('color', 'size', 'material', 'weight')
        }),
        ('Pricing', {
            'fields': ('price', 'discount_price', 'wholesale_price', 'minimum_purchase')
        }),
        ('Stock', {
            'fields': ('stock',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

@admin.register(Product)
class ProductAdmin(ModelAdmin):
    list_display = ('name', 'brand', 'shop', 'sub_category', 'shipping_category', 'price', 'wholesale_price', 'minimum_purchase', 'stock', 'is_active', 'enable_landing_page')
    list_filter = ('is_active', 'enable_landing_page', 'brand', 'shop', 'sub_category', 'shipping_category', 'colors', 'sizes')
    search_fields = ('name', 'slug', 'brand__name')
    prepopulated_fields = {'slug': ('name',)}
    inlines = [ProductVariantInline, ProductSpecificationInline, ProductAdditionalImageInline]
    filter_horizontal = ('colors', 'sizes')
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'slug', 'description', 'brand', 'shop', 'thumbnail')
        }),
        ('Categories', {
            'fields': ('sub_category', 'shipping_category')
        }),
        ('Pricing & Stock', {
            'fields': ('price', 'discount_price', 'wholesale_price', 'minimum_purchase', 'affiliate_commission_rate', 'stock', 'is_active')
        }),
        ('Landing Page Settings', {
            'fields': ('enable_landing_page', 'landing_features', 'landing_how_to_use', 'landing_why_choose'),
            'classes': ('collapse',)
        }),
        ('Facebook Pixel Tracking', {
            'fields': ('enable_facebook_pixel', 'facebook_pixel_id', 'facebook_pixel_access_token'),
            'classes': ('collapse',),
            'description': '🔒 Configure product-specific Facebook Pixel. Access token is secured and not exposed via API.'
        }),
        ('Physical Properties', {
            'fields': ('weight', 'length', 'width', 'height'),
            'classes': ('collapse',)
        }),
        ('Product Options', {
            'fields': ('colors', 'sizes'),
            'classes': ('collapse',)
        }),
    )

@admin.register(LandingPageOrder)
class LandingPageOrderAdmin(ModelAdmin):
    list_display = ('order_number', 'full_name', 'product', 'quantity', 'unit_price', 'shipping_charge', 'total_price', 'is_wholesaler', 'status', 'created_at')
    list_filter = ('status', 'is_wholesaler', 'shipping_method', 'created_at')
    search_fields = ('order_number', 'full_name', 'email', 'phone', 'alternative_phone', 'product__name')
    readonly_fields = ('order_number', 'created_at', 'updated_at', 'total_price')
    autocomplete_fields = ['product', 'user']
    
    fieldsets = (
        ('Order Information', {
            'fields': ('order_number', 'status', 'created_at', 'updated_at')
        }),
        ('Product Details', {
            'fields': ('product', 'quantity', 'unit_price', 'is_wholesaler'),
            'description': 'Unit price will be auto-set from product if left at 0'
        }),
        ('Shipping Details', {
            'fields': ('shipping_method', 'shipping_charge', 'total_price'),
            'description': 'Shipping charge will be auto-calculated if shipping method is selected. Total price updates automatically.'
        }),
        ('Customer Information', {
            'fields': ('full_name', 'email', 'phone', 'alternative_phone', 'detailed_address', 'user')
        }),
        ('Notes', {
            'fields': ('customer_notes', 'admin_notes'),
            'classes': ('collapse',)
        }),
    )
    
    def save_model(self, request, obj, form, change):
        # Ensure pricing is calculated before saving
        obj.save()
        super().save_model(request, obj, form, change)
