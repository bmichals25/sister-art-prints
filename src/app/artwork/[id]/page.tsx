'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { use } from 'react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Print options with sizing - maps to Printful products
const printOptions = [
  { id: 'poster-12x18', type: 'poster', label: 'Poster', size: '12×18"', price: 24.99 },
  { id: 'poster-18x24', type: 'poster', label: 'Poster', size: '18×24"', price: 34.99 },
  { id: 'poster-24x36', type: 'poster', label: 'Poster', size: '24×36"', price: 44.99 },
  { id: 'canvas-12x16', type: 'canvas', label: 'Canvas', size: '12×16"', price: 49.99 },
  { id: 'canvas-18x24', type: 'canvas', label: 'Canvas', size: '18×24"', price: 79.99 },
  { id: 'canvas-24x36', type: 'canvas', label: 'Canvas', size: '24×36"', price: 119.99 },
  { id: 'framed-12x18', type: 'framed', label: 'Framed', size: '12×18"', price: 59.99 },
  { id: 'framed-18x24', type: 'framed', label: 'Framed', size: '18×24"', price: 89.99 },
  { id: 'framed-24x36', type: 'framed', label: 'Framed', size: '24×36"', price: 129.99 },
];

const productTypes = ['poster', 'canvas', 'framed'] as const;
type ProductType = typeof productTypes[number];

interface Artwork {
  id: string;
  title: string;
  description: string;
  artist_name: string;
  image_url: string;
  price_base: number;
}

