# products/models.py
import uuid
from django.db import models # type: ignore
from django.conf import settings
from shops.models import Shop
from ckeditor.fields import RichTextField # type: ignore
from utils.image_optimizer import ImageOptimizer


class Brand(models.Model):
    name = models.CharField(max_length=100, unique=True, help_text="e.g., Nike, Apple, Samsung", db_index=True)
    logo = models.ImageField(upload_to='brands/', blank=True, null=True, help_text="Brand logo image")
    description = models.TextField(blank=True, help_text="Brief description of the brand")
    website = models.URLField(blank=True, help_text="Official brand website")
    slug = models.SlugField(unique=True, help_text="URL-friendly brand name", db_index=True)
    is_active = models.BooleanField(default=True, help_text="Whether this brand is active", db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        # Optimize logo image before saving
        if self.logo and hasattr(self.logo, 'file'):
            try:
                optimized = ImageOptimizer.optimize_logo_image(self.logo.file)
                if optimized:
                    self.logo.file = optimized
            except Exception as e:
                print(f"Error optimizing brand logo: {e}")
        super().save(*args, **kwargs)

class Color(models.Model):
    name = models.CharField(max_length=50, unique=True, help_text="e.g., Red, Ocean Blue")
    hex_code = models.CharField(max_length=7, unique=True, help_text="e.g., #FF0000")

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name

class Size(models.Model):
    name = models.CharField(max_length=50, unique=True, help_text="e.g., S, M, L, XL, 42")

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True, db_index=True)
    image = models.ImageField(upload_to='categories/', blank=True, null=True)
    slug = models.SlugField(unique=True, db_index=True)
    
    class Meta:
        verbose_name_plural = "Categories"
        ordering = ['name']
        
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        # Optimize category image before saving
        if self.image and hasattr(self.image, 'file'):
            try:
                optimized = ImageOptimizer.optimize_category_image(self.image.file)
                if optimized:
                    self.image.file = optimized
            except Exception as e:
                print(f"Error optimizing category image: {e}")
        super().save(*args, **kwargs)
    
    def get_sections(self):
        """Get all sections this category is part of"""
        from sections.models import SectionItem
        return SectionItem.objects.filter(category=self).select_related('section')
    
    def is_in_section(self, section_slug):
        """Check if category is in a specific section"""
        from sections.models import SectionItem
        return SectionItem.objects.filter(
            category=self, 
            section__slug=section_slug,
            section__is_active=True
        ).exists()

class SubCategory(models.Model):
    name = models.CharField(max_length=100, db_index=True)
    image = models.ImageField(upload_to='subcategories/', blank=True, null=True)
    slug = models.SlugField(unique=True, db_index=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='subcategories', db_index=True)
    
    class Meta:
        unique_together = ('name', 'category')
        ordering = ['category__name', 'name']
        indexes = [
            models.Index(fields=['category', 'name'], name='subcat_cat_name_idx'),
        ]
        
    def __str__(self):
        return f"{self.name} ({self.category.name})"
    
    def save(self, *args, **kwargs):
        # Optimize subcategory image before saving
        if self.image and hasattr(self.image, 'file'):
            try:
                optimized = ImageOptimizer.optimize_category_image(self.image.file)
                if optimized:
                    self.image.file = optimized
            except Exception as e:
                print(f"Error optimizing subcategory image: {e}")
        super().save(*args, **kwargs)

