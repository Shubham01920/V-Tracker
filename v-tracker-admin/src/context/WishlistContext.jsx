import React, { createContext, useContext, useState, useEffect } from 'react';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlistIds, setWishlistIds] = useState(() => {
    try {
      const saved = localStorage.getItem('vtracker_wishlist');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error reading wishlist from localStorage:', e);
    }
    // Default initial wishlist items for demo
    return ['VEH-001', 'VEH-004'];
  });

  const [readWishlistIds, setReadWishlistIds] = useState(() => {
    try {
      const saved = localStorage.getItem('vtracker_wishlist_read');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error reading read wishlist from localStorage:', e);
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('vtracker_wishlist', JSON.stringify(wishlistIds));
    } catch (e) {
      console.error('Error saving wishlist to localStorage:', e);
    }
  }, [wishlistIds]);

  useEffect(() => {
    try {
      localStorage.setItem('vtracker_wishlist_read', JSON.stringify(readWishlistIds));
    } catch (e) {
      console.error('Error saving read wishlist to localStorage:', e);
    }
  }, [readWishlistIds]);

  const toggleWishlist = (vehicleId) => {
    setWishlistIds((prev) => {
      if (prev.includes(vehicleId)) {
        // Also remove from read if removed
        setReadWishlistIds((readPrev) => readPrev.filter(id => id !== vehicleId));
        return prev.filter((id) => id !== vehicleId);
      } else {
        return [...prev, vehicleId];
      }
    });
  };

  const isWishlisted = (vehicleId) => {
    return wishlistIds.includes(vehicleId);
  };

  const clearWishlist = () => {
    setWishlistIds([]);
    setReadWishlistIds([]);
  };

  const markWishlistAsRead = () => {
    setReadWishlistIds([...wishlistIds]);
  };

  const unreadCount = wishlistIds.filter(id => !readWishlistIds.includes(id)).length;

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        toggleWishlist,
        isWishlisted,
        clearWishlist,
        wishlistCount: wishlistIds.length,
        unreadCount,
        markWishlistAsRead,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
