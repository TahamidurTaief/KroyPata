// app/lib/Data/CouponData.jsx
// This file contains the new, more advanced coupon data structure.

export const CouponData = [
  {
    code: "SAVE10",
    description: "Get 10% off your entire order.",
    type: "percentage", // 'percentage', 'fixed', 'shipping_percentage'
    discountValue: 10, // The value of the discount
    conditions: {
      minPurchase: 50, // Minimum total price required
    },
  },
  {
    code: "20OFF",
    description: "Get ৳2,200 off on orders over ৳16,500.",
    type: "fixed",
    discountValue: 20,
    conditions: {
      minPurchase: 150,
    },
  },
  {
    code: "SHIPIT",
    description: "50% off shipping on orders with 3 or more items.",
    type: "shipping_percentage",
    discountValue: 50, // 50% off shipping
    conditions: {
      minItems: 3, // Minimum number of items in cart
    },
  },
  {
    code: "FREESHIP",
    description: "Free shipping on orders over ৳11,000.",
    type: "shipping_percentage",
    discountValue: 100, // 100% off shipping
    conditions: {
      minPurchase: 100,
    },
  },
];
