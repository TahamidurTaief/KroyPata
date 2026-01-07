# sections/admin.py
from django.contrib import admin
from django.core.exceptions import ValidationError
from django.utils.html import format_html
from django.db import models
from .models import Section, SectionItem, PageSection


class SectionItemInline(admin.TabularInline):
    model = SectionItem
    extra = 1
    fields = ('product', 'category', 'order', 'is_featured', 'custom_title', 'special_price')
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('product', 'category')


class PageSectionInline(admin.TabularInline):
    model = PageSection
    extra = 1
    fields = ('page_name', 'is_active', 'order', 'items_per_row', 'show_title', 'show_subtitle', 'show_view_all')


@admin.register(Section)
class SectionAdmin(admin.ModelAdmin):
    list_display = (
        'name', 
        'section_type', 
        'is_active', 
        'order', 
        'items_count',
        'pages_count',
        'created_at'
    )
    list_filter = ('section_type', 'is_active', 'created_at')
    search_fields = ('name', 'slug', 'description')
    prepopulated_fields = {'slug': ('name',)}
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'slug', 'description', 'section_type')
        }),
        ('Display Settings', {
            'fields': ('title_display', 'subtitle_display', 'is_active', 'order', 'max_items')
        }),
        ('Special Offer Settings', {
            'fields': ('discount_percentage', 'offer_start_date', 'offer_end_date'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    inlines = [SectionItemInline, PageSectionInline]
    
    def get_queryset(self, request):
        return super().get_queryset(request).prefetch_related('items', 'page_assignments')
    
    def items_count(self, obj):
        count = obj.items.count()
        return format_html(
            '<span style="color: {};">{}</span>',
            'green' if count > 0 else 'red',
            count
        )
    items_count.short_description = "Items Count"
    
    def pages_count(self, obj):
        count = obj.page_assignments.filter(is_active=True).count()
        return format_html(
            '<span style="color: {};">{}</span>',
            'green' if count > 0 else 'orange',
            count
        )
    pages_count.short_description = "Pages Count"


@admin.register(SectionItem)
class SectionItemAdmin(admin.ModelAdmin):
    list_display = (
        'section', 
        'get_item_name', 
        'get_item_type', 
        'order', 
        'is_featured', 
        'special_price',
        'created_at'
    )
    list_filter = ('section__section_type', 'is_featured', 'section', 'created_at')
    search_fields = ('section__name', 'product__name', 'category__name', 'custom_title')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Section & Item', {
            'fields': ('section', 'product', 'category')
        }),
        ('Display Settings', {
            'fields': ('order', 'is_featured', 'custom_title', 'custom_description')
        }),
        ('Special Pricing', {
            'fields': ('special_price',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('section', 'product', 'category')
    
    def get_item_name(self, obj):
        if obj.product:
            return obj.product.name
        elif obj.category:
            return obj.category.name
        return "-"
    get_item_name.short_description = "Item Name"
    
    def get_item_type(self, obj):
        if obj.product:
            return format_html('<span style="color: blue;">Product</span>')
        elif obj.category:
            return format_html('<span style="color: green;">Category</span>')
        return "-"
    get_item_type.short_description = "Item Type"
    
    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "product":
            kwargs["queryset"] = db_field.related_model.objects.filter(is_active=True).select_related('sub_category')
        elif db_field.name == "category":
            kwargs["queryset"] = db_field.related_model.objects.all()
        return super().formfield_for_foreignkey(db_field, request, **kwargs)


@admin.register(PageSection)
class PageSectionAdmin(admin.ModelAdmin):
    list_display = (
        'section', 
        'page_name', 
        'is_active', 
        'order', 
        'items_per_row',
        'show_title',
        'show_subtitle',
        'show_view_all'
    )
    list_filter = ('page_name', 'is_active', 'section__section_type')
    search_fields = ('section__name',)
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Assignment', {
            'fields': ('section', 'page_name', 'is_active', 'order')
        }),
        ('Layout Settings', {
            'fields': ('items_per_row', 'show_title', 'show_subtitle', 'show_view_all')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('section')


# Custom admin actions
@admin.action(description='Activate selected sections')
def activate_sections(modeladmin, request, queryset):
    queryset.update(is_active=True)


@admin.action(description='Deactivate selected sections')
def deactivate_sections(modeladmin, request, queryset):
    queryset.update(is_active=False)


# Add actions to SectionAdmin
SectionAdmin.actions = [activate_sections, deactivate_sections]
