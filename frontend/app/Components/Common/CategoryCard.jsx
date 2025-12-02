"use client";

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

const CategoryCard = ({ id, title, images = [], total_products = 0, sub_categories = 0 }) => {
    // Safety checks
    if (!id || !title) {
        console.warn('CategoryCard: Missing required props', { id, title });
        return null;
    }

    // Darker theme color variations
    const lightColors = [
        'from-rose-500/10 to-pink-500/10',
        'from-orange-500/10 to-amber-500/10',
        'from-yellow-500/10 to-lime-500/10',
        'from-emerald-500/10 to-teal-500/10',
        'from-cyan-500/10 to-blue-500/10',
        'from-indigo-500/10 to-purple-500/10',
        'from-violet-500/10 to-fuchsia-500/10',
        'from-pink-500/10 to-rose-500/10'
    ];

    const lightBorders = [
        'border-rose-500/20',
        'border-orange-500/20',
        'border-yellow-500/20',
        'border-emerald-500/20',
        'border-cyan-500/20',
        'border-indigo-500/20',
        'border-violet-500/20',
        'border-pink-500/20'
    ];

    // Use id to determine color (consistent for same category)
    const colorIndex = id % lightColors.length;
    const gradientClass = lightColors[colorIndex];
    const borderClass = lightBorders[colorIndex];

    return (
        <div 
            key={id} 
            className={`
                bg-gradient-to-br ${gradientClass} 
                border-[0.5px] ${borderClass}
                rounded-xl shadow-lg overflow-hidden 
                hover:shadow-2xl hover:scale-105 
                transition-all duration-300 ease-out
                group cursor-pointer
            `}
        >
            <div className="p-2 sm:p-5 bg-[var(--card)]">
                <Link href={`/products?category=${encodeURIComponent(id)}`}>
                    <div className="flex flex-col justify-between items-start mb-4">
                        <h3 className="text-sm sm:text-md md:text-lg font-bold poppins text-[var(--foreground)] group-hover:text-[var(--primary)] duration-300 transition-colors">
                            {title}
                        </h3>
                        <p className="text-sm text-[var(--muted-foreground)] group-hover:text-[var(--primary)] duration-300 transition-colors">
                            Total products <strong className="text-[var(--primary)]">{total_products}+</strong>
                        </p>
                    </div>
                </Link>
                
                {/* Responsive Grid - 2x2 on mobile, maintains aspect on larger screens */}
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    {images.slice(0, 3).map((img, index) => (
                        <div 
                            key={index} 
                            className="relative aspect-square rounded-lg overflow-hidden bg-[var(--muted)] shadow-inner group-hover:shadow-md transition-shadow duration-300"
                        >
                            {img && img !== 'null' && img.trim() !== '' ? (
                                <Image
                                    src={img}
                                    alt={`${title} ${index + 1}`}
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                                    sizes="(max-width: 640px) 120px, (max-width: 768px) 140px, 160px"
                                />
                            ) : (
                                <div className="w-full h-full bg-[var(--muted)] flex items-center justify-center">
                                    <span className="text-xs text-[var(--muted-foreground)] font-medium">No Image</span>
                                </div>
                            )}
                        </div>
                    ))}
                    
                    {/* Last image with overlay showing subcategory count */}
                    <div className="relative aspect-square rounded-lg overflow-hidden bg-[var(--muted)] shadow-inner group-hover:shadow-md transition-shadow duration-300">
                        {images[3] && images[3] !== 'null' && images[3].trim() !== '' ? (
                            <Image
                                src={images[3]}
                                alt={`${title} 4`}
                                fill
                                className="object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                                sizes="(max-width: 640px) 120px, (max-width: 768px) 140px, 160px"
                            />
                        ) : (
                            <div className="w-full h-full bg-[var(--muted)]" />
                        )}
                        
                        {/* Overlay with subcategory count */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-end justify-end p-2 sm:p-3">
                            <div className="text-white font-bold text-xl sm:text-2xl raleway drop-shadow-lg bg-black/20 rounded-lg px-2 py-1 backdrop-blur-sm">
                                {sub_categories}+
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CategoryCard