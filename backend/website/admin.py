# ===================================================================
# website/admin.py - Standard Django Admin (No Unfold)

from django.contrib import admin
from django.utils.html import format_html
from django.db import models
from .models import (
    NavbarSettings, OfferCategory, HeroBanner, OfferBanner, 
    HorizontalPromoBanner, BlogPost, FooterSection, FooterLink, 
    SocialMediaLink, SiteSettings
)

@admin.register(NavbarSettings)
class NavbarSettingsAdmin(admin.ModelAdmin):
    list_display = ['name', 'link_type', 'url', 'order', 'colored_is_active', 'show_in_mobile', 'show_in_desktop']
    list_filter = ['link_type', 'is_active', 'show_in_mobile', 'show_in_desktop']
    search_fields = ['name', 'url']
    list_editable = ['order', 'show_in_mobile', 'show_in_desktop']
    ordering = ['order', 'name']
    
    fieldsets = (
        ('Link Information', {
            'fields': ('name', 'link_type', 'url', 'icon_class'),
        }),
        ('Hierarchy & Navigation', {
            'fields': ('parent', 'order'),
        }),
        ('Display Options', {
            'fields': ('show_in_mobile', 'show_in_desktop', 'is_active'),
        }),
    )
    
    def colored_is_active(self, obj):
        if obj.is_active:
            return format_html('<span style="color: #10b981; font-weight: bold;">● Active</span>')
        return format_html('<span style="color: #ef4444; font-weight: bold;">● Inactive</span>')
    colored_is_active.short_description = 'Status'
    colored_is_active.admin_order_field = 'is_active'

@admin.register(OfferCategory)
class OfferCategoryAdmin(admin.ModelAdmin):
    list_display = ['title', 'name', 'category_display', 'slug', 'order', 'badge_display', 'featured_badge', 'colored_status']
    list_filter = ['is_active', 'is_featured', 'order', 'badge_color', 'category']
    search_fields = ['name', 'title', 'category__name', 'slug', 'description']
    list_editable = ['order']
    prepopulated_fields = {'slug': ('name',)}
    ordering = ['order', 'name']
    autocomplete_fields = ['category']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'title', 'category', 'slug'),
        }),
        ('Landing Page Link', {
            'fields': ('link',),
        }),
        ('Content', {
            'fields': ('description',),
        }),
        ('Display Options', {
            'fields': ('order', 'is_featured', 'badge_text', 'badge_color', 'icon_class'),
        }),
        ('Status', {
            'fields': ('is_active',),
        }),
    )
    
    def category_display(self, obj):
        if obj.category:
            return format_html('<span style="background:#dbeafe;color:#1e40af;padding:4px 8px;border-radius:4px;font-size:11px;">{}</span>', obj.category.name)
        return format_html('<span style="color:#9ca3af;font-size:11px;">No category</span>')
    category_display.short_description = 'Category'
    category_display.admin_order_field = 'category__name'
    
    def badge_display(self, obj):
        if obj.badge_text:
            color_map = {
                'red': 'background:#fecaca;color:#991b1b;',
                'blue': 'background:#dbeafe;color:#1e40af;',
                'green': 'background:#d1fae5;color:#065f46;',
                'orange': 'background:#fed7aa;color:#92400e;',
            }
            color_style = color_map.get(obj.badge_color, 'background:#fecaca;color:#991b1b;')
            return format_html('<span style="{}padding:4px 8px;border-radius:4px;font-size:11px;">{}</span>', color_style, obj.badge_text)
        return format_html('<span style="color:#9ca3af;font-size:11px;">No badge</span>')
    badge_display.short_description = 'Badge'
    badge_display.admin_order_field = 'badge_text'
    
    def featured_badge(self, obj):
        if obj.is_featured:
            return format_html('<span style="background:#fef3c7;color:#92400e;padding:4px 8px;border-radius:4px;font-size:11px;">⭐ Featured</span>')
        return format_html('<span style="background:#f3f4f6;color:#6b7280;padding:4px 8px;border-radius:4px;font-size:11px;">Regular</span>')
    featured_badge.short_description = 'Featured'
    featured_badge.admin_order_field = 'is_featured'
    featured_badge.boolean = True
    
    def colored_status(self, obj):
        if obj.is_active:
            return format_html('<span style="background:#d1fae5;color:#065f46;padding:4px 8px;border-radius:4px;font-size:11px;">● Active</span>')
        return format_html('<span style="background:#fecaca;color:#991b1b;padding:4px 8px;border-radius:4px;font-size:11px;">● Inactive</span>')
    colored_status.short_description = 'Status'
    colored_status.admin_order_field = 'is_active'

