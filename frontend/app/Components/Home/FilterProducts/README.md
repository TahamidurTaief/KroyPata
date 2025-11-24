# Category Carousel Filter Component

## Overview

The **Category Carousel** is a modern, responsive, and SEO-optimized product filtering component that replaces the traditional multi-filter section with a streamlined category-only filter.

## Features

### ✨ Key Features

- **Category-Only Filtering**: Simplified UX focusing on category selection
- **Horizontal Carousel Design**: Smooth scrolling carousel with navigation arrows
- **"All Products" Option**: Quick access to view all products
- **Instant Filtering**: No page reload - products update instantly
- **Fixed-Height Images**: Consistent 140px-180px image heights (responsive)
- **Mobile-First Design**: Fully responsive with touch-enabled scrolling
- **SEO Optimized**: Semantic HTML, ARIA labels, and proper image alt text
- **Performance Optimized**: Lazy loading, optimized images, GPU acceleration

### 🎨 Design Highlights

- **Gradient Background**: Attractive gradient from slate to blue
- **Hover Effects**: Scale and shadow animations on hover
- **Visual Feedback**: Selected state with ring and checkmark indicator
- **Smooth Scrolling**: CSS scroll-snap for precise positioning
- **Navigation Arrows**: Show/hide based on scroll position
- **Scroll Indicators**: Mobile dots for scroll position awareness

## Component Structure

```
FilterProducts/
├── CategoryCarousel.jsx    (New component)
├── FilterProducts.jsx       (Updated)
├── FilteredProduct.jsx      (Unchanged)
└── README.md               (This file)
```

## Usage

### Basic Implementation

```jsx
import FilterProducts from "@/app/Components/Home/FilterProducts/FilterProducts";

<FilterProducts 
  initialProducts={products}
  categories={categories}
/>
```

### Props

#### FilterProducts Component

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `initialProducts` | Array | Yes | Initial product data from server |
| `categories` | Array | Yes | List of categories with id, name, slug, and image |

#### CategoryCarousel Component

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `categories` | Array | Yes | Category objects with id, name, slug, image |
| `onCategoryChange` | Function | Yes | Callback when category selection changes |
| `selectedCategory` | String | Yes | Currently selected category slug |

## Category Data Structure

```javascript
{
  id: 1,
  name: "Electronics",
  slug: "electronics",
  image: "/media/categories/electronics.jpg"
}
```

## Responsive Breakpoints

| Breakpoint | Card Width | Image Height | Features |
|------------|------------|--------------|----------|
| Mobile (< 768px) | 140px | 140px | Touch scrolling, dots indicator |
| Tablet (768px - 1024px) | 160px | 160px | Hover arrows, larger images |
| Desktop (> 1024px) | 180px | 180px | Full features, optimal spacing |

## SEO Optimization

### 1. Semantic HTML
```html
<section> for main container
<h2> for section heading
<button> for interactive elements
```

### 2. ARIA Labels
```jsx
aria-label="Filter by Electronics"
aria-pressed={selected}
aria-label="Scroll left"
```

### 3. Image Optimization
```jsx
<Image
  alt="Electronics category"
  loading="lazy"
  quality={85}
  sizes="(max-width: 768px) 140px, ..."
/>
```

### 4. Structured Content
- Descriptive heading: "Explore Products"
- Subtitle: "Browse our curated collection by category"
- Proper heading hierarchy (h2)

## Performance Optimizations

### 1. Lazy Loading
- Images load on-demand with `loading="lazy"`
- Optimized image sizes with Next.js Image component

### 2. GPU Acceleration
```css
.group/card:hover {
  will-change: transform;
}
```

### 3. Smooth Scrolling
```css
scroll-behavior: smooth;
scroll-snap-type: x mandatory;
```

### 4. Debounced Scroll Events
- Scroll position checks are optimized
- Event listeners properly cleaned up

## State Management

### Component State

