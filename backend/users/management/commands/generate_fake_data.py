from django.core.management.base import BaseCommand
from django.utils.text import slugify
from faker import Faker
import random
from decimal import Decimal

from users.models import User, Address
from shops.models import Shop
from products.models import (
    Category, SubCategory, Color, Size, Product, 
    ProductSpecification, Review
)
from orders.models import (
    ShippingMethod, Order, OrderItem, OrderUpdate, OrderPayment
)

fake = Faker()

class Command(BaseCommand):
    help = 'Generate fake data for all models'

    def add_arguments(self, parser):
        parser.add_argument(
            '--users',
            type=int,
            default=20,
            help='Number of customer users to create (default: 20)',
        )
        parser.add_argument(
            '--products',
            type=int,
            default=30,
            help='Number of products to create (default: 30)',
        )
        parser.add_argument(
            '--orders',
            type=int,
            default=15,
            help='Number of orders to create (default: 15)',
        )

    def handle(self, *args, **options):
        self.stdout.write(
            self.style.SUCCESS('🚀 Starting fake data generation...')
        )
        
        # Create basic data
        self.create_basic_data()
        
        # Create users
        users = self.create_users(options['users'])
        
        # Create addresses
        addresses = self.create_addresses(users)
        
        # Create shops
        shops = self.create_shops(users)
        
        # Create products
        products = self.create_products(shops, options['products'])
        
        # Create reviews
        reviews = self.create_reviews(products, users)
        
        # Create orders
        orders = self.create_orders(users, products, addresses, options['orders'])
        
        self.stdout.write(
            self.style.SUCCESS('✅ Fake data generation completed!')
        )
        
        # Print summary
        self.print_summary()

    def create_basic_data(self):
        """Create colors, sizes, categories, shipping methods"""
        self.stdout.write('Creating basic data...')
        
        # Colors
        colors_data = [
            ('Red', '#FF0000'), ('Blue', '#0000FF'), ('Green', '#00FF00'),
            ('Black', '#000000'), ('White', '#FFFFFF'), ('Navy', '#000080'),
            ('Gray', '#808080'), ('Pink', '#FFC0CB')
        ]
        for name, hex_code in colors_data:
            Color.objects.get_or_create(name=name, defaults={'hex_code': hex_code})
        
        # Sizes
        sizes_data = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '38', '40', '42', '44']
        for size_name in sizes_data:
            Size.objects.get_or_create(name=size_name)
        
        # Categories and Subcategories
        categories_data = {
            'Electronics': ['Smartphones', 'Laptops', 'Headphones'],
            'Clothing': ['Shirts', 'Jeans', 'Dresses'],
            'Home': ['Furniture', 'Decor', 'Kitchen'],
            'Books': ['Fiction', 'Non-Fiction', 'Educational']
        }
        
        for cat_name, subcat_names in categories_data.items():
            category, _ = Category.objects.get_or_create(
                name=cat_name,
                defaults={'slug': slugify(cat_name)}
            )
            
            for subcat_name in subcat_names:
                SubCategory.objects.get_or_create(
                    name=subcat_name,
                    category=category,
                    defaults={'slug': slugify(f"{cat_name}-{subcat_name}")}
                )
        
        # Shipping Methods
        shipping_data = [
            ('Standard Shipping', 'Delivery within 5-7 days', 50.00),
            ('Express Shipping', 'Delivery within 2-3 days', 100.00),
            ('Free Shipping', 'Free delivery (7-10 days)', 0.00),
        ]
        for name, desc, price in shipping_data:
            ShippingMethod.objects.get_or_create(
                name=name,
                defaults={'description': desc, 'price': Decimal(str(price))}
            )
        
        self.stdout.write(self.style.SUCCESS('✅ Basic data created'))

    def create_users(self, num_customers):
        """Create users"""
        self.stdout.write(f'Creating users... (customers: {num_customers})')
        
        users = []
        
        # Create admin
        admin, created = User.objects.get_or_create(
            email='admin@icommerce.com',
            defaults={
                'name': 'Admin User',
                'user_type': 'ADMIN',
                'is_staff': True,
                'is_superuser': True,
            }
        )
        if created:
            admin.set_password('admin123')
            admin.save()
        users.append(admin)
        
        # Create sellers
        for i in range(5):
            seller, created = User.objects.get_or_create(
                email=f'seller{i+1}@example.com',
                defaults={
                    'name': fake.name(),
                    'user_type': 'SELLER',
                }
            )
            if created:
                seller.set_password('seller123')
                seller.save()
            users.append(seller)
        
        # Create customers
        for i in range(num_customers):
            customer, created = User.objects.get_or_create(
                email=f'customer{i+1}@example.com',
                defaults={
                    'name': fake.name(),
                    'user_type': 'CUSTOMER',
                }
            )
            if created:
                customer.set_password('customer123')
                customer.save()
            users.append(customer)
        
        self.stdout.write(self.style.SUCCESS(f'✅ Created/found {len(users)} users'))
        return users

    def create_addresses(self, users):
        """Create addresses for customers"""
        self.stdout.write('Creating addresses...')
        
        addresses = []
        customers = [u for u in users if u.user_type == 'CUSTOMER']
        
        for customer in customers[:10]:  # First 10 customers get addresses
            if not customer.addresses.exists():
                address = Address.objects.create(
                    user=customer,
                    address_line_1=fake.street_address(),
                    city=fake.city(),
                    state=fake.state(),
                    postal_code=fake.postcode(),
                    country='Bangladesh',
                    is_default=True
                )
                addresses.append(address)
        
        self.stdout.write(self.style.SUCCESS(f'✅ Created {len(addresses)} new addresses'))
        return Address.objects.all()

    def create_shops(self, users):
        """Create shops for sellers"""
        self.stdout.write('Creating shops...')
        
        shops = []
        sellers = [u for u in users if u.user_type == 'SELLER']
        
        for seller in sellers:
            if not hasattr(seller, 'shop'):
                shop_name = f"{fake.company()} Store"
                shop = Shop.objects.create(
                    owner=seller,
                    name=shop_name,
                    slug=slugify(shop_name),
                    description=fake.text(max_nb_chars=200),
                    contact_email=seller.email,
                    is_active=True,
                    is_verified=True
                )
                shops.append(shop)
            else:
                shops.append(seller.shop)
        
        self.stdout.write(self.style.SUCCESS(f'✅ Created/found {len(shops)} shops'))
        return shops

    def create_products(self, shops, num_products):
        """Create products"""
        self.stdout.write(f'Creating {num_products} products...')
        
        products = []
        subcategories = list(SubCategory.objects.all())
        colors = list(Color.objects.all())
        sizes = list(Size.objects.all())
        
        products_per_shop = max(1, num_products // len(shops)) if shops else 0
        
        for shop in shops:
            for i in range(products_per_shop):
                product_name = fake.catch_phrase()
                
                # Ensure unique name
                counter = 1
                original_name = product_name
                while Product.objects.filter(name=product_name).exists():
                    product_name = f"{original_name} {counter}"
                    counter += 1
                
                price = Decimal(str(round(random.uniform(50, 500), 2)))
                
                product = Product.objects.create(
                    shop=shop,
                    name=product_name,
                    slug=slugify(product_name),
                    description=fake.text(max_nb_chars=500),
                    sub_category=random.choice(subcategories),
                    price=price,
                    stock=random.randint(0, 100),
                    is_active=True
                )
                
                # Add colors and sizes
                if colors:
                    product.colors.set(random.sample(colors, random.randint(1, min(3, len(colors)))))
                if sizes:
                    product.sizes.set(random.sample(sizes, random.randint(1, min(3, len(sizes)))))
                
                # Add specification
                ProductSpecification.objects.create(
                    product=product,
                    name='Brand',
                    value=fake.company()
                )
                
                products.append(product)
        
        self.stdout.write(self.style.SUCCESS(f'✅ Created {len(products)} products'))
        return products

    def create_reviews(self, products, users):
        """Create product reviews"""
        self.stdout.write('Creating reviews...')
        
        reviews = []
        customers = [u for u in users if u.user_type == 'CUSTOMER']
        
        for product in products[:10]:  # Reviews for first 10 products
            num_reviews = random.randint(1, 3)
            selected_customers = random.sample(customers, min(num_reviews, len(customers)))
            
            for customer in selected_customers:
                try:
                    review = Review.objects.create(
                        user=customer,
                        product=product,
                        rating=random.randint(3, 5),
                        comment=fake.sentence()
                    )
                    reviews.append(review)
                except:
                    pass  # Skip if review already exists
        
        self.stdout.write(self.style.SUCCESS(f'✅ Created {len(reviews)} reviews'))
        return reviews

    def create_orders(self, users, products, addresses, num_orders):
        """Create orders"""
        self.stdout.write(f'Creating {num_orders} orders...')
        
        orders = []
        customers_with_addresses = [
            u for u in users 
            if u.user_type == 'CUSTOMER' and u.addresses.exists()
        ]
        shipping_methods = list(ShippingMethod.objects.all())
        
        for i in range(num_orders):
            if not customers_with_addresses or not products or not shipping_methods:
                break
            
            customer = random.choice(customers_with_addresses)
            
            order = Order.objects.create(
                user=customer,
                order_number=f"ORD-{10000 + i}",
                total_amount=Decimal('0'),
                status=random.choice(['PENDING', 'PROCESSING', 'SHIPPED']),
                payment_status=random.choice(['PENDING', 'PAID']),
                shipping_address=customer.addresses.first(),
                shipping_method=random.choice(shipping_methods)
            )
            
            # Add order items
            num_items = random.randint(1, 3)
            selected_products = random.sample(products, min(num_items, len(products)))
            total_amount = Decimal('0')
            
            for product in selected_products:
                quantity = random.randint(1, 2)
                OrderItem.objects.create(
                    order=order,
                    product=product,
                    quantity=quantity,
                    unit_price=product.price
                )
                total_amount += product.price * quantity
            
            # Add shipping cost
            total_amount += order.shipping_method.price
            order.total_amount = total_amount
            order.save()
            
            # Add order update
            OrderUpdate.objects.create(
                order=order,
                status=order.status,
                notes=f'Order {order.status.lower()}'
            )
            
            # Add payment if paid
            if order.payment_status == 'PAID':
                OrderPayment.objects.create(
                    order=order,
                    admin_account_number='01700000000',
                    sender_number=fake.phone_number()[:15],
                    transaction_id=fake.uuid4()[:20],
                    payment_method='bkash'
                )
            
            orders.append(order)
        
        self.stdout.write(self.style.SUCCESS(f'✅ Created {len(orders)} orders'))
        return orders

    def print_summary(self):
        """Print data summary"""
        self.stdout.write('\n' + '='*50)
        self.stdout.write(self.style.SUCCESS('📊 DATA SUMMARY'))
        self.stdout.write('='*50)
        
        summary_data = [
            ('Users', User.objects.count()),
            ('Addresses', Address.objects.count()),
            ('Shops', Shop.objects.count()),
            ('Categories', Category.objects.count()),
            ('SubCategories', SubCategory.objects.count()),
            ('Colors', Color.objects.count()),
            ('Sizes', Size.objects.count()),
            ('Products', Product.objects.count()),
            ('Reviews', Review.objects.count()),
            ('Shipping Methods', ShippingMethod.objects.count()),
            ('Orders', Order.objects.count()),
            ('Order Items', OrderItem.objects.count()),
        ]
        
        for model_name, count in summary_data:
            self.stdout.write(f'   {model_name}: {count}')
        
        self.stdout.write('\n🔐 Test Credentials:')
        self.stdout.write('   Admin: admin@icommerce.com / admin123')
        self.stdout.write('   Sellers: seller1@example.com to seller5@example.com / seller123')
        self.stdout.write('   Customers: customer1@example.com to customerN@example.com / customer123')
        
        self.stdout.write('\n✅ Your iCommerce application now has comprehensive test data!')
