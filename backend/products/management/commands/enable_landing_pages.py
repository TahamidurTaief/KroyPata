# Management command to enable landing pages for multiple products
from django.core.management.base import BaseCommand
from products.models import Product


class Command(BaseCommand):
    help = 'Enable landing page for multiple products with sample content'

    def add_arguments(self, parser):
        parser.add_argument(
            '--count',
            type=int,
            default=5,
            help='Number of products to enable landing page for'
        )
        parser.add_argument(
            '--all',
            action='store_true',
            help='Enable landing page for all active products'
        )

    def handle(self, *args, **options):
        count = options['count']
        enable_all = options['all']
        
        if enable_all:
            products = Product.objects.filter(is_active=True, enable_landing_page=False)
        else:
            products = Product.objects.filter(is_active=True, enable_landing_page=False)[:count]
        
        if not products.exists():
            self.stdout.write(self.style.WARNING('No products found to enable landing page'))
            return
        
        enabled_count = 0
        
        for product in products:
            # Enable landing page and add content
            product.enable_landing_page = True
            
            # Generic features
            product.landing_features = f"""
            <h3>Key Features of {product.name}:</h3>
            <ul>
                <li><strong>High Quality:</strong> Premium materials and excellent craftsmanship</li>
                <li><strong>Authentic Product:</strong> 100% genuine and authentic</li>
                <li><strong>Durable:</strong> Built to last with long-term reliability</li>
                <li><strong>Stylish Design:</strong> Modern and elegant appearance</li>
                <li><strong>Great Value:</strong> Competitive pricing without compromising quality</li>
                <li><strong>Warranty Included:</strong> Comes with manufacturer's warranty</li>
                <li><strong>Fast Delivery:</strong> Quick and reliable shipping</li>
            </ul>
            """
            
            # Generic how to use
            product.landing_how_to_use = """
            <h3>How to Use:</h3>
            <ol>
                <li><strong>Unpack Carefully:</strong> Remove the product from packaging carefully</li>
                <li><strong>Inspect:</strong> Check for any damage during shipping</li>
                <li><strong>Read Manual:</strong> Review included instructions thoroughly</li>
                <li><strong>Setup:</strong> Follow the setup instructions if applicable</li>
                <li><strong>Use as Intended:</strong> Enjoy your product following guidelines</li>
                <li><strong>Maintain:</strong> Follow care instructions for longevity</li>
            </ol>
            <p><em>Always refer to the product manual for specific instructions.</em></p>
            """
            
            # Generic why choose
            product.landing_why_choose = f"""
            <h3>Why Choose {product.name}?</h3>
            <div class="why-choose-content">
                <p>This product stands out from the competition for several compelling reasons:</p>
                
                <h4>✓ Trusted Quality</h4>
                <p>Made by {product.brand.name if product.brand else 'a reputable manufacturer'} with years of experience in the industry.</p>
                
                <h4>✓ Customer Satisfaction</h4>
                <p>Join thousands of satisfied customers who have already made the smart choice. High ratings and positive reviews speak for themselves.</p>
                
                <h4>✓ Best Value for Money</h4>
                <p>We offer the best quality-to-price ratio in the market. You get premium quality without breaking the bank.</p>
                
                <h4>✓ Excellent Support</h4>
                <p>Our responsive customer service team is always ready to help you with any questions or concerns.</p>
                
                <h4>✓ Guaranteed Satisfaction</h4>
                <p>We stand behind our products with a solid warranty and return policy.</p>
                
                <p><strong>Don't miss out! Order now and experience the difference!</strong></p>
            </div>
            """
            
            product.save()
            enabled_count += 1
            
            self.stdout.write(
                self.style.SUCCESS(
                    f'✓ Enabled landing page for: {product.name}'
                )
            )
        
        self.stdout.write('')
        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully enabled landing pages for {enabled_count} products!'
            )
        )
        self.stdout.write('')
        self.stdout.write('Landing page URLs:')
        for product in products:
            self.stdout.write(f'  • /products/landing/{product.slug}')
