# Management command to assign brands to existing products

from django.core.management.base import BaseCommand
from products.models import Product, Brand
import random


class Command(BaseCommand):
    help = 'Assign brands to existing products that don\'t have brands'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting brand assignment for existing products...'))
        
        # Get all active brands
        brands = list(Brand.objects.filter(is_active=True))
        
        if not brands:
            self.stdout.write(self.style.ERROR('No active brands found. Please create brands first.'))
            return
        
        # Get all products without brands
        products_without_brands = Product.objects.filter(brand__isnull=True)
        count = products_without_brands.count()
        
        if count == 0:
            self.stdout.write(self.style.SUCCESS('All products already have brands assigned.'))
            return
        
        self.stdout.write(f'Found {count} products without brands. Assigning random brands...')
        
        # Assign random brands to products
        updated_count = 0
        for product in products_without_brands:
            # Choose a random brand
            random_brand = random.choice(brands)
            product.brand = random_brand
            product.save()
            updated_count += 1
            
            if updated_count % 10 == 0:
                self.stdout.write(f'Updated {updated_count} products...')
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully assigned brands to {updated_count} products!'
            )
        )
