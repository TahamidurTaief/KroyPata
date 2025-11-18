import { products } from "../data/products";

// Simulate API delay
const simulateDelay = () => new Promise((resolve) => setTimeout(resolve, 200));

export const getProductBySlug = async (slug) => {
  await simulateDelay();
  return products.find((p) => p.slug === slug);
};

export const getProducts = async () => {
  await simulateDelay();
  return products;
};
