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

    // Light color variations for different cards
    const lightColors = [
        'from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20',
        'from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20',
        'from-yellow-50 to-lime-50 dark:from-yellow-900/20 dark:to-lime-900/20',
        'from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20',
        'from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20',
        'from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20',
        'from-violet-50 to-fuchsia-50 dark:from-violet-900/20 dark:to-fuchsia-900/20',
        'from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20'
    ];

    const lightBorders = [
        'border-rose-200 dark:border-rose-800',
        'border-orange-200 dark:border-orange-800',
        'border-yellow-200 dark:border-yellow-800',
        'border-emerald-200 dark:border-emerald-800',
        'border-cyan-200 dark:border-cyan-800',
        'border-indigo-200 dark:border-indigo-800',
        'border-violet-200 dark:border-violet-800',
        'border-pink-200 dark:border-pink-800'
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
                border-[0.5px] border-gray-300 dark:border-gray-600
                rounded-xl shadow-lg overflow-hidden 
                hover:shadow-2xl hover:scale-105 
                transition-all duration-300 ease-out
                group cursor-pointer
            `}
        >
            <div className="p-2 sm:p-5 bg-[var(--color-background)]">
                <Link href={`/products?category=${encodeURIComponent(id)}`}>
                    <div className="flex flex-col justify-between items-start mb-4">
                        <h3 className="text-sm sm:text-md md:text-lg font-bold poppins text-[var(--color-text-primary)] group-hover:text-sky-500 duration-300 transition-colors">
                            {title}
                        </h3>
                        <p className="text-sm text-[var(--color-text-secondary)] group-hover:text-sky-600 duration-300 transition-colors">
                            Total products <strong className="text-sky-500">{total_products}+</strong>
                        </p>
                    </div>
                </Link>
                
                {/* Responsive Grid - 2x2 on mobile, maintains aspect on larger screens */}
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    {images.slice(0, 3).map((img, index) => (
                        <div 
                            key={index} 
                            className="relative aspect-square rounded-lg overflow-hidden bg-white/50 dark:bg-gray-800/50 shadow-inner group-hover:shadow-md transition-shadow duration-300"
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
                                <div className="w-full h-full bg-gradient-to-br from-gray-100 via-gray-50 to-white dark:from-slate-700 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
                                    <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">No Image</span>
                                </div>
                            )}
                        </div>
                    ))}
                    
                    {/* Last image with overlay showing subcategory count */}
                    <div className="relative aspect-square rounded-lg overflow-hidden bg-white/50 dark:bg-gray-800/50 shadow-inner group-hover:shadow-md transition-shadow duration-300">
                        {images[3] && images[3] !== 'null' && images[3].trim() !== '' ? (
                            <Image
                                src={images[3]}
                                alt={`${title} 4`}
                                fill
                                className="object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                                sizes="(max-width: 640px) 120px, (max-width: 768px) 140px, 160px"
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-gray-100 via-gray-50 to-white dark:from-slate-700 dark:via-slate-800 dark:to-slate-900" />
                        )}
                        
                        {/* Overlay with subcategory count */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-end justify-end p-2 sm:p-3">
                            <div className="text-white font-bold text-xl sm:text-2xl raleway drop-shadow-lg bg-black/20 rounded-lg px-2 py-1 backdrop-blur-sm">
                                {sub_categories}+
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Bottom action area - appears on hover */}
                {/* <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-[var(--color-text-secondary)]">
                            {sub_categories} subcategories
                        </span>
                        <span className="text-sky-500 font-medium flex items-center">
                            View All
                            <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </span>
                    </div>
                </div> */}
            </div>
        </div>
    )
}

export default CategoryCard