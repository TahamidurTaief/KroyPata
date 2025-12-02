
// ===================================================================
// app/Components/Product/ImageGallery.jsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { useThemeAssets } from "@/app/hooks/useThemeAssets";

export default function ImageGallery({ images, productName }) {
  const { noImagePlaceholder, fallbackPlaceholder, mounted } = useThemeAssets();
  const [imageError, setImageError] = useState(false);
  
  // Get the appropriate placeholder or first image
  const getInitialImage = () => {
    if (images && images.length > 0 && images[0]) {
      return images[0];
    }
    return mounted ? noImagePlaceholder : fallbackPlaceholder;
  };

  const [selectedImage, setSelectedImage] = useState(getInitialImage());

  const getImageSrc = (imageSrc) => {
    if (imageError || !imageSrc) {
      return mounted ? noImagePlaceholder : fallbackPlaceholder;
    }
    return imageSrc;
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full aspect-square rounded-xl overflow-hidden shadow-lg mb-4 bg-[var(--card)]">
        <Image
          src={getImageSrc(selectedImage)}
          alt={productName || 'Product Image'}
          fill
          className="object-contain"
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 40vw, 500px"
          onError={handleImageError}
          unoptimized={getImageSrc(selectedImage).endsWith('.svg')}
        />
      </div>
      <div className="flex gap-3 overflow-x-auto p-2 w-full justify-center">
        {images.map((img, index) => (
          <button
            key={index}
            onClick={() => setSelectedImage(img)}
            className={`relative w-16 h-16 min-w-[2rem] rounded-lg overflow-hidden border-2 transition-all duration-200 ${
              selectedImage === img
                ? "border-[var(--primary)] ring-2 ring-[var(--primary)]"
                : "border-[var(--border)] hover:border-[var(--muted-foreground)]"
            }`}
          >
            <Image
              src={getImageSrc(img)}
              alt={`Thumbnail ${index + 1}`}
              fill
              className="object-cover"
              sizes="50px"
              onError={handleImageError}
              unoptimized={getImageSrc(img).endsWith('.svg')}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
