"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useThemeAssets } from '@/app/hooks/useThemeAssets';
import { getFooterData, getCategories } from '@/app/lib/api';

// Helper components for icons remain the same
const SocialIcon = ({ href, 'aria-label': ariaLabel, children, hoverColorClass }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={ariaLabel}
    className={`text-[var(--color-text-secondary)] transition-all duration-300 hover:-translate-y-1 ${hoverColorClass}`}
  >
    {children}
  </a>
);

const FacebookIcon = () => (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" /></svg>
);
const XIcon = () => (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
);
const InstagramIcon = () => (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.85s-.011 3.584-.069 4.85c-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.584-.012-4.85-.07c-3.252-.148-4.771-1.691-4.919-4.919-.058-1.265-.069-1.645-.069-4.85s.011-3.584.069-4.85c.149-3.225 1.664-4.771 4.919-4.919C8.416 2.175 8.796 2.163 12 2.163zm0 1.802c-3.116 0-3.472.012-4.69.068-2.585.118-3.967 1.505-4.085 4.085-.056 1.218-.067 1.574-.067 4.69s.011 3.472.067 4.69c.118 2.583 1.5 3.967 4.085 4.085 1.218.056 1.574.067 4.69.067s3.472-.011 4.69-.067c2.583-.118 3.967-1.5 4.085-4.085.056-1.218.067-1.574.067-4.69s-.011-3.472-.067-4.69c-.118-2.583-1.5-3.967-4.085-4.085C15.472 3.977 15.116 3.965 12 3.965zM12 7.828a4.172 4.172 0 100 8.344 4.172 4.172 0 000-8.344zm0 6.666a2.494 2.494 0 110-4.988 2.494 2.494 0 010 4.988zm4.85-8.23a1.16 1.16 0 100-2.32 1.16 1.16 0 000 2.32z" /></svg>
);
const LinkedInIcon = () => (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
);

