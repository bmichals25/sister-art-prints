'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AdminPanel } from './AdminPanel';

interface AdminContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const AdminContext = createContext<AdminContextType | null>(null);

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) throw new Error('useAdmin must be used within AdminProvider');
  return context;
}

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Option/Alt + F3 to toggle admin panel
      if (e.altKey && e.key === 'F3') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      // Escape to close
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <AdminContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
      {isOpen && <AdminPanel onClose={() => setIsOpen(false)} />}
    </AdminContext.Provider>
  );
}
