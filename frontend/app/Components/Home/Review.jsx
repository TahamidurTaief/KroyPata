'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// --- DUMMY DATA ---
const testimonials = [
  {
    quote: "This is the best purchase I've ever made. The quality is outstanding, and the customer service was exceptional. I highly recommend this to everyone!",
    name: "Sarah Johnson",
    title: "Fashion Blogger",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=2574&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    quote: "Absolutely in love with the new collection! The designs are modern, chic, and incredibly comfortable. It's rare to find a brand that gets everything right.",
    name: "Michael Chen",
    title: "Creative Director",
    image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=2662&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    quote: "From the packaging to the product itself, everything was perfect. You can tell a lot of thought and care went into it. I'm already planning my next order.",
    name: "Jessica Williams",
    title: "Marketing Manager",
    image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=2574&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    quote: "I was skeptical at first, but this product exceeded all my expectations. The fit is perfect, and the material feels luxurious. A true game-changer in my wardrobe.",
    name: "David Rodriguez",
    title: "Tech Entrepreneur",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=2574&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    quote: "Pagedone is simply the best tool of investment in the market right now.",
    name: "Jane D",
    title: "CEO",
    image: "https://pagedone.io/asset/uploads/1696229969.png",
  },
  {
    quote: "I was hesitant to try pagedone at first, but I'm so glad I did - it's exceeded all of my expectations.",
    name: "Harsh P.",
    title: "Product Designer",
    image: "https://pagedone.io/asset/uploads/1696229994.png",
  },
  {
    quote: "Pagedone stands out as the most user-friendly and effective solution I've ever used.",
    name: "Alex K.",
    title: "Design Lead",
    image: "https://pagedone.io/asset/uploads/1696230027.png",
  },
];

// Star rating component
const StarRating = ({ className = "" }) => (
  <div className={`flex items-center mb-9 gap-2 transition-all duration-500 ${className}`} style={{ color: 'var(--color-accent-orange)' }}>
    {[...Array(5)].map((_, i) => (
      <svg key={i} className="w-5 h-5" viewBox="0 0 18 17" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M8.10326 1.31699C8.47008 0.57374 9.52992 0.57374 9.89674 1.31699L11.7063 4.98347C11.8519 5.27862 12.1335 5.48319 12.4592 5.53051L16.5054 6.11846C17.3256 6.23765 17.6531 7.24562 17.0596 7.82416L14.1318 10.6781C13.8961 10.9079 13.7885 11.2389 13.8442 11.5632L14.5353 15.5931C14.6754 16.41 13.818 17.033 13.0844 16.6473L9.46534 14.7446C9.17402 14.5915 8.82598 14.5915 8.53466 14.7446L4.91562 16.6473C4.18199 17.033 3.32456 16.41 3.46467 15.5931L4.15585 11.5632C4.21148 11.2389 4.10393 10.9079 3.86825 10.6781L0.940384 7.82416C0.346867 7.24562 0.674378 6.23765 1.4946 6.11846L5.54081 5.53051C5.86652 5.48319 6.14808 5.27862 6.29374 4.98347L8.10326 1.31699Z"
          fill="currentColor"
        />
      </svg>
    ))}
  </div>
);

