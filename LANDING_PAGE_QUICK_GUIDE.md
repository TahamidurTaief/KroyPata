# Product Landing Page - Quick Reference Guide

## 🚀 Quick Start

### For Admins

#### Enable Landing Page for a Product
1. Go to Django Admin → Products → Products
2. Select a product to edit
3. Scroll to "Landing Page Settings" section
4. Check "Enable landing page"
5. Fill in the content fields:
   - **Landing features**: Product features and benefits
   - **Landing how to use**: Usage instructions
   - **Landing why choose**: Reasons to buy
6. Click "Save"

#### View Landing Page Orders
1. Go to Django Admin → Products → Landing Page Orders
2. Filter by status, wholesaler type, or date
3. Click on an order to view details
4. Update status as needed

### For Customers

#### Placing an Order
1. Visit: `/products/landing/{product-slug}`
2. View product details, features, and images
3. Select quantity (min. quantity applies for wholesalers)
4. Fill in the form:
   - Full Name
   - Email
   - Phone Number
   - Detailed Address
   - Additional Notes (optional)
5. Click "Place Order"
6. Receive order number confirmation

## 📍 URLs

### Frontend
- Landing Page: `/products/landing/{product-slug}`
- Example: `/products/landing/first-wear-cotton-megi-vest-set-with-embroiderd-mo`

### API Endpoints
- Get Product: `GET /api/products/products/{slug}/`
- Create Order: `POST /api/products/landing-orders/`
- List My Orders: `GET /api/products/landing-orders/`
- Order Detail: `GET /api/products/landing-orders/{id}/`

## 💡 Tips

### For Maximum Conversions
- Add high-quality product images
- Write compelling features
- Include clear usage instructions
- Highlight unique selling points
- Set competitive pricing

### For Wholesalers
- Set appropriate `wholesale_price` (must be ≥ 1)
- Configure `minimum_purchase` quantity
- Ensure customers are approved in system

### Content Writing Tips
**Features Section:**
- Use bullet points
- Focus on benefits
- Be specific and measurable
- Highlight unique aspects

**How to Use Section:**
- Number the steps
- Be clear and concise
- Include safety warnings if needed
- Add visual cues

**Why Choose Section:**
- Address customer concerns
- Compare with alternatives
- Use social proof
- Create urgency

## 🎨 Customization

### Colors
Edit `frontend/app/globals.css` CSS variables:
```css
--color-button-primary: #2563eb;
--color-accent-orange: #f59e0b;
--color-accent-green: #16a34a;
```

### Layout
Edit `frontend/app/products/landing/[slug]/landing.css` for layout changes.

## 🔍 Debugging

### Product Not Showing
```bash
# Check if landing page is enabled
python manage.py shell -c "from products.models import Product; p = Product.objects.get(slug='your-slug'); print(f'Enabled: {p.enable_landing_page}')"
```

### Order Not Creating
- Check browser console for errors
- Verify API endpoint URL
- Check product stock
- Ensure all required fields filled

### Price Not Correct
- Verify user is logged in (for wholesale)
- Check wholesaler approval status
- Ensure wholesale_price is set
- Check discount_price for regular customers

## 📊 Order Status Flow

```
PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED
                          ↓
                      CANCELLED
```

## 🔐 Permissions

### Order Viewing
- **Guests**: Cannot view orders
- **Customers**: View own orders only
- **Staff/Admin**: View all orders

### Order Creation
- **Anyone**: Can create orders (even without login)
- **Logged-in users**: Orders linked to account

## 📱 Mobile Optimization

Landing pages are fully responsive:
- Mobile: Single column layout
- Tablet: Optimized spacing
- Desktop: Two-column layout

## 🎯 Key Metrics to Track

1. **Conversion Rate**: Orders / Page Views
2. **Average Order Value**: Total Revenue / Orders
3. **Wholesale vs Regular**: Order distribution
4. **Popular Products**: Most ordered items
5. **Order Status**: Completion rates

## 🛠️ Management Commands

```bash
# Setup test landing page
python manage.py setup_landing_page

# Check landing page status
python manage.py shell -c "from products.models import Product; print(Product.objects.filter(enable_landing_page=True).count())"

# List landing orders
python manage.py shell -c "from products.models import LandingPageOrder; for o in LandingPageOrder.objects.all()[:10]: print(f'{o.order_number} - {o.full_name}')"
```

## ✅ Pre-Launch Checklist

- [ ] Landing page content added for products
- [ ] Product images uploaded
- [ ] Pricing configured (regular and wholesale)
- [ ] Minimum purchase quantities set
- [ ] Test order placed successfully
- [ ] Email notifications configured (optional)
- [ ] Admin trained on order management
- [ ] Mobile layout tested
- [ ] Payment integration ready (if applicable)
- [ ] Customer support prepared

## 🆘 Support

For issues or questions:
1. Check error logs in browser console
2. Review Django admin logs
3. Verify database migrations
4. Check API connectivity
5. Review this documentation

## 📞 Common Customer Questions

**Q: Can I order without creating an account?**
A: Yes, guest checkout is available.

**Q: How do I get wholesale pricing?**
A: Register as wholesaler and wait for admin approval.

**Q: What's the minimum order quantity?**
A: Varies by product; shown on the landing page.

**Q: How do I track my order?**
A: Login to view your orders (if placed while logged in).

**Q: Can I modify my order?**
A: Contact admin with your order number.

---

**Made with ❤️ for iCommerce**
