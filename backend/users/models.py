# users/models.py
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.db import models

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email must be set')
        email = self.normalize_email(email)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('user_type', 'CUSTOMER')
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('user_type', 'ADMIN')
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        
        return self.create_user(email, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    USER_TYPE_CHOICES = [
        ('CUSTOMER', 'Customer'),
        ('SELLER', 'Seller'),
        ('WHOLESALER', 'Wholesaler'),
        ('AFFILIATE', 'Affiliate'),
        ('ADMIN', 'Admin'),
    ]
    
    email = models.EmailField(unique=True, db_index=True)
    name = models.CharField(max_length=255)
    user_type = models.CharField(
        max_length=10,
        choices=USER_TYPE_CHOICES,
        default='CUSTOMER',
        db_index=True
    )
    is_active = models.BooleanField(default=True, db_index=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True, db_index=True)
    
    # Legacy fields for compatibility (can be removed if not needed)
    full_name = models.CharField(max_length=255, blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']
    
    objects = CustomUserManager()
    
    def __str__(self):
        return self.email
    
    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        indexes = [
            models.Index(fields=['user_type', 'is_active'], name='user_type_active_idx'),
            models.Index(fields=['-date_joined'], name='user_date_joined_idx'),
        ]

class Address(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='addresses', null=True, blank=True, db_index=True)
    address_line_1 = models.CharField(max_length=255)
    address_line_2 = models.CharField(max_length=255, blank=True, null=True)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100, verbose_name="State / Province / Region")
    postal_code = models.CharField(max_length=20)
    country = models.CharField(max_length=100)
    is_default = models.BooleanField(default=False, db_index=True)

    class Meta:
        verbose_name_plural = "Addresses"
        indexes = [
            models.Index(fields=['user', 'is_default'], name='address_user_default_idx'),
        ]
        
    def __str__(self):
        if self.user:
            return f"{self.user.email}: {self.address_line_1}, {self.city}"
        else:
            return f"Guest: {self.address_line_1}, {self.city}"


class WholesalerProfile(models.Model):
    """Profile for wholesaler users with business information and approval system"""
    APPROVAL_STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='wholesaler_profile')
    business_name = models.CharField(max_length=255, help_text="Legal business name")
    business_type = models.CharField(
        max_length=100, 
        blank=True, 
        null=True, 
        help_text="Type of business (e.g., Import/Export, Retail, Manufacturing)"
    )
    trade_license = models.FileField(
        upload_to='wholesaler/trade_licenses/',
        help_text="Upload trade license or business registration document"
    )
    approval_status = models.CharField(
        max_length=10,
        choices=APPROVAL_STATUS_CHOICES,
        default='PENDING',
        help_text="Admin approval status for wholesaler account"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    approved_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='approved_wholesalers',
        help_text="Admin who approved this wholesaler"
    )
    
    class Meta:
        verbose_name = "Wholesaler Profile"
        verbose_name_plural = "Wholesaler Profiles"
        
    def __str__(self):
        return f"{self.business_name} - {self.user.email} ({self.approval_status})"


class AffiliateProfile(models.Model):
    """Profile for affiliate users with referral system and approval"""
    APPROVAL_STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='affiliate_profile')
    referral_code = models.CharField(
        max_length=20,
        unique=True,
        help_text="Unique referral code for affiliate marketing"
    )
    approval_status = models.CharField(
        max_length=10,
        choices=APPROVAL_STATUS_CHOICES,
        default='PENDING',
        help_text="Admin approval status for affiliate account"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    approved_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='approved_affiliates',
        help_text="Admin who approved this affiliate"
    )
    
    def save(self, *args, **kwargs):
        """Auto-generate referral code if not provided"""
        if not self.referral_code:
            import string
            import random
            # Generate a unique 8-character referral code
            while True:
                code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
                if not AffiliateProfile.objects.filter(referral_code=code).exists():
                    self.referral_code = code
                    break
        super().save(*args, **kwargs)
    
    class Meta:
        verbose_name = "Affiliate Profile"
        verbose_name_plural = "Affiliate Profiles"
        
    def __str__(self):
        return f"{self.user.email} - {self.referral_code} ({self.approval_status})"
