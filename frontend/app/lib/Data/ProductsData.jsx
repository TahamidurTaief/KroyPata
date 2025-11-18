// app/lib/Data/ProductsData.jsx
// This file contains your product data.
// Corrected additionalImages to use local image imports.

import baby_fashion from "@/public/img/Home/Caregory/baby-fashion.jpg";
import men_fashion from "@/public/img/Home/Caregory/men-fashion.jpeg";
import gadget_img from "@/public/img/Home/Caregory/gadget_img.jpg";
import girls_bag from "@/public/img/Home/Caregory/girls-bag.jpeg";
import girls_fashion from "@/public/img/Home/Caregory/girs-fashion-dress.jpeg";
import cosmatic from "@/public/img/Home/Caregory/cosmatic.jpg";

export const ProductsData = [
  {
    name: "Cotton Fabric T-Shirt for Kids",
    category: "Baby Fashion",
    imageUrl: baby_fashion,
    description:
      "A comfortable and stylish 100% cotton t-shirt, perfect for everyday wear for kids. Made with soft, breathable fabric for all-day comfort. Features a vibrant design and durable stitching.",
    price: 12.0,
    originalPrice: 15.0,
    currency: "BDT",
    sizes: ["S", "M", "XL"],
    colors: [
      { name: "Purple", hex: "#a855f7" },
      { name: "Pink", hex: "#ec4899" },
      { name: "Gray", hex: "#9ca3af" },
    ],
    sku: "TSHIRT-COTTON-KID-001",
    brand: "Issl Commerce Apparel",
    slug: "cotton-fabric-t-shirt-for-kids",
    rating: 4.5,
    reviews: 24,
    inStock: true,
    additionalImages: [
      girls_fashion, // Using an imported image
      cosmatic, // Using an imported image
    ],
  },
  {
    name: "Denim Jeans for Toddlers",
    category: "Baby Fashion",
    imageUrl: men_fashion,
    description:
      "Durable denim jeans with elastic waistband for comfort and easy movement. Perfect for active toddlers, featuring reinforced knees and stylish wash.",
    price: 18.0,
    originalPrice: 25.0,
    currency: "BDT",
    sizes: ["S", "M", "L"],
    colors: [
      { name: "Blue", hex: "#3b82f6" },
      { name: "Black", hex: "#000000" },
    ],
    sku: "JEANS-DENIM-TOD-002",
    brand: "Issl Commerce Apparel",
    slug: "denim-jeans-for-toddlers",
    rating: 4.2,
    reviews: 18,
    inStock: true,
    additionalImages: [baby_fashion, gadget_img],
  },
  {
    name: "Winter Jacket for Kids",
    category: "Baby Fashion",
    imageUrl: gadget_img,
    description:
      "Warm winter jacket with waterproof outer layer and cozy fleece lining. Designed to keep kids warm and dry in cold weather. Features a detachable hood and multiple pockets.",
    price: 35.0,
    originalPrice: 45.0,
    currency: "BDT",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Red", hex: "#EF4444" },
      { name: "Blue", hex: "#3B82F6" },
    ],
    sku: "JACKET-WINTER-KID-003",
    brand: "Issl Commerce Apparel",
    slug: "winter-jacket-for-kids",
    rating: 4.7,
    reviews: 32,
    inStock: true,
    additionalImages: [men_fashion, girls_bag],
  },
  {
    name: "Stylish Girls Bag",
    category: "Women's Bags",
    imageUrl: girls_bag,
    description:
      "Fashionable bag for girls with multiple compartments, perfect for daily use or special occasions. Made from high-quality faux leather with a secure zipper closure.",
    price: 22.0,
    originalPrice: 30.0,
    currency: "BDT",
    sizes: ["One Size"],
    colors: [
      { name: "Pink", hex: "#EC4899" },
      { name: "White", hex: "#FFFFFF" },
    ],
    sku: "BAG-GIRLS-004",
    brand: "Issl Commerce Apparel",
    slug: "stylish-girls-bag",
    rating: 4.3,
    reviews: 15,
    inStock: true,
    additionalImages: [cosmatic, baby_fashion],
  },
  {
    name: "Girls Fashion Dress",
    category: "Baby Fashion",
    imageUrl: girls_fashion,
    description:
      "Beautiful summer dress for girls with floral pattern and comfortable fit. Ideal for parties or casual wear, made from soft cotton blend fabric.",
    price: 28.0,
    originalPrice: 35.0,
    currency: "BDT",
    sizes: ["S", "M", "L"],
    colors: [
      { name: "Yellow", hex: "#F59E0B" },
      { name: "Green", hex: "#10B981" },
    ],
    sku: "DRESS-GIRLS-005",
    brand: "Issl Commerce Apparel",
    slug: "girls-fashion-dress",
    rating: 4.6,
    reviews: 27,
    inStock: true,
    additionalImages: [men_fashion, gadget_img],
  },
  {
    name: "Cosmetic Set",
    category: "Cosmetics",
    imageUrl: cosmatic,
    description:
      "Complete cosmetic set with natural ingredients for a radiant look. Includes foundation, eyeshadow palette, lipstick, and brushes. Hypoallergenic and cruelty-free.",
    price: 42.0,
    originalPrice: 55.0,
    currency: "BDT",
    sizes: ["Set"],
    colors: [], // Cosmetics might not have colors in the same way as apparel
    sku: "COSMETIC-SET-006",
    brand: "Issl Commerce Beauty",
    slug: "cosmetic-set",
    rating: 4.4,
    reviews: 38,
    inStock: true,
    additionalImages: [girls_bag, girls_fashion],
  },
  {
    name: "Smart Watch",
    category: "Men's Fashion", // Categorized under Men's Fashion for this dataset
    imageUrl: gadget_img,
    description:
      "Feature-rich smart watch with health monitoring, GPS, and long battery life. Track your fitness, receive notifications, and make calls directly from your wrist.",
    price: 89.0,
    originalPrice: 120.0,
    currency: "BDT",
    sizes: ["Standard"],
    colors: [
      { name: "Black", hex: "#000000" },
      { name: "Silver", hex: "#C0C0C0" },
    ],
    sku: "WATCH-SMART-007",
    brand: "Issl Commerce Tech",
    slug: "smart-watch",
    rating: 4.8,
    reviews: 45,
    inStock: true,
    additionalImages: [baby_fashion, cosmatic],
  },
  {
    name: "Men's Fashion Shirt",
    category: "Men's Fashion",
    imageUrl: men_fashion,
    description:
      "Premium quality shirt for men with slim fit and modern design. Made from breathable cotton fabric, perfect for both casual and formal occasions.",
    price: 32.0,
    originalPrice: 45.0,
    currency: "BDT",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "White", hex: "#FFFFFF" },
      { name: "Blue", hex: "#3B82F6" },
      { name: "Gray", hex: "#6B7280" },
    ],
    sku: "SHIRT-MEN-008",
    brand: "Issl Commerce Apparel",
    slug: "mens-fashion-shirt",
    rating: 4.1,
    reviews: 21,
    inStock: true,
    additionalImages: [girls_fashion, gadget_img],
  },
  {
    name: "Wireless Earbuds",
    category: "Men's Fashion", // Categorized under Men's Fashion for this dataset
    imageUrl: gadget_img,
    description:
      "High-quality wireless earbuds with noise cancellation, clear audio, and comfortable fit. Ideal for music, calls, and workouts. Comes with a portable charging case.",
    price: 59.0,
    originalPrice: 79.0,
    currency: "BDT",
    sizes: ["Standard"],
    colors: [
      { name: "White", hex: "#ffffff" },
      { name: "Black", hex: "#000000" },
    ],
    sku: "EARBUDS-WIRELESS-009",
    brand: "Issl Commerce Tech",
    slug: "wireless-earbuds",
    rating: 4.5,
    reviews: 56,
    inStock: true,
    additionalImages: [men_fashion, girls_bag],
  },
  {
    name: "Leather Wallet",
    category: "Women's Bags", // Categorized under Women's Bags for this dataset
    imageUrl: girls_bag,
    description:
      "Genuine leather wallet with multiple card slots, coin pocket, and bill compartments. Slim design, durable, and stylish for everyday use.",
    price: 24.0,
    originalPrice: 35.0,
    currency: "BDT",
    sizes: ["One Size"],
    colors: [
      { name: "Brown", hex: "#8B4513" },
      { name: "Black", hex: "#000000" },
    ],
    sku: "WALLET-LEATHER-010",
    brand: "Issl Commerce Apparel",
    slug: "leather-wallet",
    rating: 4.3,
    reviews: 19,
    inStock: true,
    additionalImages: [cosmatic, baby_fashion],
  },
];
