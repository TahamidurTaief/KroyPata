"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useAuth } from "@/app/contexts/AuthContext";
import { useCartContext } from "@/app/contexts/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import { useThemeAssets } from "@/app/hooks/useThemeAssets";

// Icons
import { CiSearch, CiUser, CiShoppingCart, CiShop } from "react-icons/ci";
import { IoMdMenu, IoIosArrowDown } from "react-icons/io";
import { RiHome2Line } from "react-icons/ri";
import { BsSun, BsMoon, BsQrCode } from "react-icons/bs";
import { FiLogOut } from "react-icons/fi";
import { IoBagCheckOutline, IoCameraOutline } from "react-icons/io5";

// Modals & Sidebars
import MobileMenuModal from "./Modals/MobileMenuModal";
import MobileSidebar from "./MobileSidebar";
import SearchDropdown from "./SearchDropdown";

// --- Sub-Components ---

const ThemeToggle = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="w-6 h-6 rounded-full bg-[var(--muted)] animate-pulse" />;

  const toggleTheme = () => {
    const currentTheme = resolvedTheme || theme || "dark";
    setTheme(currentTheme === "dark" ? "light" : "dark");
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-1.5 rounded-full hover:bg-[var(--muted)] transition-colors"
      aria-label="Toggle theme"
    >
      {resolvedTheme === "dark" ? (
        <BsMoon className="text-lg text-yellow-400" />
      ) : (
        <BsSun className="text-lg text-[var(--muted-foreground)]" />
      )}
    </button>
  );
};

