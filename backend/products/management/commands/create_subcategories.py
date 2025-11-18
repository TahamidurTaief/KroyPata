from django.core.management.base import BaseCommand
from products.models import Category, SubCategory

class Command(BaseCommand):
    help = 'Create test subcategories for existing categories'

    def handle(self, *args, **options):
        # Get all existing categories
        categories = Category.objects.all()
        
        if not categories.exists():
            self.stdout.write(
                self.style.ERROR('No categories found. Please create categories first using create_categories command.')
            )
            return

        subcategories_data = {
            'electronics': [
                {'name': 'Smartphones', 'slug': 'smartphones'},
                {'name': 'Laptops', 'slug': 'laptops'},
                {'name': 'Headphones', 'slug': 'headphones'},
                {'name': 'Cameras', 'slug': 'cameras'},
            ],
            'fashion': [
                {'name': 'Men Clothing', 'slug': 'men-clothing'},
                {'name': 'Women Clothing', 'slug': 'women-clothing'},
                {'name': 'Shoes', 'slug': 'shoes'},
                {'name': 'Accessories', 'slug': 'accessories'},
            ],
            'home-garden': [
                {'name': 'Furniture', 'slug': 'furniture'},
                {'name': 'Kitchen', 'slug': 'kitchen'},
                {'name': 'Garden Tools', 'slug': 'garden-tools'},
                {'name': 'Home Decor', 'slug': 'home-decor'},
            ],
            'sports-outdoors': [
                {'name': 'Fitness Equipment', 'slug': 'fitness-equipment'},
                {'name': 'Outdoor Gear', 'slug': 'outdoor-gear'},
                {'name': 'Sports Clothing', 'slug': 'sports-clothing'},
            ],
            'books': [
                {'name': 'Fiction', 'slug': 'fiction'},
                {'name': 'Non-Fiction', 'slug': 'non-fiction'},
                {'name': 'Educational', 'slug': 'educational'},
            ],
            'health-beauty': [
                {'name': 'Skincare', 'slug': 'skincare'},
                {'name': 'Makeup', 'slug': 'makeup'},
                {'name': 'Hair Care', 'slug': 'hair-care'},
                {'name': 'Supplements', 'slug': 'supplements'},
            ]
        }

        created_count = 0
        for category in categories:
            if category.slug in subcategories_data:
                subcats = subcategories_data[category.slug]
                for subcat_data in subcats:
                    subcategory, created = SubCategory.objects.get_or_create(
                        slug=subcat_data['slug'],
                        defaults={
                            'name': subcat_data['name'],
                            'category': category
                        }
                    )
                    if created:
                        self.stdout.write(
                            self.style.SUCCESS(f'Created subcategory: {subcategory.name} for {category.name}')
                        )
                        created_count += 1
                    else:
                        self.stdout.write(f'Subcategory already exists: {subcategory.name}')

        total_subcategories = SubCategory.objects.count()
        self.stdout.write(
            self.style.SUCCESS(f'\nTotal subcategories in database: {total_subcategories}')
        )
        self.stdout.write(
            self.style.SUCCESS(f'Subcategories created this run: {created_count}')
        )
