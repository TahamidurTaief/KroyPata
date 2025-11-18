# sections/serializers.py
from rest_framework import serializers
from .models import Section, SectionItem, PageSection
from products.serializers import ProductSerializer, CategorySerializer
from django.db.models import Count


class SectionItemSerializer(serializers.ModelSerializer):
    """Serializer for section items"""
    product = ProductSerializer(read_only=True)
    category = serializers.SerializerMethodField()
    item_name = serializers.SerializerMethodField()
    item_type = serializers.SerializerMethodField()
    final_price = serializers.SerializerMethodField()
    
    class Meta:
        model = SectionItem
        fields = [
            'id', 'product', 'category', 'order', 'is_featured',
            'custom_title', 'custom_description', 'special_price',
            'item_name', 'item_type', 'final_price', 'created_at'
        ]
    
    def get_category(self, obj):
        """Get category with proper annotations"""
        if obj.category:
            from products.models import Category
            # Get the category with annotations
            category = Category.objects.filter(id=obj.category.id).annotate(
                total_products=Count('subcategories__products', distinct=True),
                sub_category_count=Count('subcategories', distinct=True)
            ).first()
            
            if category:
                return CategorySerializer(category, context=self.context).data
        return None
    
    def get_item_name(self, obj):
        """Get the name of the item (product or category)"""
        if obj.product:
            return obj.product.name
        elif obj.category:
            return obj.category.name
        return None
    
    def get_item_type(self, obj):
        """Get the type of the item"""
        if obj.product:
            return 'product'
        elif obj.category:
            return 'category'
        return None
    
    def get_final_price(self, obj):
        """Get the final price (special price or product price)"""
        if obj.special_price:
            return obj.special_price
        elif obj.product:
            return obj.product.discount_price or obj.product.price
        return None


class PageSectionSerializer(serializers.ModelSerializer):
    """Serializer for page section assignments"""
    page_display = serializers.CharField(source='get_page_name_display', read_only=True)
    
    class Meta:
        model = PageSection
        fields = [
            'id', 'page_name', 'page_display', 'is_active', 'order',
            'items_per_row', 'show_title', 'show_subtitle', 'show_view_all'
        ]


class SectionSerializer(serializers.ModelSerializer):
    """Main section serializer"""
    items = SectionItemSerializer(many=True, read_only=True)
    page_assignments = PageSectionSerializer(many=True, read_only=True)
    section_type_display = serializers.CharField(source='get_section_type_display', read_only=True)
    active_items_count = serializers.SerializerMethodField()
    active_pages_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Section
        fields = [
            'id', 'name', 'slug', 'description', 'section_type',
            'section_type_display', 'title_display', 'subtitle_display',
            'is_active', 'order', 'max_items', 'discount_percentage',
            'offer_start_date', 'offer_end_date', 'items', 'page_assignments',
            'active_items_count', 'active_pages_count', 'created_at', 'updated_at'
        ]
    
    def get_active_items_count(self, obj):
        """Get count of items in this section"""
        return obj.items.count()
    
    def get_active_pages_count(self, obj):
        """Get count of active page assignments"""
        return obj.page_assignments.filter(is_active=True).count()


class SectionListSerializer(serializers.ModelSerializer):
    """Simplified serializer for section lists"""
    section_type_display = serializers.CharField(source='get_section_type_display', read_only=True)
    items_count = serializers.SerializerMethodField()
    pages_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Section
        fields = [
            'id', 'name', 'slug', 'section_type', 'section_type_display',
            'title_display', 'is_active', 'order', 'items_count', 'pages_count'
        ]
    
    def get_items_count(self, obj):
        return obj.items.count()
    
    def get_pages_count(self, obj):
        return obj.page_assignments.filter(is_active=True).count()


class PageSectionsSerializer(serializers.ModelSerializer):
    """Serializer for getting sections by page"""
    items = serializers.SerializerMethodField()
    section_info = serializers.SerializerMethodField()
    
    class Meta:
        model = PageSection
        fields = [
            'id', 'order', 'items_per_row', 'show_title', 'show_subtitle',
            'show_view_all', 'section_info', 'items'
        ]
    
    def get_section_info(self, obj):
        """Get basic section information"""
        return {
            'id': obj.section.id,
            'name': obj.section.name,
            'title_display': obj.section.title_display,
            'subtitle_display': obj.section.subtitle_display,
            'section_type': obj.section.section_type,
            'section_type_display': obj.section.get_section_type_display(),
            'discount_percentage': obj.section.discount_percentage,
        }
    
    def get_items(self, obj):
        """Get limited items based on max_items and page settings"""
        items = obj.section.items.all()[:obj.section.max_items]
        return SectionItemSerializer(items, many=True, context=self.context).data


# Write/Create serializers
class SectionCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating sections"""
    
    class Meta:
        model = Section
        fields = [
            'name', 'slug', 'description', 'section_type', 'title_display',
            'subtitle_display', 'is_active', 'order', 'max_items',
            'discount_percentage', 'offer_start_date', 'offer_end_date'
        ]
    
    def validate(self, data):
        # Validate special offer fields
        if data.get('section_type') == 'special_offer':
            if not data.get('discount_percentage'):
                raise serializers.ValidationError(
                    "Discount percentage is required for special offer sections."
                )
        return data


class SectionItemCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating section items"""
    
    class Meta:
        model = SectionItem
        fields = [
            'section', 'product', 'category', 'order', 'is_featured',
            'custom_title', 'custom_description', 'special_price'
        ]
    
    def validate(self, data):
        # Ensure only one of product or category is selected
        if data.get('product') and data.get('category'):
            raise serializers.ValidationError("Select either product or category, not both.")
        
        if not data.get('product') and not data.get('category'):
            raise serializers.ValidationError("Must select either a product or category.")
        
        # Validate section type matches item type
        section = data.get('section')
        if section:
            if section.section_type == 'product' and not data.get('product'):
                raise serializers.ValidationError("Product-based sections must contain products only.")
            
            if section.section_type == 'category' and not data.get('category'):
                raise serializers.ValidationError("Category-based sections must contain categories only.")
        
        return data


class PageSectionCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating page section assignments"""
    
    class Meta:
        model = PageSection
        fields = [
            'section', 'page_name', 'is_active', 'order', 'items_per_row',
            'show_title', 'show_subtitle', 'show_view_all'
        ]
