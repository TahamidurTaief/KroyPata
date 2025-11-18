'use client';

import { useState, useEffect, useCallback } from 'react';

const useSearch = (initialQuery = '') => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load search history from localStorage on mount
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('search-history');
      if (savedHistory) {
        setSearchHistory(JSON.parse(savedHistory));
      }
    } catch (error) {
      console.error('Error loading search history:', error);
    }
  }, []);

  // Save search query to history
  const saveToHistory = useCallback((query) => {
    if (!query.trim() || query.length < 2) return;
    
    try {
      setSearchHistory(prev => {
        const newHistory = [query, ...prev.filter(item => item !== query)].slice(0, 10);
        localStorage.setItem('search-history', JSON.stringify(newHistory));
        return newHistory;
      });
    } catch (error) {
      console.error('Error saving search history:', error);
    }
  }, []);
  

  // Clear search history
  const clearHistory = useCallback(() => {
    try {
      setSearchHistory([]);
      localStorage.removeItem('search-history');
    } catch (error) {
      console.error('Error clearing search history:', error);
    }
  }, []);

  // Handle search input change
  const handleSearchChange = useCallback((query) => {
    setSearchQuery(query);
    
    // Open modal when user starts typing
    if (query.trim() && !isSearchModalOpen) {
      setIsSearchModalOpen(true);
    }
  }, [isSearchModalOpen]);

  // Handle search submit
  const handleSearchSubmit = useCallback((query = searchQuery) => {
    const trimmedQuery = query.trim();
    if (trimmedQuery) {
      saveToHistory(trimmedQuery);
      setIsSearchModalOpen(false);
      // Navigate to search results page
      window.location.href = `/search?q=${encodeURIComponent(trimmedQuery)}`;
    }
  }, [searchQuery, saveToHistory]);

  // Handle modal close
  const closeSearchModal = useCallback(() => {
    setIsSearchModalOpen(false);
  }, []);

  // Handle modal open
  const openSearchModal = useCallback(() => {
    setIsSearchModalOpen(true);
  }, []);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setDebouncedQuery('');
  }, []);

  // Handle search from history
  const searchFromHistory = useCallback((query) => {
    setSearchQuery(query);
    handleSearchSubmit(query);
  }, [handleSearchSubmit]);

  return {
    // State
    searchQuery,
    debouncedQuery,
    isSearchModalOpen,
    searchHistory,
    
    // Actions
    handleSearchChange,
    handleSearchSubmit,
    closeSearchModal,
    openSearchModal,
    clearSearch,
    clearHistory,
    searchFromHistory,
    
    // Utilities
    setSearchQuery,
    setIsSearchModalOpen
  };
};

export default useSearch;