export default function ArtworkPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [artwork, setArtwork] = useState<Artwork | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<ProductType>('poster');
  const [selectedOption, setSelectedOption] = useState(printOptions[0]);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [mockupUrl, setMockupUrl] = useState<string | null>(null);
  const [mockupLoading, setMockupLoading] = useState(false);
  const [mockupCache, setMockupCache] = useState<Record<string, string>>({});

  useEffect(() => {
    async function fetchArtwork() {
      const { data } = await supabase
        .from('artworks')
        .select('*')
        .eq('id', resolvedParams.id)
        .single();

      if (data) setArtwork(data);
      setLoading(false);
    }
    fetchArtwork();
  }, [resolvedParams.id]);

  // Fetch mockup when type/size changes
  const fetchMockup = useCallback(async (type: ProductType, size: string, imageUrl: string) => {
    const cacheKey = `${type}-${size}`;

    // Check cache first
    if (mockupCache[cacheKey]) {
      setMockupUrl(mockupCache[cacheKey]);
      return;
    }

    setMockupLoading(true);
    try {
      const response = await fetch('/api/mockups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl,
          productType: type,
          size,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.mockups && data.mockups[0]?.mockup_url) {
          const url = data.mockups[0].mockup_url;
          setMockupUrl(url);
          setMockupCache(prev => ({ ...prev, [cacheKey]: url }));
        }
      }
    } catch (error) {
      console.error('Failed to fetch mockup:', error);
    }
    setMockupLoading(false);
  }, [mockupCache]);

  // Trigger mockup fetch when selection changes
  useEffect(() => {
    if (artwork?.image_url && selectedType && selectedOption) {
      fetchMockup(selectedType, selectedOption.size, artwork.image_url);
    }
  }, [artwork?.image_url, selectedType, selectedOption, fetchMockup]);

  const filteredOptions = printOptions.filter((opt) => opt.type === selectedType);

  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    // TODO: Add to cart state/localStorage
    setTimeout(() => {
      setIsAddingToCart(false);
      alert('Added to cart!');
    }, 500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fff8f3] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-[#d4846a] rounded-full" />
      </div>
    );
  }

  if (!artwork) {
    return (
      <div className="min-h-screen bg-[#fff8f3] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-serif mb-4">Artwork not found</h1>
          <Link href="/gallery" className="text-[#d4846a] hover:underline">Back to Gallery</Link>
        </div>
      </div>
    );
  }

  const typeLabels: Record<ProductType, string> = {
    poster: 'Poster',
    canvas: 'Canvas',
    framed: 'Framed',
  };

  return (
    <div className="min-h-screen bg-[#fff8f3]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-[#fff8f3]/80 backdrop-blur-md border-b border-gray-100/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-xl tracking-tight font-light">
              Katia<span className="font-serif italic text-[#d4846a]">Prints</span>
            </Link>
            <nav className="flex items-center gap-8">
              <Link href="/gallery" className="text-sm text-gray-600 hover:text-[#d4846a] nav-link transition">
                Gallery
              </Link>
              <Link href="/cart" className="text-sm text-gray-600 hover:text-[#d4846a] flex items-center gap-2 transition">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Cart
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="pt-20 max-w-7xl mx-auto px-6 lg:px-8 py-4">
        <nav className="text-sm text-gray-500">
          <Link href="/" className="hover:text-[#d4846a] transition">Home</Link>
          <span className="mx-2 text-[#e8a87c]">/</span>
          <Link href="/gallery" className="hover:text-[#d4846a] transition">Gallery</Link>
          <span className="mx-2 text-[#e8a87c]">/</span>
          <span className="text-gray-900">{artwork.title}</span>
        </nav>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Mockup Preview */}
          <div className="sticky top-24">
            <div className="relative aspect-[4/3] bg-gradient-to-b from-[#f5f0eb] to-[#e8e3de] rounded-2xl overflow-hidden shadow-lg">
              {/* Show Printful mockup if available, otherwise show artwork */}
              {mockupLoading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-[#f5f0eb]">
                  <div className="text-center">
                    <div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-[#d4846a] rounded-full mx-auto mb-3" />
                    <p className="text-sm text-gray-500">Generating preview...</p>
                  </div>
                </div>
              ) : mockupUrl ? (
                <img
                  src={mockupUrl}
                  alt={`${artwork.title} - ${typeLabels[selectedType]} ${selectedOption.size}`}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center p-8">
                  <img
                    src={artwork.image_url}
                    alt={artwork.title}
                    className="max-w-full max-h-full object-contain shadow-2xl"
                  />
                </div>
              )}

              {/* Size indicator */}
              <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-medium text-gray-700 shadow-sm">
                {selectedOption.size} {typeLabels[selectedType]}
              </div>
            </div>

            {/* Thumbnail strip */}
            <div className="flex gap-3 mt-4 justify-center">
              {productTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setSelectedType(type);
                    setSelectedOption(printOptions.find((opt) => opt.type === type)!);
                  }}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedType === type
                      ? 'border-[#d4846a] shadow-md'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img
                    src={artwork.image_url}
                    alt={typeLabels[type]}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Details */}
          <div>
            <h1 className="text-4xl font-serif font-light text-gray-900 mb-2">{artwork.title}</h1>
            <p className="text-[#d4846a] mb-6">by {artwork.artist_name}</p>
            <p className="text-gray-600 mb-8 leading-relaxed text-lg">{artwork.description}</p>

            {/* Print Type Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-900 mb-3">Print Type</label>
              <div className="flex flex-wrap gap-2">
                {productTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      setSelectedType(type);
                      setSelectedOption(printOptions.find((opt) => opt.type === type)!);
                    }}
                    className={`px-5 py-2.5 text-sm rounded-full border transition-all ${
                      selectedType === type
                        ? 'border-[#d4846a] bg-[#d4846a] text-white shadow-md'
                        : 'border-gray-300 hover:border-[#d4846a] hover:text-[#d4846a]'
                    }`}
                  >
                    {typeLabels[type]}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-900 mb-3">Size</label>
              <div className="grid grid-cols-3 gap-3">
                {filteredOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setSelectedOption(option)}
                    className={`p-4 border rounded-xl text-center transition-all ${
                      selectedOption.id === option.id
                        ? 'border-[#d4846a] bg-[#fff8f3] shadow-md'
                        : 'border-gray-200 hover:border-[#e8a87c]'
                    }`}
                  >
                    <div className="text-sm font-medium">{option.size}</div>
                    <div className="text-sm text-[#d4846a] font-medium">${option.price}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Price & Add to Cart */}
            <div className="border-t border-[#e8a87c]/20 pt-6">
              <div className="flex items-center justify-between mb-6">
                <span className="text-3xl font-light">${selectedOption.price}</span>
                <span className="text-sm text-gray-500">Free shipping on orders over $100</span>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={isAddingToCart}
                className="w-full bg-gray-900 text-white py-4 text-sm tracking-wide rounded-full hover:bg-[#d4846a] transition-all disabled:bg-gray-400 shadow-lg hover:shadow-xl"
              >
                {isAddingToCart ? 'Adding...' : 'Add to Cart'}
              </button>
            </div>

            {/* Product Info */}
            <div className="mt-8 pt-8 border-t border-[#e8a87c]/20">
              <h3 className="text-sm font-medium text-gray-900 mb-4">About this print</h3>
              <ul className="text-sm text-gray-600 space-y-3">
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-[#d4846a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Printed on demand by Printful
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-[#d4846a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Ships within 3-5 business days
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-[#d4846a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  30-day satisfaction guarantee
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-[#d4846a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Museum-quality materials
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#e8a87c]/20 py-12 px-6 lg:px-8 mt-16">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-xl tracking-tight font-light mb-2">
            Katia<span className="font-serif italic text-[#d4846a]">Prints</span>
          </p>
          <p className="text-sm text-gray-400">&copy; {new Date().getFullYear()} KatiaPrints. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
