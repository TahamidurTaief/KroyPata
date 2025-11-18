from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.forms import ReadOnlyPasswordHashField
from django.utils.translation import gettext_lazy as _
from django import forms
from import_export.admin import ExportMixin
from import_export import resources

from unfold.admin import ModelAdmin, TabularInline
# from unfold.decorators import display_with_icon
from django.utils import timezone

from .models import User, Address, WholesalerProfile, AffiliateProfile

# ------------------------------
# User Creation and Change Forms
# ------------------------------
class UserCreationForm(forms.ModelForm):
    """A form for creating new users. Includes all the required
    fields, plus a repeated password."""
    password1 = forms.CharField(label='Password', widget=forms.PasswordInput)
    password2 = forms.CharField(label='Password confirmation', widget=forms.PasswordInput)

    class Meta:
        model = User
        fields = ('email', 'name', 'user_type')

    def clean_password2(self):
        # Check that the two password entries match
        password1 = self.cleaned_data.get("password1")
        password2 = self.cleaned_data.get("password2")
        if password1 and password2 and password1 != password2:
            raise forms.ValidationError("Passwords don't match")
        return password2

    def save(self, commit=True):
        # Save the provided password in hashed format
        user = super().save(commit=False)
        user.set_password(self.cleaned_data["password1"])
        if commit:
            user.save()
        return user


class UserChangeForm(forms.ModelForm):
    """A form for updating users. Includes all the fields on
    the user, but replaces the password field with admin's
    password hash display field.
    """
    password = ReadOnlyPasswordHashField()

    class Meta:
        model = User
        fields = ('email', 'name', 'user_type', 'password', 'is_active', 'is_staff', 'is_superuser')

    def clean_password(self):
        # Regardless of what the user provides, return the initial value.
        # This is done here, rather than on the field, because the
        # field does not have access to the initial value
        return self.initial["password"]

# ------------------------------
# User Resource for Import/Export
# ------------------------------
class UserResource(resources.ModelResource):
    class Meta:
        model = User
        fields = ('id', 'email', 'name', 'user_type', 'full_name', 'phone', 'is_active', 'is_staff', 'is_superuser', 'date_joined', 'last_login')
        export_order = fields

# ------------------------------
# Inline Classes for User Profiles
# ------------------------------
class WholesalerProfileInline(TabularInline):
    model = WholesalerProfile
    fk_name = 'user'
    extra = 0
    fields = ('business_name', 'trade_license', 'approval_status', 'approved_by', 'approved_at')
    readonly_fields = ('created_at', 'updated_at')
    
    def save_model(self, request, obj, form, change):
        # Set approved_by and approved_at when status changes to APPROVED
        if obj.approval_status == 'APPROVED' and not obj.approved_at:
            obj.approved_by = request.user
            obj.approved_at = timezone.now()
        elif obj.approval_status != 'APPROVED':
            obj.approved_by = None
            obj.approved_at = None
        super().save_model(request, obj, form, change)


class AffiliateProfileInline(TabularInline):
    model = AffiliateProfile
    fk_name = 'user'
    extra = 0
    fields = ('referral_code', 'approval_status', 'approved_by', 'approved_at')
    readonly_fields = ('referral_code', 'created_at', 'updated_at')
    
    def save_model(self, request, obj, form, change):
        # Set approved_by and approved_at when status changes to APPROVED
        if obj.approval_status == 'APPROVED' and not obj.approved_at:
            obj.approved_by = request.user
            obj.approved_at = timezone.now()
        elif obj.approval_status != 'APPROVED':
            obj.approved_by = None
            obj.approved_at = None
        super().save_model(request, obj, form, change)


