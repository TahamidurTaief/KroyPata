# products/admin.py
from django.contrib import admin
from import_export.admin import ImportExportModelAdmin
from .models import *
from .resources import (
    BrandResource, ColorResource, SizeResource, CategoryResource, 
    SubCategoryResource, ProductResource, ProductVariantResource, LandingPageOrderResource
)

@admin.register(Brand)
class BrandAdmin(ImportExportModelAdmin, admin.ModelAdmin):
    resource_class = BrandResource
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
class ColorAdmin(ImportExportModelAdmin, admin.ModelAdmin):
    resource_class = ColorResource
    list_display = ('name', 'hex_code')
    search_fields = ('name',)

@admin.register(Size)
class SizeAdmin(ImportExportModelAdmin, admin.ModelAdmin):
    resource_class = SizeResource
    list_display = ('name',)
    search_fields = ('name',)

@admin.register(Category)
class CategoryAdmin(ImportExportModelAdmin, admin.ModelAdmin):
    resource_class = CategoryResource
    list_display = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ('name', 'slug')

@admin.register(SubCategory)
class SubCategoryAdmin(ImportExportModelAdmin, admin.ModelAdmin):
    resource_class = SubCategoryResource
    list_display = ('name', 'category', 'slug')
    prepopulated_fields = {'slug': ('name',)}
    autocomplete_fields = ['category']
    list_filter = ('category',)
    search_fields = ('name', 'category__name')

class ProductSpecificationInline(admin.TabularInline):
    model = ProductSpecification
    extra = 1

class ProductAdditionalImageInline(admin.TabularInline):
    model = ProductAdditionalImage
    extra = 1

class VariantImageInline(admin.TabularInline):
    model = VariantImage
    extra = 1
    fields = ('image', 'is_primary', 'order')

class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 0
    fields = ('sku', 'color', 'size', 'material', 'price', 'discount_price', 'wholesale_price', 'minimum_purchase', 'stock', 'weight', 'is_active', 'is_default')
    readonly_fields = ('sku',)

@admin.register(ProductVariant)
class ProductVariantAdmin(ImportExportModelAdmin, admin.ModelAdmin):
    resource_class = ProductVariantResource
    list_display = ('__str__', 'product', 'sku', 'color', 'size', 'material', 'price', 'stock', 'is_default', 'is_active')
    list_filter = ('is_active', 'is_default', 'color', 'size', 'product__sub_category')
    search_fields = ('sku', 'product__name', 'material')
    readonly_fields = ('sku', 'created_at', 'updated_at')
    autocomplete_fields = ['product', 'color', 'size']
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
            'fields': ('stock', 'quantity')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

@admin.register(Product)
class ProductAdmin(ImportExportModelAdmin, admin.ModelAdmin):
    resource_class = ProductResource
    list_display = ('name', 'brand', 'shop', 'sub_category', 'price', 'stock', 'is_active')
    list_filter = ('is_active', 'enable_landing_page', 'brand', 'shop', 'sub_category', 'shipping_category')
    search_fields = ('name', 'slug', 'brand__name')
    prepopulated_fields = {'slug': ('name',)}
    autocomplete_fields = ['shop', 'brand', 'sub_category', 'shipping_category']
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
class LandingPageOrderAdmin(ImportExportModelAdmin, admin.ModelAdmin):
    resource_class = LandingPageOrderResource
    list_display = ('order_number', 'full_name', 'product', 'quantity', 'total_price', 'status', 'created_at')
    list_filter = ('status', 'is_wholesaler', 'shipping_method', 'created_at')
    search_fields = ('order_number', 'full_name', 'email', 'phone', 'product__name')
    readonly_fields = ('order_number', 'created_at', 'updated_at', 'total_price')
    autocomplete_fields = ['product', 'variant', 'user', 'shipping_method']
    
    fieldsets = (
        ('Order Information', {
            'fields': ('order_number', 'status', 'created_at', 'updated_at')
        }),
        ('Product Details', {
            'fields': ('product', 'variant', 'quantity', 'unit_price', 'is_wholesaler')
        }),
        ('Shipping Details', {
            'fields': ('shipping_method', 'shipping_charge', 'total_price')
        }),
        ('Customer Information', {
            'fields': ('full_name', 'email', 'phone', 'alternative_phone', 'detailed_address', 'user')
        }),
        ('Notes', {
            'fields': ('customer_notes', 'admin_notes'),
            'classes': ('collapse',)
        }),
    )