class Product(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    shop = models.ForeignKey(Shop, on_delete=models.CASCADE, related_name='products', db_index=True)
    brand = models.ForeignKey(Brand, on_delete=models.PROTECT, related_name='products', null=True, blank=True, help_text="Product brand", db_index=True)
    name = models.CharField(max_length=255, db_index=True)
    slug = models.SlugField(unique=True, db_index=True)
    description = RichTextField()
    sub_category = models.ForeignKey(SubCategory, on_delete=models.PROTECT, related_name='products', db_index=True)
    shipping_category = models.ForeignKey(
        'orders.ShippingCategory', 
        on_delete=models.PROTECT, 
        related_name='products',
        blank=True,
        null=True,
        help_text="Determines which shipping methods are available for this product",
        db_index=True
    )
    price = models.DecimalField(max_digits=10, decimal_places=2, db_index=True)
    discount_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    wholesale_price = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        null=True, 
        blank=True,
        help_text="Special price for wholesale orders (leave empty if not applicable)"
    )
    minimum_purchase = models.PositiveIntegerField(
        default=1,
        help_text="Minimum quantity required for wholesale orders. Admin can set different values per product (e.g., Mobile=10, Laptop=5, Fashion=60)"
    )
    
    # Landing Page Features
    enable_landing_page = models.BooleanField(
        default=False,
        help_text="Enable dedicated landing page for this product"
    )
    landing_features = RichTextField(
        blank=True,
        null=True,
        help_text="Product features to display on landing page"
    )
    landing_how_to_use = RichTextField(
        blank=True,
        null=True,
        help_text="How to use instructions for landing page"
    )
    landing_why_choose = RichTextField(
        blank=True,
        null=True,
        help_text="Why should customers choose this product"
    )
    affiliate_commission_rate = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        null=True, 
        blank=True,
        help_text="Commission percentage for affiliates (e.g., 5.00 for 5%)"
    )
    stock = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True, db_index=True)
    
    # Physical properties for shipping calculation - TEMPORARILY COMMENTED OUT
    weight = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        blank=True,
        null=True,
        help_text="Weight in kg"
    )
    length = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        blank=True,
        null=True,
        help_text="Length in cm"
    )
    width = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        blank=True,
        null=True,
        help_text="Width in cm"
    )
    height = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        blank=True,
        null=True,
        help_text="Height in cm"
    )
    
    thumbnail = models.ImageField(upload_to='products/thumbnails/', blank=True, null=True)
    colors = models.ManyToManyField(Color, blank=True, related_name='products')
    sizes = models.ManyToManyField(Size, blank=True, related_name='products')
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True, db_index=True)

    class Meta:
        ordering = ['-created_at']  # Order by newest first
        indexes = [
            models.Index(fields=['-created_at'], name='product_created_idx'),
            models.Index(fields=['is_active', '-created_at'], name='product_active_created_idx'),
            models.Index(fields=['sub_category', 'is_active'], name='product_subcat_active_idx'),
        ]

    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        # Optimize product thumbnail before saving
        if self.thumbnail and hasattr(self.thumbnail, 'file'):
            try:
                optimized = ImageOptimizer.optimize_product_image(self.thumbnail.file)
                if optimized:
                    self.thumbnail.file = optimized
            except Exception as e:
                print(f"Error optimizing product thumbnail: {e}")
        super().save(*args, **kwargs)
    
    def get_sections(self):
        """Get all sections this product is part of"""
        from sections.models import SectionItem
        return SectionItem.objects.filter(product=self).select_related('section')
    
    def is_in_section(self, section_slug):
        """Check if product is in a specific section"""
        from sections.models import SectionItem
        return SectionItem.objects.filter(
            product=self, 
            section__slug=section_slug,
            section__is_active=True
        ).exists()

class ProductAdditionalImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='additional_images')
    image = models.ImageField(upload_to='products/additional_images/')
    class Meta:
        verbose_name_plural = "Product Additional Images"
    def __str__(self):
        return f"Image for {self.product.name}"
    
    def save(self, *args, **kwargs):
        # Optimize additional product image before saving
        if self.image and hasattr(self.image, 'file'):
            try:
                optimized = ImageOptimizer.optimize_product_image(self.image.file)
                if optimized:
                    self.image.file = optimized
            except Exception as e:
                print(f"Error optimizing additional product image: {e}")
        super().save(*args, **kwargs)

class ProductAdditionalDescription(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='additional_descriptions')
    description = RichTextField()
    def __str__(self):
        return f"Additional description for {self.product.name}"

