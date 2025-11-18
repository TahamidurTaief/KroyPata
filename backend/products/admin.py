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
    list_display = ('name', 'brand', 'shop', 'sub_category', 'shipping_category', 'price', 'wholesale_price', 'minimum_purchase', 'stock', 'is_active')
    list_filter = ('is_active', 'brand', 'shop', 'sub_category', 'shipping_category', 'colors', 'sizes')
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
        ('Physical Properties', {
            'fields': ('weight', 'length', 'width', 'height'),
            'classes': ('collapse',)
        }),
        ('Product Options', {
            'fields': ('colors', 'sizes'),
            'classes': ('collapse',)
        }),
    )


@admin.register(CategoryMinimumOrderQuantity)
class CategoryMinimumOrderQuantityAdmin(ModelAdmin):
    list_display = ('category', 'minimum_quantity', 'created_at', 'updated_at')
    list_filter = ('created_at', 'updated_at')
    search_fields = ('category__name',)
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Wholesale Rules', {
            'fields': ('category', 'minimum_quantity')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
