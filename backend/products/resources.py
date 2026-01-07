from import_export import resources, fields
from import_export.widgets import ForeignKeyWidget, ManyToManyWidget
from .models import Product, ProductVariant, Brand, Category, SubCategory, Color, Size, LandingPageOrder
from shops.models import Shop
from orders.models import ShippingCategory


class BrandResource(resources.ModelResource):
    class Meta:
        model = Brand
        fields = ('id', 'name', 'slug', 'description', 'website', 'is_active', 'created_at', 'updated_at')
        export_order = fields


class ColorResource(resources.ModelResource):
    class Meta:
        model = Color
        fields = ('id', 'name', 'hex_code')
        export_order = fields


class SizeResource(resources.ModelResource):
    class Meta:
        model = Size
        fields = ('id', 'name')
        export_order = fields


class CategoryResource(resources.ModelResource):
    class Meta:
        model = Category
        fields = ('id', 'name', 'slug')
        export_order = fields


class SubCategoryResource(resources.ModelResource):
    category = fields.Field(
        column_name='category',
        attribute='category',
        widget=ForeignKeyWidget(Category, 'name')
    )
    
    class Meta:
        model = SubCategory
        fields = ('id', 'name', 'slug', 'category')
        export_order = fields


class ProductResource(resources.ModelResource):
    shop = fields.Field(
        column_name='shop',
        attribute='shop',
        widget=ForeignKeyWidget(Shop, 'name')
    )
    brand = fields.Field(
        column_name='brand',
        attribute='brand',
        widget=ForeignKeyWidget(Brand, 'name')
    )
    sub_category = fields.Field(
        column_name='sub_category',
        attribute='sub_category',
        widget=ForeignKeyWidget(SubCategory, 'name')
    )
    shipping_category = fields.Field(
        column_name='shipping_category',
        attribute='shipping_category',
        widget=ForeignKeyWidget(ShippingCategory, 'name')
    )
    colors = fields.Field(
        column_name='colors',
        attribute='colors',
        widget=ManyToManyWidget(Color, field='name', separator=',')
    )
    sizes = fields.Field(
        column_name='sizes',
        attribute='sizes',
        widget=ManyToManyWidget(Size, field='name', separator=',')
    )
    
    class Meta:
        model = Product
        fields = (
            'id', 'shop', 'brand', 'name', 'slug', 'sub_category', 'shipping_category',
            'price', 'discount_price', 'wholesale_price', 'minimum_purchase', 'stock',
            'is_active', 'enable_landing_page', 'weight', 'length', 'width', 'height',
            'colors', 'sizes', 'created_at', 'updated_at'
        )
        export_order = fields


class ProductVariantResource(resources.ModelResource):
    product = fields.Field(
        column_name='product',
        attribute='product',
        widget=ForeignKeyWidget(Product, 'name')
    )
    color = fields.Field(
        column_name='color',
        attribute='color',
        widget=ForeignKeyWidget(Color, 'name')
    )
    size = fields.Field(
        column_name='size',
        attribute='size',
        widget=ForeignKeyWidget(Size, 'name')
    )
    
    class Meta:
        model = ProductVariant
        fields = (
            'id', 'product', 'sku', 'color', 'size', 'material',
            'price', 'discount_price', 'wholesale_price', 'minimum_purchase',
            'stock', 'quantity', 'weight', 'is_active', 'is_default',
            'created_at', 'updated_at'
        )
        export_order = fields


class LandingPageOrderResource(resources.ModelResource):
    product = fields.Field(
        column_name='product',
        attribute='product',
        widget=ForeignKeyWidget(Product, 'name')
    )
    variant = fields.Field(
        column_name='variant',
        attribute='variant',
        widget=ForeignKeyWidget(ProductVariant, 'sku')
    )
    
    class Meta:
        model = LandingPageOrder
        fields = (
            'id', 'order_number', 'product', 'variant', 'quantity', 'unit_price', 
            'total_price', 'full_name', 'email', 'phone', 'alternative_phone',
            'detailed_address', 'shipping_charge', 'is_wholesaler', 'status',
            'created_at', 'updated_at'
        )
        export_order = fields