@admin.register(HeroBanner)
class HeroBannerAdmin(admin.ModelAdmin):
    list_display = ['title', 'order', 'autoplay_duration', 'colored_status', 'image_preview', 'created_at']
    list_filter = ['is_active', 'created_at', 'autoplay_duration']
    search_fields = ['title', 'subtitle', 'description']
    list_editable = ['order', 'autoplay_duration']
    ordering = ['order', '-created_at']
    readonly_fields = ['id', 'created_at', 'updated_at', 'image_preview']
    
    fieldsets = (
        ('Content', {
            'fields': ('title', 'subtitle', 'description'),
        }),
        ('Visual Content', {
            'fields': ('image', 'image_url', 'image_preview'),
        }),
        ('Call to Action', {
            'fields': ('button_text', 'button_url'),
        }),
        ('Display Settings', {
            'fields': ('order', 'autoplay_duration', 'is_active'),
        }),
        ('System Info', {
            'fields': ('id', 'created_at', 'updated_at'),
            'classes': ('collapse',),
        })
    )
    
    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="width:80px;height:48px;object-fit:cover;border-radius:4px;border:1px solid #e5e7eb;" />', obj.image.url)
        elif obj.image_url:
            return format_html('<img src="{}" style="width:80px;height:48px;object-fit:cover;border-radius:4px;border:1px solid #e5e7eb;" />', obj.image_url)
        return format_html('<div style="width:80px;height:48px;background:#f3f4f6;border-radius:4px;border:1px solid #e5e7eb;display:flex;align-items:center;justify-content:center;color:#9ca3af;font-size:11px;">No Image</div>')
    image_preview.short_description = 'Image'
    image_preview.admin_order_field = 'image'
    
    def colored_status(self, obj):
        if obj.is_active:
            return format_html('<span style="background:#d1fae5;color:#065f46;padding:4px 8px;border-radius:4px;font-size:11px;">● Active</span>')
        return format_html('<span style="background:#fecaca;color:#991b1b;padding:4px 8px;border-radius:4px;font-size:11px;">● Inactive</span>')
    colored_status.short_description = 'Status'
    colored_status.admin_order_field = 'is_active'
    colored_status.boolean = True