```javascript
const [selectedCategory, setSelectedCategory] = useState("");
const [products, setProducts] = useState(initialProducts);
const [isLoading, setIsLoading] = useState(false);
const [canScrollLeft, setCanScrollLeft] = useState(false);
const [canScrollRight, setCanScrollRight] = useState(true);
```

### Data Flow

```
User clicks category
    ↓
handleCategoryChange(slug)
    ↓
setSelectedCategory(slug)
    ↓
useEffect triggers
    ↓
fetchFilteredProducts()
    ↓
API call with category filter
    ↓
setProducts(newData)
    ↓
UI updates (no reload)
```

## Styling Architecture

### Tailwind Classes
- Utility-first approach
- Dark mode support with `dark:` variants
- Responsive breakpoints (`md:`, `lg:`)

### Custom CSS
- Scrollbar hiding
- Smooth animations
- Accessibility focus states

### CSS-in-JS
```jsx
<style jsx>{`
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
`}</style>
```

## Accessibility Features

### Keyboard Navigation
- ✅ Tab navigation between categories
- ✅ Enter/Space to select
- ✅ Arrow keys for carousel scrolling (native)

### Screen Readers
- ✅ Proper ARIA labels on all interactive elements
- ✅ Semantic HTML structure
- ✅ Alt text on all images
- ✅ Announced state changes

### Visual Indicators
- ✅ Focus visible styles
- ✅ Selected state indicator
- ✅ High contrast support

## Browser Support

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | 90+ | ✅ Full support |
| Firefox | 88+ | ✅ Full support |
| Safari | 14+ | ✅ Full support |
| Edge | 90+ | ✅ Full support |
| Mobile Safari | 14+ | ✅ Full support |
| Chrome Mobile | 90+ | ✅ Full support |

## Migration Guide

### From Old FilterSection

**Before:**
```jsx
<FilterSection 
  categories={categories}
  onFilterChange={handleFilterChange}
/>
```

**After:**
```jsx
<CategoryCarousel
  categories={categories}
  onCategoryChange={handleCategoryChange}
  selectedCategory={selectedCategory}
/>
```

### Removed Features
- ❌ Price range slider
- ❌ Sort dropdown
- ❌ Mobile filter modal
- ❌ Multiple filter combinations

### New Features
- ✅ Horizontal carousel
- ✅ Instant category switching
- ✅ All Products button
- ✅ Visual category cards
- ✅ Simplified UX

## Customization

### Change Image Heights

```jsx
// In CategoryCarousel.jsx, update these classes:
h-[140px] md:h-[160px] lg:h-[180px]
```

### Modify Scroll Behavior

```jsx
const scrollAmount = 280; // Change this value
```

### Update Colors

```jsx
// Change gradient background
className="bg-gradient-to-br from-slate-50 via-white to-blue-50"

// Change selected state
className="ring-2 ring-sky-500"
```

## Troubleshooting

### Categories Not Loading
```javascript
// Check if categories prop is passed correctly
console.log('Categories:', categories);
```

### Images Not Displaying
```javascript
// Verify image paths are absolute URLs
// Check Next.js image configuration in next.config.js
```

### Scroll Not Working
```javascript
// Ensure carousel has overflow-x-auto
// Check if scrollbarWidth is set correctly
```

### Selection Not Updating
```javascript
// Verify onCategoryChange is called
// Check selectedCategory state updates
```

## Future Enhancements

- [ ] Keyboard arrow navigation
- [ ] Swipe gestures for mobile
- [ ] Infinite scroll for many categories
- [ ] Category search/filter
- [ ] Animated transitions between products
- [ ] Virtual scrolling for large category lists

## Credits

- **Icons**: Lucide React
- **Images**: Next.js Image optimization
- **Styling**: Tailwind CSS
- **State**: React Hooks

---

**Version**: 1.0.0  
**Last Updated**: November 24, 2025  
**Author**: GitHub Copilot  
**License**: MIT
