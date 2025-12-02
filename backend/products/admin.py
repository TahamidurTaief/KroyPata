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

@admin.register(Product)
class ProductAdmin(ModelAdmin):
    list_display = ('name', 'brand', 'shop', 'sub_category', 'shipping_category', 'price', 'wholesale_price', 'minimum_purchase', 'stock', 'is_active', 'enable_landing_page')
    list_filter = ('is_active', 'enable_landing_page', 'brand', 'shop', 'sub_category', 'shipping_category', 'colors', 'sizes')
    search_fields = ('name', 'slug', 'brand__name')
    prepopulated_fields = {'slug': ('name',)}
    inlines = [ProductSpecificationInline, ProductAdditionalImageInline]
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
    list_display = ('order_number', 'full_name', 'product', 'quantity', 'total_price', 'is_wholesaler', 'status', 'created_at')
    list_filter = ('status', 'is_wholesaler', 'created_at')
    search_fields = ('order_number', 'full_name', 'email', 'phone', 'product__name')
    readonly_fields = ('order_number', 'created_at', 'updated_at', 'total_price')
    
    fieldsets = (
        ('Order Information', {
            'fields': ('order_number', 'status', 'created_at', 'updated_at')
        }),
        ('Product Details', {
            'fields': ('product', 'quantity', 'unit_price', 'total_price', 'is_wholesaler')
        }),
        ('Customer Information', {
            'fields': ('full_name', 'email', 'phone', 'detailed_address', 'user')
        }),
        ('Notes', {
            'fields': ('customer_notes', 'admin_notes'),
            'classes': ('collapse',)
        }),
    )
    
    def has_add_permission(self, request):
        # Prevent adding orders from admin (orders should come from landing page)
        return False