@admin.register(OfferBanner)
class OfferBannerAdmin(admin.ModelAdmin):
    list_display = ['title', 'banner_type_badge', 'discount_tag', 'coupon_code', 'order', 'colored_status', 'image_preview']
    list_filter = ['banner_type', 'is_active', 'show_on_mobile', 'show_on_desktop', 'created_at', 'order']
    search_fields = ['title', 'description', 'coupon_code', 'button_text']
    list_editable = ['order']
    ordering = ['banner_type', 'order']
    readonly_fields = ['id', 'created_at', 'updated_at', 'image_preview']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'subtitle', 'description', 'banner_type'),
        }),
        ('Visual Design', {
            'fields': ('image', 'image_url', 'alt_text', 'gradient_colors', 'image_preview'),
        }),
        ('Promotional Content', {
            'fields': ('discount_text', 'coupon_code', 'button_text', 'button_url'),
        }),
        ('Display Options', {
            'fields': ('order', 'show_on_mobile', 'show_on_desktop', 'is_active'),
        }),
        ('SEO & Metadata', {
            'fields': ('meta_title', 'meta_description'),
            'classes': ('collapse',),
        }),
        ('System Info', {
            'fields': ('id', 'created_at', 'updated_at'),
            'classes': ('collapse',),
        })
    )
    
    def banner_type_badge(self, obj):
        colors = {
            'main': 'background:#dbeafe;color:#1e40af;',
            'vertical': 'background:#e9d5ff;color:#6b21a8;',
            'horizontal': 'background:#d1fae5;color:#065f46;'
        }
        color = colors.get(obj.banner_type, 'background:#f3f4f6;color:#6b7280;')
        return format_html('<span style="{}padding:4px 8px;border-radius:4px;font-size:11px;">{}</span>', color, obj.get_banner_type_display())
    banner_type_badge.short_description = 'Type'
    banner_type_badge.admin_order_field = 'banner_type'
    
    def discount_tag(self, obj):
        if obj.discount_text:
            return format_html('<span style="background:#fef3c7;color:#92400e;padding:4px 8px;border-radius:4px;font-size:11px;">🏷️ {}</span>', obj.discount_text)
        return '—'
    discount_tag.short_description = 'Discount'
    discount_tag.admin_order_field = 'discount_text'
    
    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="width:64px;height:40px;object-fit:cover;border-radius:4px;border:1px solid #e5e7eb;" />', obj.image.url)
        elif obj.image_url:
            return format_html('<img src="{}" style="width:64px;height:40px;object-fit:cover;border-radius:4px;border:1px solid #e5e7eb;" />', obj.image_url)
        return format_html('<div style="width:64px;height:40px;background:#f3f4f6;border-radius:4px;border:1px solid #e5e7eb;display:flex;align-items:center;justify-content:center;color:#9ca3af;font-size:11px;">📷</div>')
    image_preview.short_description = 'Image'
    image_preview.admin_order_field = 'image'
    
    def colored_status(self, obj):
        if obj.is_active:
            return format_html('<span style="background:#d1fae5;color:#065f46;padding:4px 8px;border-radius:4px;font-size:11px;">● Live</span>')
        return format_html('<span style="background:#fecaca;color:#991b1b;padding:4px 8px;border-radius:4px;font-size:11px;">● Draft</span>')
    colored_status.short_description = 'Status'
    colored_status.admin_order_field = 'is_active'
    colored_status.boolean = True

@admin.register(HorizontalPromoBanner)
class HorizontalPromoBannerAdmin(admin.ModelAdmin):
    list_display = ['title', 'button_text', 'order', 'colored_status', 'image_preview', 'created_at']
    list_filter = ['is_active', 'created_at', 'order']
    search_fields = ['title', 'subtitle', 'button_text']
    list_editable = ['order']
    ordering = ['order', '-created_at']
    readonly_fields = ['id', 'created_at', 'updated_at', 'image_preview']
    
    fieldsets = (
        ('Content', {
            'fields': ('title', 'subtitle'),
        }),
        ('Visual Content', {
            'fields': ('image', 'image_url', 'image_preview'),
        }),
        ('Call to Action', {
            'fields': ('button_text', 'button_url'),
        }),
        ('Display Settings', {
            'fields': ('order', 'is_active'),
        }),
        ('System Info', {
            'fields': ('id', 'created_at', 'updated_at'),
            'classes': ('collapse',),
        })
    )
    
    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="width:96px;height:48px;object-fit:cover;border-radius:4px;border:1px solid #e5e7eb;" />', obj.image.url)
        elif obj.image_url:
            return format_html('<img src="{}" style="width:96px;height:48px;object-fit:cover;border-radius:4px;border:1px solid #e5e7eb;" />', obj.image_url)
        return format_html('<div style="width:96px;height:48px;background:#f3f4f6;border-radius:4px;border:1px solid #e5e7eb;display:flex;align-items:center;justify-content:center;color:#9ca3af;font-size:11px;">No Image</div>')
    image_preview.short_description = 'Image'
    image_preview.admin_order_field = 'image'
    
    def colored_status(self, obj):
        if obj.is_active:
            return format_html('<span style="background:#d1fae5;color:#065f46;padding:4px 8px;border-radius:4px;font-size:11px;">● Active</span>')
        return format_html('<span style="background:#fecaca;color:#991b1b;padding:4px 8px;border-radius:4px;font-size:11px;">● Inactive</span>')
    colored_status.short_description = 'Status'
    colored_status.admin_order_field = 'is_active'
    colored_status.boolean = True

