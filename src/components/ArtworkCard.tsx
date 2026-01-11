'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface Artwork {
  id: string;
  title: string;
  artist_name: string;
  image_url: string;
  price_base: number;
  featured: boolean;
}

interface ArtworkCardProps {
  artwork: Artwork;
  index: number;
  onEdit?: (artworkId: string) => void;
}

export function ArtworkCard({ artwork, index, onEdit }: ArtworkCardProps) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAdmin(!!session);
    }
    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAdmin(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div
      className="group artwork-card fade-in relative"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <Link href={`/artwork/${artwork.id}`}>
        <div className="aspect-[4/5] bg-gradient-to-br from-gray-50 to-gray-100 mb-5 overflow-hidden rounded-xl relative shadow-sm group-hover:shadow-xl transition-shadow duration-500">
          {artwork.image_url ? (
            <img
              src={artwork.image_url}
              alt={artwork.title}
              className="w-full h-full object-cover artwork-image"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#fff8f3] to-[#f5d4be]/20 flex items-center justify-center">
              <svg className="w-12 h-12 text-[#e8a87c]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          {artwork.featured && (
            <div className="absolute top-3 left-3 px-3 py-1.5 bg-white/95 backdrop-blur-sm text-xs font-medium text-[#d4846a] rounded-full shadow-sm">
              Featured
            </div>
          )}
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-lg font-medium text-gray-900 group-hover:text-[#d4846a] transition">
            {artwork.title}
          </h3>
          <p className="text-sm text-gray-500">{artwork.artist_name}</p>
          <p className="text-sm font-medium text-[#d4846a] pt-1">From ${artwork.price_base}</p>
        </div>
      </Link>

      {/* Admin Edit Button */}
      {isAdmin && onEdit && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onEdit(artwork.id);
          }}
          className="absolute top-3 right-3 p-2 bg-white/95 backdrop-blur-sm rounded-full shadow-lg hover:bg-gray-100 transition opacity-0 group-hover:opacity-100 z-10"
          title="Edit artwork"
        >
          <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
      )}
    </div>
  );
}
