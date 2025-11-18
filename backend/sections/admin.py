# sections/admin.py
from django.contrib import admin
from django.core.exceptions import ValidationError
from django.utils.html import format_html
from django.db import models
from unfold.admin import ModelAdmin, TabularInline, StackedInline
from unfold.contrib.filters.admin import RangeDateFilter
from unfold.contrib.forms.widgets import WysiwygWidget, ArrayWidget
from unfold.decorators import display
from .models import Section, SectionItem, PageSection


class SectionItemInline(TabularInline):
    """Inline for managing section items"""
    model = SectionItem
    extra = 1
    fields = ('product', 'category', 'order', 'is_featured', 'custom_title', 'special_price')
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('product', 'category')


class PageSectionInline(TabularInline):
    """Inline for managing page section assignments"""
    model = PageSection
    extra = 1
    fields = ('page_name', 'is_active', 'order', 'items_per_row', 'show_title', 'show_subtitle', 'show_view_all')


@admin.register(Section)
class SectionAdmin(ModelAdmin):
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
            'classes': ('collapse',),
            'description': 'Only applicable for Special Offer Based sections'
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    inlines = [SectionItemInline, PageSectionInline]
    
    def get_queryset(self, request):
        return super().get_queryset(request).prefetch_related('items', 'page_assignments')
    
    @display(description="Items Count")
    def items_count(self, obj):
        count = obj.items.count()
        return format_html(
            '<span style="color: {};">{}</span>',
            'green' if count > 0 else 'red',
            count
        )
    
    @display(description="Pages Count")
    def pages_count(self, obj):
        count = obj.page_assignments.filter(is_active=True).count()
        return format_html(
            '<span style="color: {};">{}</span>',
            'green' if count > 0 else 'orange',
            count
        )
    
    def formfield_for_dbfield(self, db_field, request, **kwargs):
        if db_field.name == 'description':
            kwargs['widget'] = WysiwygWidget()
        return super().formfield_for_dbfield(db_field, request, **kwargs)


@admin.register(SectionItem)
class SectionItemAdmin(ModelAdmin):
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
    
    @display(description="Item Name")
    def get_item_name(self, obj):
        if obj.product:
            return obj.product.name
        elif obj.category:
            return obj.category.name
        return "-"
    
    @display(description="Item Type")
    def get_item_type(self, obj):
        if obj.product:
            return format_html('<span style="color: blue;">Product</span>')
        elif obj.category:
            return format_html('<span style="color: green;">Category</span>')
        return "-"
    
    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "product":
            kwargs["queryset"] = db_field.related_model.objects.filter(is_active=True).select_related('sub_category')
        elif db_field.name == "category":
            kwargs["queryset"] = db_field.related_model.objects.all()
        return super().formfield_for_foreignkey(db_field, request, **kwargs)


@admin.register(PageSection)
class PageSectionAdmin(ModelAdmin):
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