class FooterLinkInline(admin.TabularInline):
    model = FooterLink
    extra = 1
    fields = ('title', 'url', 'order', 'is_active')

@admin.register(FooterSection)
class FooterSectionAdmin(admin.ModelAdmin):
    list_display = ['title', 'order', 'links_count', 'colored_status']
    list_filter = ['is_active']
    search_fields = ['title']
    list_editable = ['order']
    ordering = ['order']
    inlines = [FooterLinkInline]
    
    def links_count(self, obj):
        return obj.links.count()
    links_count.short_description = 'Links'
    
    def colored_status(self, obj):
        if obj.is_active:
            return format_html('<span style="color:#10b981;font-weight:bold;">● Active</span>')
        return format_html('<span style="color:#ef4444;font-weight:bold;">● Inactive</span>')
    colored_status.short_description = 'Status'
    colored_status.admin_order_field = 'is_active'

@admin.register(FooterLink)
class FooterLinkAdmin(admin.ModelAdmin):
    list_display = ['text', 'section', 'url', 'order', 'colored_status']
    list_filter = ['section', 'is_active']
    search_fields = ['text', 'url']
    list_editable = ['order']
    ordering = ['section', 'order']
    autocomplete_fields = ['section']
    
    def colored_status(self, obj):
        if obj.is_active:
            return format_html('<span style="color:#10b981;font-weight:bold;">● Active</span>')
        return format_html('<span style="color:#ef4444;font-weight:bold;">● Inactive</span>')
    colored_status.short_description = 'Status'
    colored_status.admin_order_field = 'is_active'

@admin.register(SocialMediaLink)
class SocialMediaLinkAdmin(admin.ModelAdmin):
    list_display = ['platform', 'url', 'order', 'colored_status']
    list_filter = ['platform', 'is_active']
    search_fields = ['platform', 'url']
    list_editable = ['order']
    ordering = ['order']
    
    def colored_status(self, obj):
        if obj.is_active:
            return format_html('<span style="color:#10b981;font-weight:bold;">● Active</span>')
        return format_html('<span style="color:#ef4444;font-weight:bold;">● Inactive</span>')
    colored_status.short_description = 'Status'
    colored_status.admin_order_field = 'is_active'

@admin.register(SiteSettings)
class SiteSettingsAdmin(admin.ModelAdmin):
    list_display = ['key', 'value', 'setting_type', 'group', 'is_active']
    list_filter = ['setting_type', 'group', 'is_active']
    search_fields = ['key', 'value', 'description']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Setting Information', {
            'fields': ('key', 'value', 'setting_type', 'group'),
        }),
        ('Description', {
            'fields': ('description',),
        }),
        ('Status', {
            'fields': ('is_active', 'created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )

@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = ['title', 'slug', 'is_featured', 'publish_date', 'is_active']
    list_filter = ['is_featured', 'is_active', 'publish_date']
    search_fields = ['title', 'content', 'description']
    prepopulated_fields = {'slug': ('title',)}
    readonly_fields = ['publish_date', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Content', {
            'fields': ('title', 'slug', 'description', 'content'),
        }),
        ('Media', {
            'fields': ('featured_image', 'featured_image_url'),
        }),
        ('Display Settings', {
            'fields': ('is_featured', 'order', 'is_active'),
        }),
        ('Publishing', {
            'fields': ('publish_date', 'created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )
