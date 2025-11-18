# shops/admin.py
from django.contrib import admin
from unfold.admin import ModelAdmin
from import_export.admin import ImportExportModelAdmin
from .models import Shop

@admin.register(Shop)
class ShopAdmin(ImportExportModelAdmin, ModelAdmin):
    list_display = ('name', 'owner', 'is_active', 'is_verified', 'created_at')
    list_filter = ('is_active', 'is_verified', 'created_at')
    search_fields = ('name', 'owner__email', 'owner__first_name', 'owner__last_name', 'slug')
    ordering = ('-created_at',)
    prepopulated_fields = {'slug': ('name',)}
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'slug', 'description', 'owner')
        }),
        ('Contact Information', {
            'fields': ('contact_email', 'contact_phone', 'address')
        }),
        ('Media', {
            'fields': ('logo', 'cover_photo')
        }),
        ('Status', {
            'fields': ('is_active', 'is_verified')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )