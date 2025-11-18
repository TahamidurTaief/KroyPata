# products/management/commands/add_indexes.py
from django.core.management.base import BaseCommand
from django.db import connection

class Command(BaseCommand):
    help = 'Add database indexes for performance optimization'

    def handle(self, *args, **options):
        with connection.cursor() as cursor:
            self.stdout.write('Adding indexes to database tables...')
            
            # Products indexes
            try:
                cursor.execute('CREATE INDEX IF NOT EXISTS products_product_shop_id_idx ON products_product(shop_id)')
                self.stdout.write(self.style.SUCCESS('✓ Added index on products_product.shop_id'))
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'  Skip products_product.shop_id: {e}'))
            
            try:
                cursor.execute('CREATE INDEX IF NOT EXISTS products_product_brand_id_idx ON products_product(brand_id)')
                self.stdout.write(self.style.SUCCESS('✓ Added index on products_product.brand_id'))
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'  Skip products_product.brand_id: {e}'))
            
            try:
                cursor.execute('CREATE INDEX IF NOT EXISTS products_product_name_idx ON products_product(name)')
                self.stdout.write(self.style.SUCCESS('✓ Added index on products_product.name'))
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'  Skip products_product.name: {e}'))
            
            try:
                cursor.execute('CREATE INDEX IF NOT EXISTS products_product_sub_category_id_idx ON products_product(sub_category_id)')
                self.stdout.write(self.style.SUCCESS('✓ Added index on products_product.sub_category_id'))
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'  Skip products_product.sub_category_id: {e}'))
            
            try:
                cursor.execute('CREATE INDEX IF NOT EXISTS products_product_shipping_category_id_idx ON products_product(shipping_category_id)')
                self.stdout.write(self.style.SUCCESS('✓ Added index on products_product.shipping_category_id'))
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'  Skip products_product.shipping_category_id: {e}'))
            
            try:
                cursor.execute('CREATE INDEX IF NOT EXISTS products_product_price_idx ON products_product(price)')
                self.stdout.write(self.style.SUCCESS('✓ Added index on products_product.price'))
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'  Skip products_product.price: {e}'))
            
            try:
                cursor.execute('CREATE INDEX IF NOT EXISTS products_product_is_active_idx ON products_product(is_active)')
                self.stdout.write(self.style.SUCCESS('✓ Added index on products_product.is_active'))
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'  Skip products_product.is_active: {e}'))
            
            try:
                cursor.execute('CREATE INDEX IF NOT EXISTS products_product_created_at_idx ON products_product(created_at DESC)')
                self.stdout.write(self.style.SUCCESS('✓ Added index on products_product.created_at'))
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'  Skip products_product.created_at: {e}'))
            
            try:
                cursor.execute('CREATE INDEX IF NOT EXISTS products_product_updated_at_idx ON products_product(updated_at DESC)')
                self.stdout.write(self.style.SUCCESS('✓ Added index on products_product.updated_at'))
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'  Skip products_product.updated_at: {e}'))
            
            # Category indexes
            try:
                cursor.execute('CREATE INDEX IF NOT EXISTS products_category_name_idx ON products_category(name)')
                self.stdout.write(self.style.SUCCESS('✓ Added index on products_category.name'))
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'  Skip products_category.name: {e}'))
            
            # SubCategory indexes
            try:
                cursor.execute('CREATE INDEX IF NOT EXISTS products_subcategory_name_idx ON products_subcategory(name)')
                self.stdout.write(self.style.SUCCESS('✓ Added index on products_subcategory.name'))
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'  Skip products_subcategory.name: {e}'))
            
            try:
                cursor.execute('CREATE INDEX IF NOT EXISTS products_subcategory_category_id_idx ON products_subcategory(category_id)')
                self.stdout.write(self.style.SUCCESS('✓ Added index on products_subcategory.category_id'))
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'  Skip products_subcategory.category_id: {e}'))
            
            # Brand indexes
            try:
                cursor.execute('CREATE INDEX IF NOT EXISTS products_brand_is_active_idx ON products_brand(is_active)')
                self.stdout.write(self.style.SUCCESS('✓ Added index on products_brand.is_active'))
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'  Skip products_brand.is_active: {e}'))
            
            # Review indexes
            try:
                cursor.execute('CREATE INDEX IF NOT EXISTS products_review_user_id_idx ON products_review(user_id)')
                self.stdout.write(self.style.SUCCESS('✓ Added index on products_review.user_id'))
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'  Skip products_review.user_id: {e}'))
            
            try:
                cursor.execute('CREATE INDEX IF NOT EXISTS products_review_product_id_idx ON products_review(product_id)')
                self.stdout.write(self.style.SUCCESS('✓ Added index on products_review.product_id'))
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'  Skip products_review.product_id: {e}'))
            
            try:
                cursor.execute('CREATE INDEX IF NOT EXISTS products_review_rating_idx ON products_review(rating)')
                self.stdout.write(self.style.SUCCESS('✓ Added index on products_review.rating'))
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'  Skip products_review.rating: {e}'))
            
            try:
                cursor.execute('CREATE INDEX IF NOT EXISTS products_review_created_at_idx ON products_review(created_at DESC)')
                self.stdout.write(self.style.SUCCESS('✓ Added index on products_review.created_at'))
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'  Skip products_review.created_at: {e}'))
            
            # Orders indexes
            try:
                cursor.execute('CREATE INDEX IF NOT EXISTS orders_order_user_id_idx ON orders_order(user_id)')
                self.stdout.write(self.style.SUCCESS('✓ Added index on orders_order.user_id'))
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'  Skip orders_order.user_id: {e}'))
            
            try:
                cursor.execute('CREATE INDEX IF NOT EXISTS orders_order_status_idx ON orders_order(status)')
                self.stdout.write(self.style.SUCCESS('✓ Added index on orders_order.status'))
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'  Skip orders_order.status: {e}'))
            
            try:
                cursor.execute('CREATE INDEX IF NOT EXISTS orders_order_payment_status_idx ON orders_order(payment_status)')
                self.stdout.write(self.style.SUCCESS('✓ Added index on orders_order.payment_status'))
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'  Skip orders_order.payment_status: {e}'))
            
            try:
                cursor.execute('CREATE INDEX IF NOT EXISTS orders_order_customer_email_idx ON orders_order(customer_email)')
                self.stdout.write(self.style.SUCCESS('✓ Added index on orders_order.customer_email'))
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'  Skip orders_order.customer_email: {e}'))
            
            try:
                cursor.execute('CREATE INDEX IF NOT EXISTS orders_order_ordered_at_idx ON orders_order(ordered_at DESC)')
                self.stdout.write(self.style.SUCCESS('✓ Added index on orders_order.ordered_at'))
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'  Skip orders_order.ordered_at: {e}'))
            
            # OrderItem indexes
            try:
                cursor.execute('CREATE INDEX IF NOT EXISTS orders_orderitem_order_id_idx ON orders_orderitem(order_id)')
                self.stdout.write(self.style.SUCCESS('✓ Added index on orders_orderitem.order_id'))
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'  Skip orders_orderitem.order_id: {e}'))
            
            try:
                cursor.execute('CREATE INDEX IF NOT EXISTS orders_orderitem_product_id_idx ON orders_orderitem(product_id)')
                self.stdout.write(self.style.SUCCESS('✓ Added index on orders_orderitem.product_id'))
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'  Skip orders_orderitem.product_id: {e}'))
            
            # Coupon indexes
            try:
                cursor.execute('CREATE INDEX IF NOT EXISTS orders_coupon_code_idx ON orders_coupon(code)')
                self.stdout.write(self.style.SUCCESS('✓ Added index on orders_coupon.code'))
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'  Skip orders_coupon.code: {e}'))
            
            try:
                cursor.execute('CREATE INDEX IF NOT EXISTS orders_coupon_active_idx ON orders_coupon(active)')
                self.stdout.write(self.style.SUCCESS('✓ Added index on orders_coupon.active'))
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'  Skip orders_coupon.active: {e}'))
            
            try:
                cursor.execute('CREATE INDEX IF NOT EXISTS orders_coupon_expires_at_idx ON orders_coupon(expires_at)')
                self.stdout.write(self.style.SUCCESS('✓ Added index on orders_coupon.expires_at'))
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'  Skip orders_coupon.expires_at: {e}'))
            
            # User indexes
            try:
                cursor.execute('CREATE INDEX IF NOT EXISTS users_user_user_type_idx ON users_user(user_type)')
                self.stdout.write(self.style.SUCCESS('✓ Added index on users_user.user_type'))
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'  Skip users_user.user_type: {e}'))
            
            try:
                cursor.execute('CREATE INDEX IF NOT EXISTS users_user_is_active_idx ON users_user(is_active)')
                self.stdout.write(self.style.SUCCESS('✓ Added index on users_user.is_active'))
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'  Skip users_user.is_active: {e}'))
            
            try:
                cursor.execute('CREATE INDEX IF NOT EXISTS users_user_date_joined_idx ON users_user(date_joined DESC)')
                self.stdout.write(self.style.SUCCESS('✓ Added index on users_user.date_joined'))
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'  Skip users_user.date_joined: {e}'))
            
            # Address indexes
            try:
                cursor.execute('CREATE INDEX IF NOT EXISTS users_address_user_id_idx ON users_address(user_id)')
                self.stdout.write(self.style.SUCCESS('✓ Added index on users_address.user_id'))
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'  Skip users_address.user_id: {e}'))
            
            try:
                cursor.execute('CREATE INDEX IF NOT EXISTS users_address_is_default_idx ON users_address(is_default)')
                self.stdout.write(self.style.SUCCESS('✓ Added index on users_address.is_default'))
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'  Skip users_address.is_default: {e}'))
            
            self.stdout.write(self.style.SUCCESS('\n✅ Database indexes added successfully!'))
