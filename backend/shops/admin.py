# shops/admin.py
from django.contrib import admin
from import_export.admin import ImportExportModelAdmin
from .models import Shop

@admin.register(Shop)
class ShopAdmin(ImportExportModelAdmin, admin.ModelAdmin):
    list_display = ('name', 'owner', 'is_active', 'is_verified', 'created_at')
    list_filter = ('is_active', 'is_verified', 'created_at')
    search_fields = ('name', 'owner__email', 'owner__name', 'slug')
    ordering = ('-created_at',)
    prepopulated_fields = {'slug': ('name',)}
    readonly_fields = ('created_at', 'updated_at')
    autocomplete_fields = ['owner']
    
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
