# products/serializers.py
from rest_framework import serializers
from .models import *
from shops.serializers import ShopSerializer

class BrandSerializer(serializers.ModelSerializer):
    logo_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Brand
        fields = ['id', 'name', 'slug', 'logo', 'logo_url', 'description', 'website', 'is_active']
    
    def get_logo_url(self, obj):
        request = self.context.get('request')
        if obj.logo and hasattr(obj.logo, 'url'):
            if request:
                return request.build_absolute_uri(obj.logo.url)
            return obj.logo.url
        return None

class ColorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Color
        fields = ['id', 'name', 'hex_code']

class SizeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Size
        fields = ['id', 'name']

class SubCategorySerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    class Meta:
        model = SubCategory
        fields = ['id','name','slug','image','image_url','category']

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and hasattr(obj.image, 'url'):
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None

class CategorySerializer(serializers.ModelSerializer):
    subcategories = SubCategorySerializer(many=True, read_only=True)
    total_products = serializers.IntegerField(read_only=True)
    sub_category_count = serializers.IntegerField(read_only=True)
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = [
            'id', 'name', 'slug', 'image', 'image_url',
            'subcategories', 'total_products', 'sub_category_count'
        ]

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and hasattr(obj.image, 'url'):
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None

class ShippingCategorySerializer(serializers.ModelSerializer):
    class Meta:
        # Import the model dynamically to avoid circular imports
        from orders.models import ShippingCategory
        model = ShippingCategory
        fields = ['id', 'name', 'description']

class ProductSpecificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductSpecification
        fields = ['name', 'value']

class ProductAdditionalImageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    class Meta:
        model = ProductAdditionalImage
        fields = ['id', 'image']
    def get_image(self, obj):
        request = self.context.get('request')
        if obj.image and hasattr(obj.image, 'url'):
            return request.build_absolute_uri(obj.image.url)
        return None

class ReviewSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()
    class Meta:
        model = Review
        fields = ['id', 'user', 'rating', 'comment', 'created_at']

class ProductSerializer(serializers.ModelSerializer):
    shop = ShopSerializer(read_only=True)
    brand = BrandSerializer(read_only=True)
    sub_category = SubCategorySerializer(read_only=True)
    shipping_category = ShippingCategorySerializer(read_only=True)
    specifications = ProductSpecificationSerializer(many=True, read_only=True)
    additional_images = ProductAdditionalImageSerializer(many=True, read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)
    colors = ColorSerializer(many=True, read_only=True)
    sizes = SizeSerializer(many=True, read_only=True)
    thumbnail_url = serializers.SerializerMethodField()
    rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'shop', 'brand', 'name', 'slug', 'description', 'sub_category', 'shipping_category',
            'price', 'discount_price', 'wholesale_price', 'minimum_purchase', 'affiliate_commission_rate', 'stock', 'is_active',
            'weight', 'length', 'width', 'height',  # Added physical properties for shipping
            'thumbnail_url', 'specifications', 'additional_images',
            'colors', 'sizes', 'reviews', 'rating', 'review_count',
            'enable_landing_page', 'landing_features', 'landing_how_to_use', 'landing_why_choose'  # Landing page fields
        ]
        
    def get_thumbnail_url(self, obj):
        request = self.context.get('request')
        if obj.thumbnail and hasattr(obj.thumbnail, 'url'):
            return request.build_absolute_uri(obj.thumbnail.url)
        return None
        
    def get_rating(self, obj):
        from django.db.models import Avg
        return obj.reviews.aggregate(Avg('rating'))['rating__avg'] or 0

    def get_review_count(self, obj):
        return obj.reviews.count()
    
    def to_representation(self, instance):
        """
        Custom representation to handle dynamic pricing based on user type and wholesaler approval status
        """
        data = super().to_representation(instance)
        request = self.context.get('request')
        
        # Initialize user context info
        user_context = {
            'is_wholesaler': False,
            'is_approved_wholesaler': False,
            'wholesaler_status': None
        }
        
        # Check if user is authenticated and get wholesaler info
        if (request and hasattr(request, 'user') and request.user and request.user.is_authenticated):
            if request.user.user_type == 'WHOLESALER':
                user_context['is_wholesaler'] = True
                # Check wholesaler approval status
                try:
                    if hasattr(request.user, 'wholesaler_profile'):
                        profile = request.user.wholesaler_profile
                        user_context['wholesaler_status'] = profile.approval_status
                        if profile.approval_status == 'APPROVED':
                            user_context['is_approved_wholesaler'] = True
                except:
                    # If wholesaler_profile doesn't exist, user is not approved
                    user_context['wholesaler_status'] = 'PENDING'
        
        # Add user context to response for frontend logic
        data['_user_context'] = user_context
        
        # Handle pricing data based on user type and approval status
        if user_context['is_approved_wholesaler']:
            # For approved wholesalers: only include wholesale_price if it exists and >= 1
            wholesale_price = instance.wholesale_price
            if not wholesale_price or wholesale_price < 1:
                # Remove wholesale pricing if not available
                data.pop('wholesale_price', None)
                data.pop('minimum_purchase', None)
            # If wholesale_price >= 1, keep both wholesale_price and minimum_purchase
        else:
            # For non-approved wholesalers, customers, and unauthenticated users: 
            # Remove wholesale_price and minimum_purchase for security
            data.pop('wholesale_price', None)
            data.pop('minimum_purchase', None)
        
        # Show affiliate_commission_rate to all authenticated users
        if not (request and hasattr(request, 'user') and request.user and request.user.is_authenticated):
            # Remove affiliate_commission_rate for unauthenticated users
            data.pop('affiliate_commission_rate', None)
        
        return data


