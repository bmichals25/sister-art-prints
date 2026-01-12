'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AdminPanel } from './AdminPanel';
import { DesignDrawer } from './DesignDrawer';

interface AdminContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isDesignDrawerOpen: boolean;
  setIsDesignDrawerOpen: (open: boolean) => void;
  openDesignDrawer: () => void;
}

const AdminContext = createContext<AdminContextType | null>(null);

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) throw new Error('useAdmin must be used within AdminProvider');
  return context;
}

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDesignDrawerOpen, setIsDesignDrawerOpen] = useState(false);

  const openDesignDrawer = () => {
    setIsOpen(false); // Close main panel
    setIsDesignDrawerOpen(true); // Open design drawer
  };

  // Lock body scroll when admin panel is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Option/Alt + F3 to toggle admin panel
      if (e.altKey && e.key === 'F3') {
        e.preventDefault();
        if (isDesignDrawerOpen) {
          setIsDesignDrawerOpen(false);
        } else {
          setIsOpen((prev) => !prev);
        }
      }
      // Escape to close
      if (e.key === 'Escape') {
        if (isDesignDrawerOpen) {
          setIsDesignDrawerOpen(false);
        } else if (isOpen) {
          setIsOpen(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isDesignDrawerOpen]);

  return (
    <AdminContext.Provider value={{ isOpen, setIsOpen, isDesignDrawerOpen, setIsDesignDrawerOpen, openDesignDrawer }}>
      {children}
      {isOpen && <AdminPanel onClose={() => setIsOpen(false)} />}
      <DesignDrawer isOpen={isDesignDrawerOpen} onClose={() => setIsDesignDrawerOpen(false)} />
    </AdminContext.Provider>
  );
}
