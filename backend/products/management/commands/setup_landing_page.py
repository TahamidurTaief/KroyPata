# Management command to enable landing page for a test product
from django.core.management.base import BaseCommand
from products.models import Product


class Command(BaseCommand):
    help = 'Enable landing page for the first product with sample content'

    def handle(self, *args, **kwargs):
        # Get the first product
        product = Product.objects.filter(is_active=True).first()
        
        if not product:
            self.stdout.write(self.style.ERROR('No active products found'))
            return
        
        # Enable landing page and add content
        product.enable_landing_page = True
        product.landing_features = """
        <h3>Key Features:</h3>
        <ul>
            <li><strong>High Quality:</strong> Premium materials and construction</li>
            <li><strong>Durable:</strong> Built to last with excellent craftsmanship</li>
            <li><strong>Stylish Design:</strong> Modern and elegant appearance</li>
            <li><strong>Great Value:</strong> Competitive pricing without compromising quality</li>
            <li><strong>Warranty:</strong> Comes with manufacturer's warranty</li>
        </ul>
        """
        
        product.landing_how_to_use = """
        <h3>How to Use This Product:</h3>
        <ol>
            <li><strong>Step 1:</strong> Carefully unpack the product from the box</li>
            <li><strong>Step 2:</strong> Follow the included instructions for setup</li>
            <li><strong>Step 3:</strong> Use as intended and enjoy the benefits</li>
            <li><strong>Step 4:</strong> Maintain regularly for optimal performance</li>
        </ol>
        <p><em>Always refer to the user manual for detailed instructions.</em></p>
        """
        
        product.landing_why_choose = """
        <h3>Why Choose This Product?</h3>
        <p>This product stands out from the competition for several compelling reasons:</p>
        <ul>
            <li><strong>Trusted Brand:</strong> From a reputable manufacturer with years of experience</li>
            <li><strong>Customer Satisfaction:</strong> High ratings and positive reviews from users</li>
            <li><strong>Quality Assurance:</strong> Rigorous quality control processes</li>
            <li><strong>Excellent Support:</strong> Responsive customer service team</li>
            <li><strong>Value for Money:</strong> Best quality-to-price ratio in the market</li>
        </ul>
        <p><strong>Join thousands of satisfied customers who have already made the smart choice!</strong></p>
        """
        
        product.save()
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully enabled landing page for product: {product.name} (slug: {product.slug})'
            )
        )
        self.stdout.write(f'Landing page URL: /products/landing/{product.slug}')