class LandingPageOrderSerializer(serializers.ModelSerializer):
    """Serializer for creating landing page orders"""
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_slug = serializers.CharField(source='product.slug', read_only=True)
    
    class Meta:
        model = LandingPageOrder
        fields = [
            'id', 'order_number', 'product', 'product_name', 'product_slug',
            'quantity', 'unit_price', 'total_price',
            'full_name', 'email', 'phone', 'detailed_address',
            'is_wholesaler', 'user', 'status',
            'customer_notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'order_number', 'total_price', 'created_at', 'updated_at', 'user', 'is_wholesaler', 'unit_price']
    
    def validate(self, data):
        """Validate order data"""
        product = data.get('product')
        quantity = data.get('quantity', 1)
        
        # Check if product is active
        if not product.is_active:
            raise serializers.ValidationError("This product is not available for purchase.")
        
        # Check if product has landing page enabled
        if not product.enable_landing_page:
            raise serializers.ValidationError("This product does not have a landing page enabled.")
        
        # Check stock
        if quantity > product.stock:
            raise serializers.ValidationError(f"Only {product.stock} items available in stock.")
        
        # Get user from context if available
        request = self.context.get('request')
        user = None
        is_wholesaler = False
        
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            user = request.user
            if user.user_type == 'WHOLESALER':
                # Check if wholesaler is approved
                try:
                    if hasattr(user, 'wholesaler_profile'):
                        if user.wholesaler_profile.approval_status == 'APPROVED':
                            is_wholesaler = True
                except:
                    pass
        
        # Validate minimum purchase for wholesalers
        if is_wholesaler:
            minimum_purchase = product.minimum_purchase or 1
            if quantity < minimum_purchase:
                raise serializers.ValidationError(
                    f"Wholesale orders require a minimum purchase of {minimum_purchase} items."
                )
            
            # Set wholesale price
            if product.wholesale_price and product.wholesale_price >= 1:
                data['unit_price'] = product.wholesale_price
                data['is_wholesaler'] = True
            else:
                raise serializers.ValidationError("Wholesale price is not available for this product.")
        else:
            # For regular customers, use discount price if available, otherwise regular price
            if product.discount_price and product.discount_price > 0:
                data['unit_price'] = product.discount_price
            else:
                data['unit_price'] = product.price
            data['is_wholesaler'] = False
        
        # Store user in data if available
        if user:
            data['user'] = user
        
        return data
    
    def create(self, validated_data):
        """Create landing page order"""
        # The unit_price, is_wholesaler, and user are already set in validate()
        order = LandingPageOrder.objects.create(**validated_data)
        return order


class LandingPageOrderListSerializer(serializers.ModelSerializer):
    """Serializer for listing landing page orders"""
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_thumbnail = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = LandingPageOrder
        fields = [
            'id', 'order_number', 'product_name', 'product_thumbnail',
            'quantity', 'unit_price', 'total_price',
            'full_name', 'email', 'phone',
            'is_wholesaler', 'status', 'status_display',
            'created_at', 'updated_at'
        ]
    
    def get_product_thumbnail(self, obj):
        request = self.context.get('request')
        if obj.product.thumbnail and hasattr(obj.product.thumbnail, 'url'):
            if request:
                return request.build_absolute_uri(obj.product.thumbnail.url)
            return obj.product.thumbnail.url
        return None