// CONVERT THE COMPONENT TO CLIENT-SIDE
export default function Footer() {
  const { logoSrc, mounted } = useThemeAssets();
  const [footerData, setFooterData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Main navigation links from navbar
  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Products", href: "/products" },
    { name: "Categories", href: "/categories" },
    { name: "Orders", href: "/orders" },
    { name: "Cart", href: "/cart" },
    { name: "Checkout", href: "/checkout" },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [footerResponse, categoriesResponse] = await Promise.all([
          getFooterData(),
          getCategories()
        ]);
        
        setFooterData(footerResponse);
        // Get top 4 categories (limit to 4 for footer)
        setCategories(categoriesResponse?.slice(0, 4) || []);
      } catch (error) {
        console.error('Error fetching footer data:', error);
        // Fallback to empty data
        setFooterData(null);
        setCategories([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Helper function to get services section from footer data
  const getServicesSection = () => {
    if (!footerData?.footer_sections) return null;
    return footerData.footer_sections.find(section => 
      section.section_type === 'services' || section.title.toLowerCase().includes('service')
    );
  };

  return (
    <footer className="bg-[var(--color-surface)] text-[var(--color-text-secondary)] font-sans">
      <div className="container mx-auto px-8 sm:px-12 pt-16 pb-8">
        <div className="grid lg:grid-cols-5 gap-x-8 gap-y-12">
          {/* Section 1: Logo Section */}
          <div className="max-w-sm">
            <Link href="/" aria-label="Back to Homepage">
              <Image 
                src={mounted ? logoSrc : '/img/logo_light.svg'} 
                alt="iCommerce logo" 
                width={144} 
                height={36}
                className="transition-opacity duration-300"
                priority 
              />
            </Link>
            <p className="mt-6 text-sm leading-relaxed">
              iCommerce is your one-stop destination for all your shopping needs, offering a wide range of products with the best deals and fastest delivery.
            </p>
            {/* Social Media Links from API */}
            <div className="mt-6 flex items-center space-x-5">
              {footerData?.social_media?.map((social) => {
                const IconComponent = getSocialIcon(social.platform);
                return IconComponent ? (
                  <SocialIcon 
                    key={social.id}
                    href={social.url} 
                    aria-label={`Follow us on ${social.platform}`} 
                    hoverColorClass={getSocialHoverColor(social.platform)}
                  >
                    <IconComponent />
                  </SocialIcon>
                ) : null;
              }) || (
                // Fallback social icons if no data from API
                <>
                  <SocialIcon href="https://x.com" aria-label="Follow us on X" hoverColorClass="hover:text-[var(--color-text-primary)]"><XIcon /></SocialIcon>
                  <SocialIcon href="https://facebook.com" aria-label="Follow us on Facebook" hoverColorClass="hover:text-blue-600"><FacebookIcon /></SocialIcon>
                  <SocialIcon href="https://instagram.com" aria-label="Follow us on Instagram" hoverColorClass="hover:text-pink-500"><InstagramIcon /></SocialIcon>
                  <SocialIcon href="https://linkedin.com" aria-label="Follow us on LinkedIn" hoverColorClass="hover:text-blue-500"><LinkedInIcon /></SocialIcon>
                </>
              )}
            </div>
          </div>

          {/* Section 2: Navigation Links from Navbar */}
          <div>
            <h4 className="text-base font-semibold text-[var(--color-text-primary)]">Navigation</h4>
            <ul className="mt-4 space-y-3">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="text-sm transition hover:text-[var(--color-text-primary)]"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Section 3: Services Section - Dynamic from Footer Links */}
          <div>
            {isLoading ? (
              <div className="animate-pulse">
                <div className="h-4 bg-[var(--color-border)] rounded w-24 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-3 bg-[var(--color-border)] rounded w-20"></div>
                  <div className="h-3 bg-[var(--color-border)] rounded w-16"></div>
                  <div className="h-3 bg-[var(--color-border)] rounded w-18"></div>
                </div>
              </div>
            ) : (
              (() => {
                const servicesSection = getServicesSection();
                return servicesSection ? (
                  <div>
                    <h4 className="text-base font-semibold text-[var(--color-text-primary)]">
                      {servicesSection.title}
                    </h4>
                    <ul className="mt-4 space-y-3">
                      {servicesSection.links?.map((link) => (
                        <li key={link.id}>
                          <Link 
                            href={link.url} 
                            className="text-sm transition hover:text-[var(--color-text-primary)]"
                            target={link.url.startsWith('http') ? '_blank' : '_self'}
                            rel={link.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                          >
                            {link.text}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  // Fallback services section
                  <div>
                    <h4 className="text-base font-semibold text-[var(--color-text-primary)]">Services</h4>
                    <ul className="mt-4 space-y-3">
                      <li><Link href="/support" className="text-sm transition hover:text-[var(--color-text-primary)]">Support</Link></li>
                      <li><Link href="/pricing" className="text-sm transition hover:text-[var(--color-text-primary)]">Pricing</Link></li>
                      <li><Link href="/contact" className="text-sm transition hover:text-[var(--color-text-primary)]">Contact</Link></li>
                      <li><Link href="/shipping" className="text-sm transition hover:text-[var(--color-text-primary)]">Shipping Info</Link></li>
                    </ul>
                  </div>
                );
              })()
            )}
          </div>

          {/* Section 4: Top 4 Categories (Dynamic) */}
          <div>
            <h4 className="text-base font-semibold text-[var(--color-text-primary)]">Top Categories</h4>
            <ul className="mt-4 space-y-3">
              {isLoading ? (
                // Loading skeleton
                Array.from({ length: 4 }).map((_, index) => (
                  <li key={index}>
                    <div className="animate-pulse h-3 bg-[var(--color-border)] rounded w-24"></div>
                  </li>
                ))
              ) : categories.length > 0 ? (
                categories.map((category) => (
                  <li key={category.id}>
                    <Link 
                      href={`/categories/${category.slug}`} 
                      className="text-sm transition hover:text-[var(--color-text-primary)]"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))
              ) : (
                // Fallback categories
                <>
                  <li><Link href="/categories/electronics" className="text-sm transition hover:text-[var(--color-text-primary)]">Electronics</Link></li>
                  <li><Link href="/categories/clothing" className="text-sm transition hover:text-[var(--color-text-primary)]">Clothing</Link></li>
                  <li><Link href="/categories/home-garden" className="text-sm transition hover:text-[var(--color-text-primary)]">Home & Garden</Link></li>
                  <li><Link href="/categories/sports" className="text-sm transition hover:text-[var(--color-text-primary)]">Sports</Link></li>
                </>
              )}
            </ul>
          </div>

          {/* Section 5: Pages Section */}
          <div>
            <h4 className="text-base font-semibold text-[var(--color-text-primary)]">Pages</h4>
            <ul className="mt-4 space-y-3">
              <li><Link href="/" className="text-sm transition hover:text-[var(--color-text-primary)]">Home</Link></li>
              <li><Link href="/Categories" className="text-sm transition hover:text-[var(--color-text-primary)]">Categories</Link></li>
              <li><Link href="/products" className="text-sm transition hover:text-[var(--color-text-primary)]">Shop</Link></li>
              <li><Link href="/orders" className="text-sm transition hover:text-[var(--color-text-primary)]">Orders</Link></li>
              <li><Link href="/privacy-policy" className="text-sm transition hover:text-[var(--color-text-primary)]">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright and Links */}
        <div className="mt-16 pt-6 border-t border-[var(--color-border)] flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-center sm:text-left">
            © {new Date().getFullYear()} icommerce. All rights reserved.
          </p>
          <div className="flex sm:justify-end space-x-6">
            <Link href="/sitemap" className="text-sm transition hover:text-[var(--color-text-primary)]">Sitemap</Link>
            <Link href="/faq" className="text-sm transition hover:text-[var(--color-text-primary)]">FAQ</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Helper functions for social icons
const getSocialIcon = (platform) => {
  const icons = {
    'facebook': FacebookIcon,
    'twitter': XIcon,
    'x': XIcon,
    'instagram': InstagramIcon,
    'linkedin': LinkedInIcon
  };
  return icons[platform?.toLowerCase()];
};

const getSocialHoverColor = (platform) => {
  const colors = {
    'facebook': 'hover:text-blue-600',
    'twitter': 'hover:text-[var(--color-text-primary)]',
    'x': 'hover:text-[var(--color-text-primary)]',
    'instagram': 'hover:text-pink-500',
    'linkedin': 'hover:text-blue-500'
  };
  return colors[platform?.toLowerCase()] || 'hover:text-[var(--color-text-primary)]';
};