// --- MAIN COMPONENT ---
export default function TestimonialCarousel() {
  return (
    <>
      {/* Swiper Styles */}
      <style jsx>{`
        .swiper-button-prev:after,
        .swiper-rtl .swiper-button-next:after {
          content: '' !important;
        }

        .swiper-button-next:after,
        .swiper-rtl .swiper-button-prev:after {
          content: '' !important;
        }

        .swiper-button-next svg,
        .swiper-button-prev svg {
          width: 24px !important;
          height: 24px !important;
        }

        .swiper-button-next,
        .swiper-button-prev {
          position: relative !important;
        }

        .swiper-slide.swiper-slide-active {
          --tw-border-opacity: 1 !important;
          border-color: var(--primary) !important;
        }

        .swiper-slide.swiper-slide-active > .swiper-slide-active\\:text-indigo-600 {
          --tw-text-opacity: 1;
          color: var(--primary);
        }

        .swiper-slide.swiper-slide-active > .flex .grid .swiper-slide-active\\:text-indigo-600 {
          --tw-text-opacity: 1;
          color: var(--primary);
        }

        /* Testimonial card hover effects */
        .testimonial-card:hover {
          border-color: var(--primary) !important;
        }

        .testimonial-card:hover .testimonial-text {
          color: var(--foreground) !important;
        }

        .testimonial-card:hover .testimonial-name {
          color: var(--primary) !important;
        }

        .group:hover .group-hover\\:text-blue-600 {
          color: var(--primary) !important;
        }

        /* Active slide styling */
        .swiper-slide-active .testimonial-card {
          border-color: var(--primary) !important;
        }

        .swiper-slide-active .testimonial-name {
          color: var(--primary) !important;
        }
      `}</style>

      <section className="container mx-auto" style={{ backgroundColor: 'var(--background)' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-14 flex flex-col justify-center items-center sm:flex-row sm:items-center sm:justify-between max-sm:gap-8">
            <h2 className="text-4xl text-center font-bold lg:text-left" style={{ color: 'var(--foreground)' }}>Reviews</h2>
            {/* Slider controls */}
            <div className="flex items-center gap-8">
              <button
                id="slider-button-left"
                className="swiper-button-prev group flex justify-center items-center border border-solid w-12 h-12 transition-all duration-500 rounded-full"
                style={{ 
                  borderColor: 'var(--primary)',
                  color: 'var(--primary)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'var(--primary)';
                  e.target.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = 'var(--primary)';
                }}
              >
                <svg className="h-6 w-6 transition-colors duration-300" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M20.9999 12L4.99992 12M9.99992 6L4.70703 11.2929C4.3737 11.6262 4.20703 11.7929 4.20703 12C4.20703 12.2071 4.3737 12.3738 4.70703 12.7071L9.99992 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <button
                id="slider-button-right"
                className="swiper-button-next group flex justify-center items-center border border-solid w-12 h-12 transition-all duration-500 rounded-full"
                style={{ 
                  borderColor: 'var(--primary)',
                  color: 'var(--primary)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'var(--primary)';
                  e.target.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = 'var(--primary)';
                }}
              >
                <svg className="h-6 w-6 transition-colors duration-300" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M3 12L19 12M14 18L19.2929 12.7071C19.6262 12.3738 19.7929 12.2071 19.7929 12C19.7929 11.7929 19.6262 11.6262 19.2929 11.2929L14 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Swiper Container */}
          <div className="lg:flex grid grid-cols-1 md:grid-cols-2 justify-center items-center gap-8">
            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              slidesPerView={3}
              spaceBetween={28}
              centeredSlides={true}
              loop={true}
              autoplay={{
                delay: 5000,
                disableOnInteraction: false,
              }}
              navigation={{
                nextEl: ".swiper-button-next",
                prevEl: ".swiper-button-prev",
              }}
              breakpoints={{
                0: {
                  slidesPerView: 1,
                  spaceBetween: 20,
                  centeredSlides: false,
                },
                768: {
                  slidesPerView: 2,
                  spaceBetween: 28,
                  centeredSlides: true,
                },
                1024: {
                  slidesPerView: 3,
                  spaceBetween: 32,
                },
              }}
              className="mySwiper"
            >
              {testimonials.map((testimonial, index) => (
                <SwiperSlide key={index}>
                  <div 
                    className="group border border-solid h-auto rounded-2xl p-6 transition-all duration-500 w-full testimonial-card"
                    style={{ 
                      backgroundColor: 'var(--card)',
                      borderColor: 'var(--color-border)'
                    }}
                  >
                    <StarRating className="group-hover:text-blue-600" />
                    <p 
                      className="text-lg leading-8 h-24 transition-all duration-500 mb-9 testimonial-text"
                      style={{ color: 'var(--muted-foreground)' }}
                    >
                      {testimonial.quote}
                    </p>
                    <div className="flex items-center gap-5">
                      <div className="relative w-12 h-12 rounded-full overflow-hidden">
                        <Image 
                          src={testimonial.image} 
                          alt="avatar"
                          fill
                          className="object-cover"
                          sizes="48px"
                          onError={(e) => { 
                            e.target.src = 'https://placehold.co/48x48/1f2937/a78bfa?text=User'; 
                          }}
                        />
                      </div>
                      <div className="grid gap-1">
                        <h5 
                          className="font-medium transition-all duration-500 testimonial-name"
                          style={{ color: 'var(--foreground)' }}
                        >
                          {testimonial.name}
                        </h5>
                        <span 
                          className="text-sm leading-6"
                          style={{ color: 'var(--muted-foreground)' }}
                        >
                          {testimonial.title}
                        </span>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </section>
    </>
  );
}