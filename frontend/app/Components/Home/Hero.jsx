"use client";

import React, { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay, EffectFade } from "swiper/modules";
import { getHeroBanners } from "@/app/lib/api";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

const Hero = () => {
  const [mounted, setMounted] = useState(false);
  const [heroBanners, setHeroBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState({});

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchHeroBanners = async () => {
      try {
        setLoading(true);
        const data = await getHeroBanners();
        if (data && Array.isArray(data)) {
          setHeroBanners(data);
        } else if (data && data.results && Array.isArray(data.results)) {
          setHeroBanners(data.results);
        } else {
          setHeroBanners([]);
        }
      } catch (error) {
        console.error('❌ Failed to fetch hero banners:', error);
        setHeroBanners([]);
      } finally {
        setLoading(false);
      }
    };

    if (mounted) {
      fetchHeroBanners();
    }
  }, [mounted]);

  const getImageUrl = useCallback((banner) => {
    return banner.image_url_final || '/img/banner/banner_light.jpg';
  }, []);

  const handleImageError = useCallback((bannerId) => {
    setImageErrors(prev => ({
      ...prev,
      [bannerId]: true
    }));
  }, []);

  const createPlaceholderBanner = () => ({
    id: 'placeholder',
    image_url_final: '/img/banner/banner_light.jpg',
    autoplay_duration: 3000
  });

  if (!mounted || loading) {
    return (
      <section className="w-full">
        <div className="w-full max-w-[1920px] mx-auto" style={{ aspectRatio: '1920/600' }}>
          <div className="w-full h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse" />
        </div>
      </section>
    );
  }

  const bannersToShow = heroBanners.length > 0 ? heroBanners : [createPlaceholderBanner()];

  return (
    <section className="w-full">
      <div className="w-full max-w-[1920px] mx-auto" style={{ aspectRatio: '1920/600' }}>
        <Swiper
          modules={[Pagination, Autoplay, EffectFade]}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          pagination={{
            clickable: true,
            dynamicBullets: true,
            renderBullet: (index, className) => {
              return `<span class="${className} !bg-white/70 !w-3 !h-3"></span>`;
            }
          }}
          autoplay={{
            delay: bannersToShow[0]?.autoplay_duration || 3000,
            disableOnInteraction: false,
            pauseOnMouseEnter: false
          }}
          loop={bannersToShow.length > 1}
          speed={1000}
          className="h-full w-full"
          style={{
            "--swiper-pagination-bottom": "1rem",
            "--swiper-pagination-bullet-inactive-color": "rgba(255,255,255,0.5)",
            "--swiper-pagination-color": "#ffffff"
          }}
        >
          {bannersToShow.map((banner, index) => {
            const imageUrl = getImageUrl(banner);
            const hasError = imageErrors[banner.id];
            
            return (
              <SwiperSlide key={banner.id || index}>
                <div className="relative w-full h-full">
                  {!hasError && imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={`Hero Banner ${index + 1}`}
                      fill
                      className="object-cover"
                      priority={index === 0}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1920px"
                      quality={90}
                      onError={() => handleImageError(banner.id)}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700" />
                  )}
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </section>
  );
};

export default Hero;
