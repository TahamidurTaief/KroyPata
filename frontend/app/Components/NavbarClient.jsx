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
import SimpleSearchModal from "./Modals/SimpleSearchModal";
import MobileSidebar from "./MobileSidebar";

// --- Sub-Components ---

const ThemeToggle = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />;

  const toggleTheme = () => {
    const currentTheme = resolvedTheme || theme || "dark";
    setTheme(currentTheme === "dark" ? "light" : "dark");
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      aria-label="Toggle theme"
    >
      {resolvedTheme === "dark" ? (
        <BsMoon className="text-lg text-yellow-400" />
      ) : (
        <BsSun className="text-lg text-gray-600" />
      )}
    </button>
  );
};

const CategoryDropdown = ({ isOpen, categories, onClose }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className="absolute top-full left-0 mt-2 w-64 bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xl rounded-lg z-50 max-h-[70vh] overflow-y-auto py-2"
      >
        {categories.length === 0 ? (
          <div className="px-4 py-2 text-sm text-gray-500">No categories found</div>
        ) : (
          <ul>
            {categories.map((cat, idx) => (
              <li key={cat.id || idx}>
                <Link
                  href={`/products?category=${encodeURIComponent(cat.slug || cat.name)}`}
                  className="block px-4 py-2.5 text-sm hover:bg-[var(--color-muted-bg)] transition-colors text-[var(--color-text-primary)] flex items-center gap-3"
                  onClick={onClose}
                >
                  {cat.image_url || cat.image ? (
                     <Image src={cat.image_url || cat.image} width={20} height={20} alt={cat.name} className="rounded-full object-cover w-5 h-5" />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700" />
                  )}
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </motion.div>
    )}
  </AnimatePresence>
);

export default function NavbarClient({ initialCategories = [], initialOfferCategories = [] }) {
  const { openAuthModal, user, isAuthenticated, logout } = useAuth();
  const { cartCount, mounted: cartMounted } = useCartContext();
  const { logoSrc, mounted } = useThemeAssets();
  const pathname = usePathname();
  
  // UI States
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  
  // Menus
  const [allCatsOpen, setAllCatsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  
  // Refs for clicking outside
  const catsRef = useRef(null);
  const userRef = useRef(null);

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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if(searchQuery.trim()) setIsSearchModalOpen(true);
  };

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

  // Calculate visible and overflow offers based on container width
  useEffect(() => {
    if (!initialOfferCategories || initialOfferCategories.length === 0) {
      setVisibleOffers([]);
      setOverflowOffers([]);
      return;
    }

    const calculateVisibleOffers = () => {
      const container = navContainerRef.current;
      if (!container) return;

      const containerWidth = container.offsetWidth;
      const allCatsButtonWidth = 180; // Approximate width of "All Categories" button
      const moreButtonWidth = 100; // Approximate width of "More" button
      const padding = 50; // Extra padding for safety
      
      let availableWidth = containerWidth - allCatsButtonWidth - moreButtonWidth - padding;
      let currentWidth = 0;
      let visibleCount = 0;

      // Estimate each offer link width (approximate based on text length)
      for (let i = 0; i < initialOfferCategories.length; i++) {
        const offer = initialOfferCategories[i];
        const estimatedWidth = offer.title.length * 8 + 40; // rough estimation
        
        if (currentWidth + estimatedWidth <= availableWidth) {
          currentWidth += estimatedWidth;
          visibleCount++;
        } else {
          break;
        }
      }

      // Ensure at least 2 offers are visible if space permits
      if (visibleCount < 2 && initialOfferCategories.length >= 2 && containerWidth > 600) {
        visibleCount = 2;
      }

      setVisibleOffers(initialOfferCategories.slice(0, visibleCount));
      setOverflowOffers(initialOfferCategories.slice(visibleCount));
    };

    calculateVisibleOffers();
    window.addEventListener('resize', calculateVisibleOffers);
    return () => window.removeEventListener('resize', calculateVisibleOffers);
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
      <header className="hidden lg:block w-full bg-[var(--color-surface)] z-50 border-b border-[var(--color-border)]">
        
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
            />
          </Link>

          {/* 2. Search Bar (Modern Minimal Style) */}
          <div className="flex-1 max-w-3xl relative">
            <form onSubmit={handleSearchSubmit} className="relative">
              <div className="relative flex items-center border border-[var(--color-border)] rounded-full bg-[var(--color-muted-bg)] focus-within:bg-[var(--color-surface)] focus-within:border-[var(--color-text-secondary)] transition-all">
                <CiSearch 
                  size={20} 
                  className="absolute left-4 text-[var(--color-text-secondary)] pointer-events-none" 
                />
                <input 
                  type="text"
                  placeholder="Search for products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchModalOpen(true)}
                  className="w-full h-11 pl-11 pr-14 rounded-full bg-transparent text-sm outline-none placeholder:text-[var(--color-text-secondary)] text-[var(--color-text-primary)]"
                />
                <button 
                  type="submit"
                  className="absolute right-1 h-9 w-9 bg-[var(--color-text-primary)] hover:bg-[var(--color-text-secondary)] text-[var(--color-surface)] rounded-full flex items-center justify-center transition-all flex-shrink-0"
                >
                  <CiSearch size={20} strokeWidth={2} />
                </button>
              </div>
            </form>
          </div>

          {/* 3. Right Actions */}
          <div className="flex items-center gap-6 flex-shrink-0">
            
            {/* App Download */}
            <div className="flex items-center gap-2 cursor-pointer hover:opacity-80">
              <BsQrCode size={20} className="text-[var(--color-text-primary)]" />
              <div className="text-xs leading-tight hidden xl:block">
                <p className="text-[var(--color-text-secondary)]">Download the</p>
                <p className="font-bold text-[var(--color-text-primary)]">AliExpress app</p>
              </div>
            </div>

            {/* SHOP ICON (Replaced Flag) */}
            <Link href="/products" className="flex items-center gap-2 cursor-pointer hover:opacity-80">
              <CiShop size={28} className="text-[var(--color-text-primary)]" />
              <div className="text-xs leading-tight">
                <p className="text-[var(--color-text-secondary)]">Browse</p>
                <p className="font-bold text-[var(--color-text-primary)]">Shop</p>
              </div>
            </Link>

            {/* User Account Section - Updated Logic */}
            <div 
              className="flex items-center gap-2 cursor-pointer hover:opacity-80 relative"
              ref={userRef}
              onClick={() => {
                if (isAuthenticated) {
                    setUserDropdownOpen(!userDropdownOpen);
                } else {
                    openAuthModal('login');
                }
              }}
            >
              <CiUser size={28} className="text-[var(--color-text-primary)]" />
              <div className="text-xs leading-tight">
                {/* Label: Welcome / Customer / Wholesaler */}
                <p className={`${isWholesaler ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-[var(--color-text-secondary)]'}`}>
                    {getUserLabel()}
                </p>
                
                {/* Name or Login Action */}
                <p className="font-bold text-[var(--color-text-primary)] whitespace-nowrap">
                  {isAuthenticated && user ? (user.name?.split(' ')[0] || 'User') : 'Sign in / Register'}
                </p>
              </div>
              
              {/* User Dropdown (Only when logged in) */}
              <AnimatePresence>
                {userDropdownOpen && isAuthenticated && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full right-0 mt-4 w-48 bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xl rounded-lg p-2 z-50"
                  >
                    <div className="px-3 py-2 border-b border-[var(--color-border)] mb-1">
                        <p className="text-xs text-[var(--color-text-secondary)]">Signed in as</p>
                        <p className="text-sm font-bold truncate">{user?.name}</p>
                    </div>
                    <Link href="/orders" className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--color-muted-bg)] rounded-md text-[var(--color-text-primary)]" onClick={() => setUserDropdownOpen(false)}>
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

            {/* Cart */}
            <Link href="/cart" className="flex items-center gap-2 cursor-pointer hover:opacity-80 relative">
              <div className="relative">
                <CiShoppingCart size={30} className="text-[var(--color-text-primary)]" />
                {cartMounted && cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-[var(--color-surface)]">
                    {cartCount}
                  </span>
                )}
              </div>
              <div className="flex flex-col text-xs">
                 <span className="bg-black text-white px-1.5 rounded-full mb-0.5 text-[9px] w-fit">0</span>
                 <span className="font-bold text-[var(--color-text-primary)]">Cart</span>
              </div>
            </Link>
            
            {/* Theme Toggle */}
            <ThemeToggle />

          </div>
        </div>

        {/* BOTTOM ROW */}
        <div className="border-t border-[var(--color-border)]">
          <div ref={navContainerRef} className="container mx-auto px-4 flex items-center h-12 gap-6">
            
            {/* All Categories Pill Button */}
            <div className="relative" ref={catsRef}>
              <button 
                onClick={() => setAllCatsOpen(!allCatsOpen)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full transition-colors ${allCatsOpen ? 'bg-black text-white' : 'bg-[var(--color-muted-bg)] hover:bg-gray-300 dark:hover:bg-gray-700 text-[var(--color-text-primary)]'}`}
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

            {/* Special Offers - Dynamic from Backend */}
            <nav className="flex-1 flex items-center gap-6">
              {visibleOffers.map((offer) => (
                <Link
                  key={offer.id}
                  href={offer.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-sm whitespace-nowrap font-medium hover:opacity-80 transition-opacity flex items-center gap-2 ${
                    offer.badge_text ? 'text-red-600 font-bold' : 'text-[var(--color-text-primary)]'
                  }`}
                >
                  {offer.icon_class && <i className={offer.icon_class} />}
                  {offer.title}
                  {offer.badge_text && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full bg-${offer.badge_color || 'red'}-500 text-white uppercase font-bold`}>
                      {offer.badge_text}
                    </span>
                  )}
                </Link>
              ))}
              
              {/* More Dropdown - Only show if there are overflow offers */}
              {overflowOffers.length > 0 && (
                <div className="relative ml-auto" ref={moreDropdownRef}>
                  <button
                    onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                    className="flex items-center gap-1 text-sm font-medium text-[var(--color-text-primary)] cursor-pointer hover:opacity-80"
                  >
                    More <IoIosArrowDown className={`transition-transform ${moreDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {moreDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full right-0 mt-2 w-64 bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xl rounded-lg z-50 max-h-[70vh] overflow-y-auto py-2"
                      >
                        {overflowOffers.map((offer) => (
                          <Link
                            key={offer.id}
                            href={offer.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block px-4 py-2.5 text-sm hover:bg-[var(--color-muted-bg)] transition-colors text-[var(--color-text-primary)]"
                            onClick={() => setMoreDropdownOpen(false)}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                {offer.icon_class && <i className={offer.icon_class} />}
                                <span className="font-medium">{offer.title}</span>
                              </div>
                              {offer.badge_text && (
                                <span className={`text-[9px] px-1.5 py-0.5 rounded-full bg-${offer.badge_color || 'red'}-500 text-white uppercase font-bold`}>
                                  {offer.badge_text}
                                </span>
                              )}
                            </div>
                            {offer.description && (
                              <p className="text-xs text-[var(--color-text-secondary)] mt-1 line-clamp-1">
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
      <header className={`lg:hidden sticky top-0 z-50 bg-[var(--color-surface)] transition-all duration-200 ${isScrolled ? 'shadow-md' : ''}`}>
        <div className="px-4 py-3 flex items-center justify-between gap-4">
          
          {/* Mobile Hamburger */}
          <button 
            onClick={() => setMobileSidebarOpen(true)}
            className="p-2 -ml-2 text-[var(--color-text-primary)]"
          >
            <IoMdMenu size={26} />
          </button>

          {/* Mobile Search Input */}
          <div className="flex-1 relative" onClick={() => setIsSearchModalOpen(true)}>
             <div className="w-full h-10 bg-[var(--color-muted-bg)] border border-[var(--color-border)] rounded-full flex items-center px-4 text-sm text-[var(--color-text-secondary)] cursor-pointer hover:bg-[var(--color-surface)] hover:border-[var(--color-text-secondary)] transition-all">
                <CiSearch size={20} className="mr-2 flex-shrink-0" />
                <span className="flex-1 truncate">Search products...</span>
             </div>
          </div>

          {/* Mobile Cart */}
          <Link href="/cart" className="relative p-2 -mr-2">
             <CiShoppingCart size={26} className="text-[var(--color-text-primary)]" />
             {cartMounted && cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
             )}
          </Link>
        </div>
        
        {/* Mobile Categories Scroll - Now shows Special Offers */}
        <div className="flex items-center gap-3 px-4 pb-2 overflow-x-auto scrollbar-hide">
           {initialOfferCategories.length > 0 ? (
             initialOfferCategories.slice(0, 8).map((offer) => (
               <Link 
                 key={offer.id} 
                 href={offer.link} 
                 target="_blank"
                 rel="noopener noreferrer"
                 className="flex-shrink-0 text-xs bg-[var(--color-muted-bg)] px-3 py-1 rounded-full text-[var(--color-text-primary)] flex items-center gap-1.5"
               >
                 {offer.icon_class && <i className={offer.icon_class} style={{ fontSize: '10px' }} />}
                 <span className="whitespace-nowrap">{offer.title}</span>
                 {offer.badge_text && (
                   <span className={`text-[8px] px-1 py-0.5 rounded-full bg-${offer.badge_color || 'red'}-500 text-white uppercase font-bold`}>
                     {offer.badge_text}
                   </span>
                 )}
               </Link>
             ))
           ) : (
             initialCategories.slice(0, 6).map((cat, i) => (
               <Link key={i} href={`/products?category=${cat.slug}`} className="flex-shrink-0 text-xs bg-[var(--color-muted-bg)] px-3 py-1 rounded-full text-[var(--color-text-primary)]">
                 {cat.name}
               </Link>
             ))
           )}
        </div>
      </header>

      {/* ==================== OVERLAYS / MODALS ==================== */}
      
      {/* Mobile Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
         <div className="bg-[var(--color-surface)] border-t border-[var(--color-border)] pb-safe pt-2 px-6 flex justify-between items-end shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
            <Link href="/" className={`flex flex-col items-center gap-1 p-2 ${pathname === '/' ? 'text-red-500' : 'text-[var(--color-text-secondary)]'}`}>
               <RiHome2Line size={24} />
               <span className="text-[10px] font-medium">Home</span>
            </Link>
            <Link href="/categories" className={`flex flex-col items-center gap-1 p-2 ${pathname === '/categories' ? 'text-red-500' : 'text-[var(--color-text-secondary)]'}`}>
               <IoMdMenu size={24} />
               <span className="text-[10px] font-medium">Category</span>
            </Link>
            <Link href="/cart" className={`flex flex-col items-center gap-1 p-2 ${pathname === '/cart' ? 'text-red-500' : 'text-[var(--color-text-secondary)]'}`}>
               <div className="relative">
                  <CiShoppingCart size={24} />
                  {cartMounted && cartCount > 0 && (
                     <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] rounded-full w-3.5 h-3.5 flex items-center justify-center">{cartCount}</span>
                  )}
               </div>
               <span className="text-[10px] font-medium">Cart</span>
            </Link>
            <div 
               onClick={() => isAuthenticated ? setMobileMenuOpen(true) : openAuthModal('login')}
               className={`flex flex-col items-center gap-1 p-2 cursor-pointer ${mobileMenuOpen ? 'text-red-500' : 'text-[var(--color-text-secondary)]'}`}
            >
               <CiUser size={24} />
               <span className="text-[10px] font-medium">Account</span>
            </div>
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

      {/* Global Search Modal */}
      <SimpleSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
    </>
  );
}