# ------------------------------
# User Admin
# ------------------------------
@admin.register(User)
class CustomUserAdmin(ExportMixin, BaseUserAdmin, ModelAdmin):
    # The forms to add and change user instances
    form = UserChangeForm
    add_form = UserCreationForm
    resource_class = UserResource

    # The fields to be used in displaying the User model.
    # These override the definitions on the base UserAdmin
    # that reference specific fields on auth.User.
    list_display = ('email', 'name', 'user_type', 'is_active', 'is_staff', 'is_superuser', 'date_joined')
    list_filter = ('user_type', 'is_active', 'is_staff', 'is_superuser', 'date_joined')
    search_fields = ('email', 'name', 'full_name', 'phone')
    ordering = ('-date_joined',)
    readonly_fields = ('last_login', 'date_joined')
    filter_horizontal = ('groups', 'user_permissions')

    # Fieldsets for editing users
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        (_('Personal Info'), {
            'fields': ('name', 'user_type', 'full_name', 'phone'),
            'classes': ('wide',)
        }),
        (_('Permissions'), {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
            'classes': ('collapse',)
        }),
        (_('Important dates'), {
            'fields': ('last_login', 'date_joined'),
            'classes': ('collapse',)
        }),
    )

    # add_fieldsets is not a standard ModelAdmin attribute. UserAdmin
    # overrides get_fieldsets to use this attribute when creating a user.
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'name', 'user_type', 'password1', 'password2'),
        }),
        (_('Permissions'), {
            'fields': ('is_active', 'is_staff', 'is_superuser'),
            'classes': ('collapse',)
        }),
    )
    
    inlines = [WholesalerProfileInline, AffiliateProfileInline]

    def get_form(self, request, obj=None, **kwargs):
        """
        Use special form during user creation
        """
        defaults = {}
        if obj is None:
            defaults['form'] = self.add_form
        defaults.update(kwargs)
        return super().get_form(request, obj, **defaults)

# ------------------------------
# Address Resource for Import/Export
# ------------------------------
class AddressResource(resources.ModelResource):
    class Meta:
        model = Address
        fields = (
            'id', 'user__email', 'address_line_1', 'address_line_2',
            'city', 'state', 'postal_code', 'country', 'is_default'
        )
        export_order = fields

# ------------------------------
# Address Admin
# ------------------------------
@admin.register(Address)
class AddressAdmin(ExportMixin, ModelAdmin):
    resource_class = AddressResource

    list_display = ('user', 'address_line_1', 'city', 'state', 'country', 'is_default')
    list_filter = ('city', 'state', 'country', 'is_default')
    search_fields = ('user__email', 'address_line_1', 'city', 'postal_code', 'country')

    autocomplete_fields = ('user',)


# ------------------------------
# WholesalerProfile Admin
# ------------------------------
@admin.register(WholesalerProfile)
class WholesalerProfileAdmin(ModelAdmin):
    list_display = ('user', 'business_name', 'approval_status', 'created_at', 'approved_at', 'approved_by')
    list_filter = ('approval_status', 'created_at', 'approved_at')
    search_fields = ('user__email', 'business_name')
    readonly_fields = ('created_at', 'updated_at')
    autocomplete_fields = ('user', 'approved_by')
    
    fieldsets = (
        (None, {'fields': ('user', 'business_name', 'trade_license')}),
        (_('Approval'), {
            'fields': ('approval_status', 'approved_by', 'approved_at'),
            'classes': ('wide',)
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def save_model(self, request, obj, form, change):
        # Set approved_by and approved_at when status changes to APPROVED
        if obj.approval_status == 'APPROVED' and not obj.approved_at:
            obj.approved_by = request.user
            obj.approved_at = timezone.now()
        elif obj.approval_status != 'APPROVED':
            obj.approved_by = None
            obj.approved_at = None
        super().save_model(request, obj, form, change)


# ------------------------------
# AffiliateProfile Admin
# ------------------------------
@admin.register(AffiliateProfile)
class AffiliateProfileAdmin(ModelAdmin):
    list_display = ('user', 'referral_code', 'approval_status', 'created_at', 'approved_at', 'approved_by')
    list_filter = ('approval_status', 'created_at', 'approved_at')
    search_fields = ('user__email', 'referral_code')
    readonly_fields = ('referral_code', 'created_at', 'updated_at')
    autocomplete_fields = ('user', 'approved_by')
    
    fieldsets = (
        (None, {'fields': ('user', 'referral_code')}),
        (_('Approval'), {
            'fields': ('approval_status', 'approved_by', 'approved_at'),
            'classes': ('wide',)
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def save_model(self, request, obj, form, change):
        # Set approved_by and approved_at when status changes to APPROVED
        if obj.approval_status == 'APPROVED' and not obj.approved_at:
            obj.approved_by = request.user
            obj.approved_at = timezone.now()
        elif obj.approval_status != 'APPROVED':
            obj.approved_by = None
            obj.approved_at = None
        super().save_model(request, obj, form, change)
