# sections/models.py
import uuid
from django.db import models
from django.core.validators import MinValueValidator


class Section(models.Model):

    SECTION_TYPES = [
        ('product', 'Product Based'),
        ('category', 'Category Based'),
        ('special_offer', 'Special Offer Based'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200, unique=True, help_text="e.g., Featured Products, Most Selling Products", db_index=True)
    slug = models.SlugField(unique=True, help_text="URL-friendly section name", db_index=True)
    description = models.TextField(blank=True, help_text="Brief description of this section")
    section_type = models.CharField(max_length=20, choices=SECTION_TYPES, help_text="Type of section", db_index=True)
    
    # Display settings
    title_display = models.CharField(max_length=200, blank=True, help_text="Title to display on frontend")
    subtitle_display = models.CharField(max_length=300, blank=True, help_text="Subtitle to display on frontend")
    is_active = models.BooleanField(default=True, db_index=True)
    order = models.PositiveIntegerField(default=0, help_text="Display order", db_index=True)
    
    # Item limits
    max_items = models.PositiveIntegerField(
        default=10, 
        validators=[MinValueValidator(1)],
        help_text="Maximum number of items to display in this section"
    )
    
    # Special offer fields (only for special_offer type)
    discount_percentage = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        blank=True, 
        null=True,
        help_text="Discount percentage for special offers"
    )
    offer_start_date = models.DateTimeField(blank=True, null=True, db_index=True)
    offer_end_date = models.DateTimeField(blank=True, null=True, db_index=True)
    
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True, db_index=True)
    
    class Meta:
        ordering = ['order', 'name']
        verbose_name = "Section"
        verbose_name_plural = "Sections"
        indexes = [
            models.Index(fields=['is_active', 'order'], name='section_active_order_idx'),
            models.Index(fields=['section_type', 'is_active'], name='section_type_active_idx'),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.get_section_type_display()})"


class SectionItem(models.Model):
    """
    Items within a section - can be products or categories
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    section = models.ForeignKey(Section, on_delete=models.CASCADE, related_name='items', db_index=True)
    
    # Product or Category (only one should be filled)
    product = models.ForeignKey(
        'products.Product', 
        on_delete=models.CASCADE, 
        blank=True, 
        null=True,
        related_name='section_items',
        db_index=True
    )
    category = models.ForeignKey(
        'products.Category', 
        on_delete=models.CASCADE, 
        blank=True, 
        null=True,
        related_name='section_items',
        db_index=True
    )
    
    # Item specific settings
    order = models.PositiveIntegerField(default=0, help_text="Order within the section", db_index=True)
    is_featured = models.BooleanField(default=False, help_text="Mark as featured item in section", db_index=True)
    custom_title = models.CharField(max_length=200, blank=True, help_text="Custom title for this item in section")
    custom_description = models.TextField(blank=True, help_text="Custom description for this item in section")
    
    # Special pricing for this section (override product pricing)
    special_price = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        blank=True, 
        null=True,
        help_text="Special price for this item in this section"
    )
    
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True, db_index=True)
    
    class Meta:
        ordering = ['order', 'created_at']
        unique_together = [['section', 'product'], ['section', 'category']]
        verbose_name = "Section Item"
        verbose_name_plural = "Section Items"
        indexes = [
            models.Index(fields=['section', 'order'], name='sec_item_sec_ord_idx'),
            models.Index(fields=['section', 'is_featured'], name='sec_item_sec_feat_idx'),
            models.Index(fields=['product', 'section'], name='sec_item_prod_sec_idx'),
            models.Index(fields=['category', 'section'], name='sec_item_cat_sec_idx'),
        ]
    
    def clean(self):
        from django.core.exceptions import ValidationError
        
        # Ensure only one of product or category is selected
        if self.product and self.category:
            raise ValidationError("Select either product or category, not both.")
        
        if not self.product and not self.category:
            raise ValidationError("Must select either a product or category.")
        
        # Validate section type matches item type
        if self.section.section_type == 'product' and not self.product:
            raise ValidationError("Product-based sections must contain products only.")
        
        if self.section.section_type == 'category' and not self.category:
            raise ValidationError("Category-based sections must contain categories only.")
    
    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)
    
    def __str__(self):
        item_name = self.product.name if self.product else self.category.name
        return f"{self.section.name} - {item_name}"


class PageSection(models.Model):
    """
    Many-to-many relationship between Sections and Pages
    Determines which sections appear on which pages
    """
    PAGE_CHOICES = [
        ('home', 'Home Page'),
        ('cart', 'Cart Page'),
        ('categories', 'Categories Page'),
        ('checkout', 'Checkout Page'),
        ('products', 'Products Page'),
        ('product_detail', 'Product Detail Page'),
        ('shop', 'Shop Page'),
        ('search', 'Search Results Page'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    section = models.ForeignKey(Section, on_delete=models.CASCADE, related_name='page_assignments', db_index=True)
    page_name = models.CharField(max_length=50, choices=PAGE_CHOICES, db_index=True)
    
    # Page-specific settings
    is_active = models.BooleanField(default=True, help_text="Show this section on this page", db_index=True)
    order = models.PositiveIntegerField(default=0, help_text="Order of section on this page", db_index=True)
    
    # Layout settings for this page
    items_per_row = models.PositiveIntegerField(
        default=4, 
        validators=[MinValueValidator(1)],
        help_text="Number of items to show per row on this page"
    )
    show_title = models.BooleanField(default=True, help_text="Show section title on this page")
    show_subtitle = models.BooleanField(default=True, help_text="Show section subtitle on this page")
    show_view_all = models.BooleanField(default=True, help_text="Show 'View All' button")
    
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True, db_index=True)
    
    class Meta:
        ordering = ['page_name', 'order']
        unique_together = ['section', 'page_name']
        verbose_name = "Page Section Assignment"
        verbose_name_plural = "Page Section Assignments"
        indexes = [
            models.Index(fields=['page_name', 'is_active', 'order'], name='page_sec_pg_act_ord_idx'),
        ]
    
    def __str__(self):
        return f"{self.section.name} on {self.get_page_name_display()}"
