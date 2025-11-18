// app/data/CartCouponData.jsx
// This file contains sample coupon data for testing purposes.

export const CartCouponData = [
  {
    code: "SAVE10",
    discountPercent: 10,
    minPurchase: 50,
    description: "Get 10% off on orders over ৳5,500.",
  },
  {
    code: "FREESHIP",
    discountPercent: 0, // This coupon affects shipping, not the subtotal
    isFreeShipping: true,
    minPurchase: 100,
    description: "Free shipping on orders over ৳11,000.",
  },
  {
    code: "SUMMER25",
    discountPercent: 25,
    minPurchase: 150,
    description: "Summer sale: 25% off on orders over ৳16,500.",
  },
  {
    code: "SALE50",
    discountPercent: 50,
    minPurchase: 200,
    description: "Flash Sale: 50% off on orders over ৳22,000.",
  },
];
