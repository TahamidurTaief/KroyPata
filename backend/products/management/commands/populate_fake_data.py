# products/management/commands/populate_fake_data.py
import random
import uuid
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils.text import slugify
from products.models import (
    Category, SubCategory, Product, Brand, Color, Size, 
    ProductAdditionalImage, ProductSpecification, Review
)
from shops.models import Shop

User = get_user_model()

class Command(BaseCommand):
    help = 'Populate the database with fake data for testing'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing data before creating new fake data',
        )
        parser.add_argument(
            '--products',
            type=int,
            default=50,
            help='Number of products to create (default: 50)',
        )

    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write(self.style.WARNING('Clearing existing data...'))
            self.clear_data()

        self.create_fake_data(options['products'])
        self.stdout.write(self.style.SUCCESS('Successfully populated fake data!'))

    def clear_data(self):
        """Clear existing data"""
        Product.objects.all().delete()
        SubCategory.objects.all().delete()
        Category.objects.all().delete()
        Color.objects.all().delete()
        Size.objects.all().delete()
        Shop.objects.all().delete()
        # Don't delete users as they might be needed for admin access

    def create_fake_data(self, num_products):
        """Create fake data"""
        self.stdout.write('Creating fake users and shops...')
        self.create_users_and_shops()
        
        self.stdout.write('Creating colors and sizes...')
        self.create_colors_and_sizes()
        
        self.stdout.write('Creating categories and subcategories...')
        self.create_categories_and_subcategories()
        
        self.stdout.write(f'Creating {num_products} products...')
        self.create_products(num_products)
        
        self.stdout.write('Creating product specifications and reviews...')
        self.create_product_extras()

    def create_users_and_shops(self):
        """Create fake users and shops"""
        shop_names = [
            'TechHub Electronics', 'Fashion Forward', 'Home & Garden Paradise', 
            'Sports Zone', 'Beauty Boutique', 'Kitchen Essentials', 'Gadget Galaxy',
            'Style Central', 'Outdoor Adventures', 'Book Haven'
        ]
        
        for i, shop_name in enumerate(shop_names):
            # Create user if doesn't exist
            email = f'owner{i+1}@{slugify(shop_name)}.com'
            
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'name': f'Owner {shop_name}',
                    'user_type': 'SELLER',
                    'is_active': True,
                }
            )
            
            if created:
                user.set_password('password123')  # Set a default password
                user.save()
            
            # Create shop if doesn't exist
            shop, created = Shop.objects.get_or_create(
                owner=user,
                defaults={
                    'name': shop_name,
                    'slug': slugify(shop_name),
                    'description': f'Welcome to {shop_name}! We offer the best products in our category.',
                    'contact_email': email,
                    'contact_phone': f'+1-555-{random.randint(100, 999)}-{random.randint(1000, 9999)}',
                    'address': f'{random.randint(100, 9999)} Main St, City, State {random.randint(10000, 99999)}',
                    'is_active': True,
                    'is_verified': True,
                }
            )

    def create_colors_and_sizes(self):
        """Create fake colors and sizes"""
        colors_data = [
            ('Red', '#FF0000'), ('Blue', '#0000FF'), ('Green', '#008000'),
            ('Black', '#000000'), ('White', '#FFFFFF'), ('Gray', '#808080'),
            ('Navy', '#000080'), ('Pink', '#FFC0CB'), ('Purple', '#800080'),
            ('Orange', '#FFA500'), ('Yellow', '#FFFF00'), ('Brown', '#A52A2A'),
            ('Beige', '#F5F5DC'), ('Maroon', '#800000'), ('Teal', '#008080'),
        ]
        
        for name, hex_code in colors_data:
            Color.objects.get_or_create(name=name, defaults={'hex_code': hex_code})
        
        sizes_data = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36', '38', '40', '42', '44']
        
        for size_name in sizes_data:
            Size.objects.get_or_create(name=size_name)

    def create_categories_and_subcategories(self):
        """Create fake categories and subcategories"""
        categories_data = {
            'Electronics': ['Smartphones', 'Laptops', 'Tablets', 'Accessories', 'Gaming'],
            'Fashion': ['Men\'s Clothing', 'Women\'s Clothing', 'Shoes', 'Accessories', 'Jewelry'],
            'Home & Garden': ['Furniture', 'Decor', 'Kitchen', 'Bathroom', 'Garden'],
            'Sports': ['Fitness', 'Outdoor Sports', 'Team Sports', 'Equipment', 'Apparel'],
            'Beauty': ['Skincare', 'Makeup', 'Hair Care', 'Fragrance', 'Tools'],
        }
        
        for cat_name, subcats in categories_data.items():
            category, created = Category.objects.get_or_create(
                name=cat_name,
                defaults={'slug': slugify(cat_name)}
            )
            
            for subcat_name in subcats:
                SubCategory.objects.get_or_create(
                    name=subcat_name,
                    category=category,
                    defaults={'slug': slugify(f'{cat_name}-{subcat_name}')}
                )

    def create_products(self, num_products):
        """Create fake products"""
        product_templates = [
            # Electronics
            {'name': 'iPhone 15 Pro', 'category': 'Electronics', 'subcategory': 'Smartphones', 'price_range': (800, 1200)},
            {'name': 'Samsung Galaxy S24', 'category': 'Electronics', 'subcategory': 'Smartphones', 'price_range': (700, 1000)},
            {'name': 'MacBook Pro M3', 'category': 'Electronics', 'subcategory': 'Laptops', 'price_range': (1500, 2500)},
            {'name': 'Dell XPS 13', 'category': 'Electronics', 'subcategory': 'Laptops', 'price_range': (1000, 1800)},
            {'name': 'iPad Air', 'category': 'Electronics', 'subcategory': 'Tablets', 'price_range': (500, 800)},
            {'name': 'AirPods Pro', 'category': 'Electronics', 'subcategory': 'Accessories', 'price_range': (200, 300)},
            {'name': 'Gaming Headset', 'category': 'Electronics', 'subcategory': 'Gaming', 'price_range': (50, 200)},
            
            # Fashion
            {'name': 'Designer T-Shirt', 'category': 'Fashion', 'subcategory': 'Men\'s Clothing', 'price_range': (25, 80)},
            {'name': 'Casual Jeans', 'category': 'Fashion', 'subcategory': 'Men\'s Clothing', 'price_range': (40, 120)},
            {'name': 'Summer Dress', 'category': 'Fashion', 'subcategory': 'Women\'s Clothing', 'price_range': (30, 150)},
            {'name': 'Blouse', 'category': 'Fashion', 'subcategory': 'Women\'s Clothing', 'price_range': (25, 90)},
            {'name': 'Running Shoes', 'category': 'Fashion', 'subcategory': 'Shoes', 'price_range': (60, 200)},
            {'name': 'Leather Handbag', 'category': 'Fashion', 'subcategory': 'Accessories', 'price_range': (80, 300)},
            {'name': 'Gold Necklace', 'category': 'Fashion', 'subcategory': 'Jewelry', 'price_range': (100, 500)},
            
            # Home & Garden
            {'name': 'Dining Table', 'category': 'Home & Garden', 'subcategory': 'Furniture', 'price_range': (200, 800)},
            {'name': 'Decorative Vase', 'category': 'Home & Garden', 'subcategory': 'Decor', 'price_range': (20, 100)},
            {'name': 'Coffee Maker', 'category': 'Home & Garden', 'subcategory': 'Kitchen', 'price_range': (50, 300)},
            {'name': 'Shower Curtain', 'category': 'Home & Garden', 'subcategory': 'Bathroom', 'price_range': (15, 60)},
            {'name': 'Garden Tools Set', 'category': 'Home & Garden', 'subcategory': 'Garden', 'price_range': (30, 150)},
            
            # Sports
            {'name': 'Yoga Mat', 'category': 'Sports', 'subcategory': 'Fitness', 'price_range': (20, 80)},
            {'name': 'Hiking Backpack', 'category': 'Sports', 'subcategory': 'Outdoor Sports', 'price_range': (60, 250)},
            {'name': 'Basketball', 'category': 'Sports', 'subcategory': 'Team Sports', 'price_range': (15, 50)},
            {'name': 'Dumbbells Set', 'category': 'Sports', 'subcategory': 'Equipment', 'price_range': (40, 200)},
            {'name': 'Athletic Shorts', 'category': 'Sports', 'subcategory': 'Apparel', 'price_range': (20, 60)},
            
            # Beauty
            {'name': 'Anti-Aging Serum', 'category': 'Beauty', 'subcategory': 'Skincare', 'price_range': (30, 150)},
            {'name': 'Lipstick Set', 'category': 'Beauty', 'subcategory': 'Makeup', 'price_range': (15, 80)},
            {'name': 'Shampoo & Conditioner', 'category': 'Beauty', 'subcategory': 'Hair Care', 'price_range': (20, 60)},
            {'name': 'Perfume', 'category': 'Beauty', 'subcategory': 'Fragrance', 'price_range': (40, 200)},
            {'name': 'Makeup Brush Set', 'category': 'Beauty', 'subcategory': 'Tools', 'price_range': (25, 100)},
        ]
        
        shops = list(Shop.objects.all())
        colors = list(Color.objects.all())
        sizes = list(Size.objects.all())
        
        for i in range(num_products):
            template = random.choice(product_templates)
            
            # Get category and subcategory
            try:
                category = Category.objects.get(name=template['category'])
                subcategory = SubCategory.objects.get(name=template['subcategory'], category=category)
            except (Category.DoesNotExist, SubCategory.DoesNotExist):
                continue
            
            # Generate product name with variation
            base_name = template['name']
            variation = random.choice(['Pro', 'Plus', 'Elite', 'Premium', 'Classic', 'Modern', 'Deluxe', ''])
            product_name = f"{base_name} {variation}".strip()
            
            # Generate unique slug
            base_slug = slugify(product_name)
            slug = base_slug
            counter = 1
            while Product.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            
            # Random price within range
            min_price, max_price = template['price_range']
            price = Decimal(random.uniform(min_price, max_price)).quantize(Decimal('0.01'))
            
            # Random discount (30% chance)
            discount_price = None
            if random.random() < 0.3:
                discount_price = price * Decimal(random.uniform(0.7, 0.9))
                discount_price = discount_price.quantize(Decimal('0.01'))
            
            # Get random brand (ensure brands exist)
            brands = Brand.objects.filter(is_active=True)
            if not brands.exists():
                self.stdout.write(self.style.WARNING('No brands found. Please run migrations to create initial brands.'))
                brand = None
            else:
                brand = random.choice(brands)
            
            # Create product
            product = Product.objects.create(
                shop=random.choice(shops),
                brand=brand,
                name=product_name,
                slug=slug,
                description=f"<p>High-quality {product_name.lower()} from our premium collection. "
                           f"Perfect for everyday use with excellent durability and style.</p>"
                           f"<ul><li>Premium materials</li><li>Modern design</li><li>Great value</li></ul>",
                sub_category=subcategory,
                price=price,
                discount_price=discount_price,
                stock=random.randint(0, 100),
                is_active=True,
            )
            
            # Add random colors and sizes
            if random.random() < 0.8:  # 80% chance to have colors
                product_colors = random.sample(colors, min(random.randint(1, 5), len(colors)))
                product.colors.set(product_colors)
            
            if random.random() < 0.6:  # 60% chance to have sizes
                product_sizes = random.sample(sizes, min(random.randint(1, 4), len(sizes)))
                product.sizes.set(product_sizes)

    def create_product_extras(self):
        """Create product specifications and reviews"""
        products = Product.objects.all()
        users = User.objects.all()
        
        # Create specifications
        spec_templates = {
            'Electronics': [
                ('Brand', ['Apple', 'Samsung', 'Dell', 'HP', 'Sony']),
                ('Warranty', ['1 Year', '2 Years', '3 Years']),
                ('Color', ['Black', 'White', 'Silver', 'Gold']),
            ],
            'Fashion': [
                ('Material', ['Cotton', '100% Cotton', 'Polyester', 'Silk', 'Leather']),
                ('Care Instructions', ['Machine Wash', 'Hand Wash Only', 'Dry Clean Only']),
                ('Country of Origin', ['USA', 'Italy', 'France', 'India']),
            ],
            'Home & Garden': [
                ('Material', ['Wood', 'Metal', 'Plastic', 'Glass', 'Ceramic']),
                ('Dimensions', ['Small', 'Medium', 'Large', 'Custom']),
                ('Assembly Required', ['Yes', 'No', 'Partial']),
            ],
            'Sports': [
                ('Brand', ['Nike', 'Adidas', 'Under Armour', 'Puma', 'Reebok']),
                ('Size Range', ['One Size', 'Multiple Sizes', 'Adjustable']),
                ('Sport Type', ['Indoor', 'Outdoor', 'All Weather']),
            ],
            'Beauty': [
                ('Brand', ['L\'Oreal', 'Maybelline', 'MAC', 'Clinique', 'Estee Lauder']),
                ('Skin Type', ['All Skin Types', 'Oily Skin', 'Dry Skin', 'Sensitive Skin']),
                ('Application', ['Easy', 'Professional', 'Beginner Friendly']),
            ],
        }
        
        for product in products:
            category_name = product.sub_category.category.name
            if category_name in spec_templates:
                specs = spec_templates[category_name]
                # Add 1-3 random specifications
                for spec_name, spec_values in random.sample(specs, min(random.randint(1, 3), len(specs))):
                    ProductSpecification.objects.get_or_create(
                        product=product,
                        name=spec_name,
                        defaults={'value': random.choice(spec_values)}
                    )
        
        # Create reviews (only if there are users)
        if users.exists():
            review_comments = [
                "Great product! Highly recommended.",
                "Good quality for the price.",
                "Exactly as described. Fast shipping.",
                "Love it! Will buy again.",
                "Nice design and good build quality.",
                "Works perfectly. Very satisfied.",
                "Excellent customer service.",
                "Good value for money.",
                "Fast delivery and well packaged.",
                "Meets my expectations.",
            ]
            
            for product in random.sample(list(products), min(30, len(products))):
                # Create 1-5 reviews per selected product
                num_reviews = random.randint(1, 5)
                reviewed_users = random.sample(list(users), min(num_reviews, len(users)))
                
                for user in reviewed_users:
                    Review.objects.get_or_create(
                        user=user,
                        product=product,
                        defaults={
                            'rating': random.randint(3, 5),  # Mostly good ratings
                            'comment': random.choice(review_comments),
                        }
                    )
