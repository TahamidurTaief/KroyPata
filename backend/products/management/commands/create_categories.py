from django.core.management.base import BaseCommand
from products.models import Category

class Command(BaseCommand):
    help = 'Create test categories'

    def handle(self, *args, **options):
        categories_data = [
            {'name': 'Electronics', 'slug': 'electronics'},
            {'name': 'Fashion', 'slug': 'fashion'},
            {'name': 'Home & Garden', 'slug': 'home-garden'},
            {'name': 'Sports & Outdoors', 'slug': 'sports-outdoors'},
            {'name': 'Books', 'slug': 'books'},
            {'name': 'Health & Beauty', 'slug': 'health-beauty'}
        ]

        for cat_data in categories_data:
            category, created = Category.objects.get_or_create(
                slug=cat_data['slug'], 
                defaults={'name': cat_data['name']}
            )
            status = "Created" if created else "Already exists"
            self.stdout.write(
                self.style.SUCCESS(f'{status}: {category.name}')
            )

        total_count = Category.objects.count()
        self.stdout.write(
            self.style.SUCCESS(f'\nTotal categories in database: {total_count}')
        )
