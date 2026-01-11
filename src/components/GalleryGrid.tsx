'use client';

import { useState, useEffect } from 'react';
import { ArtworkCard } from './ArtworkCard';
import { AdminPanel } from './AdminPanel';
import { supabase } from '@/lib/supabase';

interface Artwork {
  id: string;
  title: string;
  artist_name: string;
  image_url: string;
  price_base: number;
  featured: boolean;
}

interface GalleryGridProps {
  initialArtworks: Artwork[];
}

export function GalleryGrid({ initialArtworks }: GalleryGridProps) {
  const [artworks, setArtworks] = useState<Artwork[]>(initialArtworks);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [editingArtworkId, setEditingArtworkId] = useState<string | null>(null);

  useEffect(() => {
    // Listen for keyboard shortcut to open admin panel
    function handleKeyDown(e: KeyboardEvent) {
      if (e.altKey && e.key === 'F3') {
        e.preventDefault();
        setShowAdminPanel(true);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleEdit = (artworkId: string) => {
    setEditingArtworkId(artworkId);
    setShowAdminPanel(true);
  };

  const handleCloseAdmin = async () => {
    setShowAdminPanel(false);
    setEditingArtworkId(null);

    // Refresh artworks
    const { data } = await supabase
      .from('artworks')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setArtworks(data);
  };

  if (artworks.length === 0) {
    return (
      <>
        <div className="text-center py-32 relative">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-64 h-64 rounded-full bg-gradient-to-br from-[#e8a87c]/10 to-transparent blur-3xl" />
          </div>
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-[#fff8f3] to-[#f5d4be]/30 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg">
              <svg className="w-12 h-12 text-[#d4846a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-serif font-light text-gray-900 mb-3">No artworks yet</h3>
            <p className="text-gray-500 text-lg">The gallery is waiting for its first masterpiece</p>
          </div>
        </div>
        {showAdminPanel && <AdminPanel onClose={handleCloseAdmin} />}
      </>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
        {artworks.map((artwork, index) => (
          <ArtworkCard
            key={artwork.id}
            artwork={artwork}
            index={index}
            onEdit={handleEdit}
          />
        ))}
      </div>
      {showAdminPanel && <AdminPanel onClose={handleCloseAdmin} />}
    </>
  );
}
