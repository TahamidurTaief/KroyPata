# shops/models.py
from django.db import models
from django.conf import settings
from utils.image_optimizer import ImageOptimizer

class Shop(models.Model):
    owner = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='shop', db_index=True)
    name = models.CharField(max_length=255, unique=True, db_index=True)
    slug = models.SlugField(unique=True, db_index=True)
    description = models.TextField(blank=True, null=True)
    logo = models.ImageField(upload_to='shops/logos/', blank=True, null=True)
    cover_photo = models.ImageField(upload_to='shops/covers/', blank=True, null=True)
    contact_email = models.EmailField(db_index=True)
    contact_phone = models.CharField(max_length=20, blank=True, null=True)
    address = models.CharField(max_length=255, blank=True, null=True)
    is_active = models.BooleanField(default=True, help_text="Is the shop currently open for business?", db_index=True)
    is_verified = models.BooleanField(default=False, help_text="Has the shop been verified by the admin?", db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True, db_index=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['is_active', 'is_verified'], name='shop_active_verified_idx'),
            models.Index(fields=['is_active', '-created_at'], name='shop_active_created_idx'),
        ]

    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        # Optimize shop images before saving
        if self.logo and hasattr(self.logo, 'file'):
            try:
                optimized = ImageOptimizer.optimize_logo_image(self.logo.file)
                if optimized:
                    self.logo.file = optimized
            except Exception as e:
                print(f"Error optimizing shop logo: {e}")
        
        if self.cover_photo and hasattr(self.cover_photo, 'file'):
            try:
                optimized = ImageOptimizer.optimize_banner_image(self.cover_photo.file)
                if optimized:
                    self.cover_photo.file = optimized
            except Exception as e:
                print(f"Error optimizing shop cover photo: {e}")
        
        super().save(*args, **kwargs)