const CategoryDropdown = ({ isOpen, categories, onClose }) => {
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [showSubcategories, setShowSubcategories] = useState(false);
  const hoverTimeoutRef = useRef(null);

  const handleCategoryHover = (category) => {
    // Clear any existing timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    
    if (category?.subcategories && category.subcategories.length > 0) {
      setHoveredCategory(category);
      setShowSubcategories(true);
    } else {
      // Delay hiding to prevent flickering
      hoverTimeoutRef.current = setTimeout(() => {
        setShowSubcategories(false);
        setHoveredCategory(null);
      }, 150);
    }
  };

  const handleMouseLeave = () => {
    // Add delay before closing to prevent flickering
    hoverTimeoutRef.current = setTimeout(() => {
      setShowSubcategories(false);
      setHoveredCategory(null);
    }, 200);
  };

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
  };

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="absolute top-full left-0 mt-2 bg-[var(--card)] border border-[var(--border)] shadow-xl rounded-lg z-50 max-h-[70vh] overflow-visible flex"
        >
          {/* Categories Column */}
          <div className="w-64 overflow-y-auto py-2 border-r border-[var(--border)]">
            {categories.length === 0 ? (
              <div className="px-4 py-2 text-sm text-[var(--muted-foreground)]">No categories found</div>
            ) : (
              <ul>
                {categories.map((cat, idx) => {
                  const hasSubcategories = cat.subcategories && cat.subcategories.length > 0;
                  const isHovered = hoveredCategory?.id === cat.id;
                  
                  return (
                    <li 
                      key={cat.id || idx}
                      onMouseEnter={() => handleCategoryHover(cat)}
                    >
                      <Link
                        href={`/categories?category=${encodeURIComponent(cat.slug || cat.name)}`}
                        className={`px-4 py-2.5 text-sm transition-colors text-[var(--foreground)] flex items-center justify-between gap-3 group ${
                          isHovered ? 'bg-[var(--muted)]' : 'hover:bg-[var(--muted)]'
                        }`}
                        onClick={onClose}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          {cat.image_url || cat.image ? (
                            <Image src={cat.image_url || cat.image} width={20} height={20} alt={cat.name} className="rounded-full object-cover w-5 h-5" />
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-[var(--muted)]" />
                          )}
                          <span className="flex-1">{cat.name}</span>
                        </div>
                        {hasSubcategories && (
                          <IoIosArrowDown size={14} className="transform -rotate-90 text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] transition-colors" />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Subcategories Panel - Shows on hover */}
          <AnimatePresence>
            {showSubcategories && hoveredCategory && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                className="w-64 overflow-y-auto py-2 px-2"
              >
                <div className="px-3 py-2 mb-2 border-b border-[var(--border)]">
                  <p className="text-xs text-[var(--muted-foreground)] uppercase tracking-wide font-medium">
                    {hoveredCategory.name}
                  </p>
                </div>
                {hoveredCategory.subcategories.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-[var(--muted-foreground)]">No subcategories</div>
                ) : (
                  <div className="space-y-1">
                    {hoveredCategory.subcategories.map((sub, idx) => (
                      <Link
                        key={sub.id || idx}
                        href={`/categories?category=${encodeURIComponent(hoveredCategory.slug || hoveredCategory.name)}&subcategory=${encodeURIComponent(sub.slug || sub.name)}`}
                        className="px-3 py-2 text-sm hover:bg-[var(--muted)] rounded-md transition-colors text-[var(--foreground)] flex items-center gap-2"
                        onClick={onClose}
                      >
                        {sub.image_url || sub.image ? (
                          <Image src={sub.image_url || sub.image} width={16} height={16} alt={sub.name} className="rounded object-cover w-4 h-4" />
                        ) : (
                          <div className="w-1 h-1 rounded-full bg-[var(--muted-foreground)]" />
                        )}
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default function NavbarClient({ initialCategories = [], initialOfferCategories = [] }) {
  const { openAuthModal, user, isAuthenticated, logout } = useAuth();
  const { cartCount, mounted: cartMounted } = useCartContext();
  const { logoSrc, mounted } = useThemeAssets();
  const pathname = usePathname();
  
  // UI States
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Menus
  const [allCatsOpen, setAllCatsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  
  // Refs for clicking outside and hover delays
  const catsRef = useRef(null);
  const userRef = useRef(null);
  const categoryHoverTimeout = useRef(null);

  // Scroll Listener
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Click Outside Handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (catsRef.current && !catsRef.current.contains(event.target)) setAllCatsOpen(false);
      if (userRef.current && !userRef.current.contains(event.target)) setUserDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);



  // Helper to determine User Label logic
  const getUserLabel = () => {
    if (!isAuthenticated || !user) return "Welcome";
    if (user.user_type === 'WHOLESALER' || user.user_type === 'Wholesaler' || user.wholesaler_status === 'APPROVED') {
        return "Wholesaler";
    }
    return "Customer";
  };

  const isWholesaler = isAuthenticated && user && (user.user_type === 'WHOLESALER' || user.user_type === 'Wholesaler' || user.wholesaler_status === 'APPROVED');

  // State for responsive special offers handling
  const [visibleOffers, setVisibleOffers] = useState([]);
  const [overflowOffers, setOverflowOffers] = useState([]);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const navContainerRef = useRef(null);
  const moreDropdownRef = useRef(null);
  const offerLinksRef = useRef([]);

  // Calculate visible and overflow offers based on actual rendered widths
  useEffect(() => {
    if (!initialOfferCategories || initialOfferCategories.length === 0) {
      setVisibleOffers([]);
      setOverflowOffers([]);
      return;
    }

    // Initially show all offers to measure them
    setVisibleOffers(initialOfferCategories);
    setOverflowOffers([]);

    const calculateVisibleOffers = () => {
      const container = navContainerRef.current;
      if (!container) return;

      const containerWidth = container.offsetWidth;
      const allCatsButton = catsRef.current;
      const allCatsButtonWidth = allCatsButton ? allCatsButton.offsetWidth : 180;
      const moreButtonWidth = 120; // Reserve space for "More" button
      const gap = 24; // gap-6 = 24px
      const padding = 32; // Container padding
      
      let availableWidth = containerWidth - allCatsButtonWidth - moreButtonWidth - padding - (gap * 2);
      let currentWidth = 0;
      let visibleCount = 0;

      // Calculate based on actual offer link widths if they're rendered
      if (offerLinksRef.current && offerLinksRef.current.length > 0) {
        for (let i = 0; i < offerLinksRef.current.length; i++) {
          const linkElement = offerLinksRef.current[i];
          if (!linkElement) continue;
          
          const linkWidth = linkElement.offsetWidth + gap;
          
          if (currentWidth + linkWidth <= availableWidth) {
            currentWidth += linkWidth;
            visibleCount++;
          } else {
            break;
          }
        }
      } else {
        // Fallback to estimation if refs not available
        for (let i = 0; i < initialOfferCategories.length; i++) {
          const offer = initialOfferCategories[i];
          const estimatedWidth = (offer.title?.length || 10) * 8 + 40 + gap;
          
          if (currentWidth + estimatedWidth <= availableWidth) {
            currentWidth += estimatedWidth;
            visibleCount++;
          } else {
            break;
          }
        }
      }

      // Show at most 4 visible offers on desktop to prevent overcrowding
      visibleCount = Math.min(visibleCount, 4);
      
      // Ensure at least 1 offer is visible if space permits
      if (visibleCount < 1 && initialOfferCategories.length >= 1 && containerWidth > 400) {
        visibleCount = 1;
      }

      // Only update if counts actually changed to prevent infinite loops
      const newVisibleOffers = initialOfferCategories.slice(0, visibleCount);
      const newOverflowOffers = initialOfferCategories.slice(visibleCount);
      
      setVisibleOffers(prev => {
        if (JSON.stringify(prev) !== JSON.stringify(newVisibleOffers)) {
          return newVisibleOffers;
        }
        return prev;
      });
      
      setOverflowOffers(prev => {
        if (JSON.stringify(prev) !== JSON.stringify(newOverflowOffers)) {
          return newOverflowOffers;
        }
        return prev;
      });
    };

    // Delay calculation to ensure DOM is fully rendered
    const timeoutId = setTimeout(calculateVisibleOffers, 100);
    
    window.addEventListener('resize', calculateVisibleOffers);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', calculateVisibleOffers);
    };
  }, [initialOfferCategories]);

  // Click outside for More dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (moreDropdownRef.current && !moreDropdownRef.current.contains(event.target)) {
        setMoreDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!mounted) return null;

  return (
    <>
      {/* ==================== DESKTOP HEADER ==================== */}
      <header className="hidden lg:block w-full bg-[var(--card)] z-50 border-b border-[var(--border)]">
        
        {/* TOP ROW */}
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-6">
          
          {/* 1. Logo */}
          <Link href="/" className="flex-shrink-0 mr-4">
            <Image
              src={logoSrc || "/img/logo_light.svg"}
              alt="Logo"
              width={140}
              height={40}
              className="h-10 w-auto object-contain"
              priority
              unoptimized
            />
          </Link>

          {/* 2. Search Bar with Dropdown Suggestions */}
          <div className="flex-1 max-w-3xl">
            <SearchDropdown 
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onClose={() => setSearchQuery("")}
              placeholder="Search for products..."
            />
          </div>

          {/* 3. Right Actions */}
          <div className="flex items-center gap-6 flex-shrink-0">
            
            {/* App Download */}
            <div className="flex items-center gap-2 cursor-pointer hover:opacity-80">
              <BsQrCode size={20} className="text-[var(--foreground)]" />
              <div className="text-xs leading-tight hidden xl:block">
                <p className="text-[var(--muted-foreground)]">Download the</p>
                <p className="font-bold text-[var(--foreground)]">China Kroy App</p>
              </div>
            </div>

            {/* SHOP ICON (Replaced Flag) */}
            <Link href="/products" className="flex items-center gap-2 cursor-pointer group">
              <CiShop size={28} className="text-[var(--foreground)]" />
              <div className="text-xs leading-tight group-hover:opacity-80 transition-opacity">
                <p className="text-[var(--muted-foreground)]">Browse</p>
                <p className="font-bold text-[var(--foreground)]">Shop</p>
              </div>
            </Link>

            {/* User Account Section - Updated Logic */}
            {isAuthenticated ? (
              <div 
                className="flex items-center gap-2 cursor-pointer relative group"
                ref={userRef}
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              >
                <CiUser size={28} className="text-[var(--foreground)]" />
                <div className="text-xs leading-tight group-hover:opacity-80 transition-opacity">
                  {/* Label: Welcome / Customer / Wholesaler */}
                  <p className={`${isWholesaler ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-[var(--muted-foreground)]'}`}>
                      {getUserLabel()}
                  </p>
                  
                  {/* Name or Login Action */}
                  <p className="font-bold text-[var(--foreground)] whitespace-nowrap">
                    {user.name?.split(' ')[0] || 'User'}
                  </p>
                </div>
              
                {/* User Dropdown (Only when logged in) */}
                <AnimatePresence>
                  {userDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full right-0 mt-4 w-48 bg-[var(--card)] border border-[var(--border)] shadow-xl rounded-lg p-2 z-50"
                    >
                      <div className="px-3 py-2 border-b border-[var(--border)] mb-1">
                          <p className="text-xs text-[var(--muted-foreground)]">Signed in as</p>
                          <p className="text-sm font-bold truncate">{user?.name}</p>
                      </div>
                      <Link href="/orders" className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--muted)] rounded-md text-[var(--foreground)]" onClick={() => setUserDropdownOpen(false)}>
                         <IoBagCheckOutline /> My Orders
                      </Link>
                      <button 
                        onClick={() => {
                          logout();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-red-50 text-red-500 rounded-md"
                      >
                        <FiLogOut /> Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link href="/login" className="flex items-center gap-2 cursor-pointer group">
                <CiUser size={28} className="text-[var(--foreground)]" />
                <div className="text-xs leading-tight group-hover:opacity-80 transition-opacity">
                  <p className="text-[var(--muted-foreground)]">Welcome</p>
                  <p className="font-bold text-[var(--foreground)] whitespace-nowrap">Sign in / Register</p>
                </div>
              </Link>
            )}

            {/* Cart */}
            <Link href="/cart" className="flex items-center gap-2 cursor-pointer relative group">
              <div className="relative">
                <CiShoppingCart size={30} className="text-[var(--foreground)]" />
                {cartMounted && cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-[var(--card)]">
                    {cartCount}
                  </span>
                )}
              </div>
              <div className="flex flex-col text-xs group-hover:opacity-80 transition-opacity">
                 <span className="font-bold text-[var(--foreground)]">Cart</span>
              </div>
            </Link>
            
            {/* Theme Toggle */}
            <ThemeToggle />

          </div>
        </div>

        {/* BOTTOM ROW */}
        <div className="border-t border-[var(--border)]">
          <div ref={navContainerRef} className="container mx-auto px-4 flex items-center h-12 gap-6">
            
            {/* All Categories Pill Button - Hover Activated */}
            <div 
              className="relative" 
              ref={catsRef}
              onMouseEnter={() => {
                if (categoryHoverTimeout.current) {
                  clearTimeout(categoryHoverTimeout.current);
                }
                setAllCatsOpen(true);
              }}
              onMouseLeave={() => {
                categoryHoverTimeout.current = setTimeout(() => {
                  setAllCatsOpen(false);
                }, 200);
              }}
            >
              <button 
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full transition-colors ${allCatsOpen ? 'bg-black text-white' : 'bg-[var(--muted)] hover:bg-[var(--muted)]/80 text-[var(--foreground)]'}`}
              >
                <IoMdMenu size={20} />
                <span className="text-sm font-medium">All Categories</span>
                <IoIosArrowDown size={14} className={`transition-transform ${allCatsOpen ? 'rotate-180' : ''}`} />
              </button>

              <CategoryDropdown 
                isOpen={allCatsOpen} 
                categories={initialCategories} 
                onClose={() => setAllCatsOpen(false)} 
              />
            </div>

            {/* Special Offers - Simple Text Buttons */}
            <nav className="flex-1 flex items-center justify-end gap-6">
              {visibleOffers.map((offer, idx) => (
                <Link
                  key={offer.id}
                  ref={(el) => {
                    if (el) offerLinksRef.current[idx] = el;
                  }}
                  href={offer.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-sm font-medium transition-all duration-200 flex items-center gap-2 whitespace-nowrap group ${
                    offer.badge_text 
                      ? 'text-red-600 dark:text-red-500 hover:text-red-700 dark:hover:text-red-400' 
                      : 'text-[var(--foreground)] hover:text-[var(--muted-foreground)]'
                  }`}
                >
                  {/* Icon */}
                  {offer.icon_class && <i className={offer.icon_class} />}
                  
                  {/* Title */}
                  <span className="relative">
                    {offer.title}
                    {/* Underline on hover */}
                    <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-current transition-all duration-200 group-hover:w-full" />
                  </span>
                  
                  {/* Badge */}
                  {offer.badge_text && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 uppercase font-bold tracking-wider">
                      {offer.badge_text}
                    </span>
                  )}
                </Link>
              ))}
              
              {/* More Dropdown - Simplified */}
              {overflowOffers.length > 0 && (
                <div className="relative" ref={moreDropdownRef}>
                  <button
                    onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                    className="flex items-center gap-1 text-sm font-medium text-[var(--foreground)] hover:text-[var(--muted-foreground)] transition-colors"
                  >
                    More 
                    <IoIosArrowDown className={`transition-transform duration-300 ${moreDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {moreDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full right-0 mt-2 w-64 bg-[var(--card)] border border-[var(--border)] shadow-xl rounded-lg z-50 max-h-[70vh] overflow-y-auto py-2"
                      >
                        {overflowOffers.map((offer, idx) => (
                          <Link
                            key={offer.id}
                            href={offer.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block px-4 py-2.5 text-sm hover:bg-[var(--muted)] transition-colors text-[var(--foreground)]"
                            onClick={() => setMoreDropdownOpen(false)}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                {offer.icon_class && <i className={offer.icon_class} />}
                                <span className="font-medium">{offer.title}</span>
                              </div>
                              {offer.badge_text && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 uppercase font-bold">
                                  {offer.badge_text}
                                </span>
                              )}
                            </div>
                            {offer.description && (
                              <p className="text-xs text-[var(--muted-foreground)] mt-1 line-clamp-1">
                                {offer.description}
                              </p>
                            )}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </nav>

          </div>
        </div>
      </header>

      {/* ==================== MOBILE HEADER ==================== */}
      <header className={`lg:hidden sticky top-0 z-50 bg-[var(--card)] transition-all duration-200 ${isScrolled ? 'shadow-md' : ''}`}>
        <div className="px-4 py-3 flex items-center justify-between gap-4">
          
          {/* Mobile Hamburger */}
          <button 
            onClick={() => setMobileSidebarOpen(true)}
            className="p-2 -ml-2 text-[var(--foreground)]"
          >
            <IoMdMenu size={26} />
          </button>

          {/* Mobile Search Input */}
          <div className="flex-1">
            <SearchDropdown 
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onClose={() => setSearchQuery("")}
              placeholder="Search products..."
            />
          </div>

          {/* Mobile Cart */}
          <Link href="/cart" className="relative p-2 -mr-2">
             <CiShoppingCart size={26} className="text-[var(--foreground)]" />
             {cartMounted && cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
             )}
          </Link>
        </div>
        
        {/* Mobile Special Offers Scroll - Simple Text Buttons */}
        <div className="flex items-center gap-4 px-4 pb-2 overflow-x-auto scrollbar-hide">
           {initialOfferCategories.length > 0 ? (
             initialOfferCategories.slice(0, 8).map((offer, idx) => (
               <Link 
                 key={offer.id}
                 href={offer.link} 
                 target="_blank"
                 rel="noopener noreferrer"
                 className={`flex-shrink-0 text-xs font-medium flex items-center gap-1.5 transition-colors ${
                   offer.badge_text 
                     ? 'text-red-600 dark:text-red-500' 
                     : 'text-[var(--foreground)]'
                 }`}
               >
                 {offer.icon_class && <i className={offer.icon_class} style={{ fontSize: '11px' }} />}
                 <span className="whitespace-nowrap">{offer.title}</span>
                 {offer.badge_text && (
                   <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 uppercase font-bold tracking-wider">
                     {offer.badge_text}
                   </span>
                 )}
               </Link>
             ))
           ) : (
             initialCategories.slice(0, 6).map((cat, i) => (
               <Link key={i} href={`/categories?category=${cat.slug}`} className="flex-shrink-0 text-xs text-[var(--foreground)] font-medium whitespace-nowrap">
                 {cat.name}
               </Link>
             ))
           )}
        </div>
      </header>

      {/* ==================== OVERLAYS / MODALS ==================== */}
      
      {/* Mobile Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
         <div className="bg-[var(--card)] border-t border-[var(--border)] pb-safe pt-2 px-6 flex justify-between items-end shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
            <Link href="/" className={`flex flex-col items-center gap-1 p-2 ${pathname === '/' ? 'text-red-500' : 'text-[var(--muted-foreground)]'}`}>
               <RiHome2Line size={24} />
               <span className="text-[10px] font-medium">Home</span>
            </Link>
            <Link href="/categories" className={`flex flex-col items-center gap-1 p-2 ${pathname === '/categories' ? 'text-red-500' : 'text-[var(--muted-foreground)]'}`}>
               <IoMdMenu size={24} />
               <span className="text-[10px] font-medium">Category</span>
            </Link>
            <Link href="/cart" className={`flex flex-col items-center gap-1 p-2 ${pathname === '/cart' ? 'text-red-500' : 'text-[var(--muted-foreground)]'}`}>
               <div className="relative">
                  <CiShoppingCart size={24} />
                  {cartMounted && cartCount > 0 && (
                     <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] rounded-full w-3.5 h-3.5 flex items-center justify-center">{cartCount}</span>
                  )}
               </div>
               <span className="text-[10px] font-medium">Cart</span>
            </Link>
            {isAuthenticated ? (
              <div 
                onClick={() => setMobileMenuOpen(true)}
                className={`flex flex-col items-center gap-1 p-2 cursor-pointer ${mobileMenuOpen ? 'text-red-500' : 'text-[var(--muted-foreground)]'}`}
              >
                <CiUser size={24} />
                <span className="text-[10px] font-medium">Account</span>
              </div>
            ) : (
              <Link 
                href="/login"
                className={`flex flex-col items-center gap-1 p-2 ${pathname === '/login' || pathname === '/signup' ? 'text-red-500' : 'text-[var(--muted-foreground)]'}`}
              >
                <CiUser size={24} />
                <span className="text-[10px] font-medium">Account</span>
              </Link>
            )}
         </div>
      </div>

      {/* Mobile Sidebar */}
      <MobileSidebar 
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
        categories={initialCategories}
      />

      {/* Mobile Account Menu Modal */}
      <MobileMenuModal
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        isAuthenticated={isAuthenticated}
        user={user}
        openAuthModal={openAuthModal}
        logout={logout}
        categories={initialCategories}
        offerCategories={initialOfferCategories}
      />

    </>
  );
}