class ProductSpecification(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='specifications')
    name = models.CharField(max_length=255, help_text="e.g., Material, Weight (Not for Color or Size)")
    value = models.CharField(max_length=255, help_text="e.g., Cotton, 250g")
    class Meta:
        unique_together = ('product', 'name')
    def __str__(self):
        return f"{self.name}: {self.value}"

class Review(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reviews', db_index=True)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews', db_index=True)
    rating = models.IntegerField(choices=[(i, str(i)) for i in range(1, 6)], db_index=True)
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    class Meta:
        unique_together = ('user', 'product')
        indexes = [
            models.Index(fields=['product', '-created_at'], name='review_product_created_idx'),
            models.Index(fields=['product', 'rating'], name='review_product_rating_idx'),
        ]


# NOTE: Category-level minimum order quantity model removed.
# The per-product `minimum_purchase` field on `Product` is used instead.


class LandingPageOrder(models.Model):
    """Orders placed through product landing pages"""
    ORDER_STATUS_CHOICES = [
        ('PENDING', 'Pending Confirmation'),
        ('CONFIRMED', 'Confirmed'),
        ('PROCESSING', 'Processing'),
        ('SHIPPED', 'Shipped'),
        ('DELIVERED', 'Delivered'),
        ('CANCELLED', 'Cancelled'),
    ]
    
    # Order identification
    order_number = models.CharField(max_length=50, unique=True, blank=True, db_index=True)
    
    # Product and pricing
    product = models.ForeignKey(Product, on_delete=models.PROTECT, related_name='landing_orders', db_index=True)
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, help_text="Price at the time of order")
    total_price = models.DecimalField(max_digits=10, decimal_places=2, help_text="Total price (unit_price * quantity)")
    
    # Customer information
    full_name = models.CharField(max_length=100, help_text="Customer's full name")
    email = models.EmailField(help_text="Customer's email address", db_index=True)
    phone = models.CharField(max_length=20, help_text="Customer's phone number")
    detailed_address = models.TextField(help_text="Complete delivery address")
    
    # User type tracking
    is_wholesaler = models.BooleanField(default=False, help_text="Whether this is a wholesale order")
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='landing_page_orders',
        db_index=True,
        help_text="Associated user if logged in"
    )
    
    # Order status
    status = models.CharField(max_length=20, choices=ORDER_STATUS_CHOICES, default='PENDING', db_index=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Additional notes
    customer_notes = models.TextField(blank=True, null=True, help_text="Additional notes from customer")
    admin_notes = models.TextField(blank=True, null=True, help_text="Internal notes for admin")
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = "Landing Page Order"
        verbose_name_plural = "Landing Page Orders"
        indexes = [
            models.Index(fields=['-created_at'], name='landing_order_created_idx'),
            models.Index(fields=['status', '-created_at'], name='landing_order_status_idx'),
            models.Index(fields=['product', '-created_at'], name='landing_order_product_idx'),
            models.Index(fields=['email', '-created_at'], name='landing_order_email_idx'),
        ]
    
    def __str__(self):
        return f"{self.order_number} - {self.full_name} ({self.product.name})"
    
    def save(self, *args, **kwargs):
        # Generate order number if not set
        if not self.order_number:
            import datetime
            import random
            
            now = datetime.datetime.now()
            time_part = now.strftime('%H%M%S')
            random_part = f"{random.randint(0, 999):03d}"
            
            self.order_number = f"LPO{time_part}{random_part}"
            
            # Ensure uniqueness
            counter = 1
            original_order_number = self.order_number
            while LandingPageOrder.objects.filter(order_number=self.order_number).exclude(pk=self.pk).exists():
                new_random = (int(random_part) + counter) % 1000
                self.order_number = f"LPO{time_part}{new_random:03d}"
                counter += 1
                if counter > 999:
                    self.order_number = f"{original_order_number}X{counter - 999}"
                    break
        
        # Calculate total price
        if self.unit_price and self.quantity:
            self.total_price = self.unit_price * self.quantity
        
        super().save(*args, **kwargs)
