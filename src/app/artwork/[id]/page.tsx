'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { use } from 'react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Print options with sizing - maps to Printful products, organized by orientation
const printOptionsByOrientation = {
  portrait: [
    { id: 'poster-12x18', type: 'poster', label: 'Poster', size: '12×18"', price: 24.99 },
    { id: 'poster-18x24', type: 'poster', label: 'Poster', size: '18×24"', price: 34.99 },
    { id: 'poster-24x36', type: 'poster', label: 'Poster', size: '24×36"', price: 44.99 },
    { id: 'canvas-12x16', type: 'canvas', label: 'Canvas', size: '12×16"', price: 49.99 },
    { id: 'canvas-18x24', type: 'canvas', label: 'Canvas', size: '18×24"', price: 79.99 },
    { id: 'canvas-24x36', type: 'canvas', label: 'Canvas', size: '24×36"', price: 119.99 },
    { id: 'framed-12x18', type: 'framed', label: 'Framed', size: '12×18"', price: 59.99 },
    { id: 'framed-18x24', type: 'framed', label: 'Framed', size: '18×24"', price: 89.99 },
    { id: 'framed-24x36', type: 'framed', label: 'Framed', size: '24×36"', price: 129.99 },
  ],
  landscape: [
    { id: 'poster-18x12', type: 'poster', label: 'Poster', size: '18×12"', price: 24.99 },
    { id: 'poster-24x18', type: 'poster', label: 'Poster', size: '24×18"', price: 34.99 },
    { id: 'poster-36x24', type: 'poster', label: 'Poster', size: '36×24"', price: 44.99 },
    { id: 'canvas-16x12', type: 'canvas', label: 'Canvas', size: '16×12"', price: 49.99 },
    { id: 'canvas-24x18', type: 'canvas', label: 'Canvas', size: '24×18"', price: 79.99 },
    { id: 'canvas-36x24', type: 'canvas', label: 'Canvas', size: '36×24"', price: 119.99 },
    { id: 'framed-18x12', type: 'framed', label: 'Framed', size: '18×12"', price: 59.99 },
    { id: 'framed-24x18', type: 'framed', label: 'Framed', size: '24×18"', price: 89.99 },
    { id: 'framed-36x24', type: 'framed', label: 'Framed', size: '36×24"', price: 129.99 },
  ],
};

const productTypes = ['poster', 'canvas', 'framed'] as const;
type ProductType = typeof productTypes[number];

// Aspect ratios for each product type - must match ArtworkPositioner
const PRODUCT_ASPECT_RATIOS: Record<string, Record<ProductType, number>> = {
  portrait: {
    poster: 2/3,  // 2:3
    canvas: 3/4,  // 3:4
    framed: 2/3,  // 2:3
  },
  landscape: {
    poster: 3/2,  // 3:2
    canvas: 4/3,  // 4:3
    framed: 3/2,  // 3:2
  },
};

interface CustomProduct {
  id: string;
  name: string;
  printfulProductId?: number;
  productImage?: string;
  variants: Array<{
    id: string;
    printfulVariantId?: number;
    size: string;
    color?: string;
    price: number;
  }>;
}

interface Artwork {
  id: string;
  title: string;
  description: string;
  artist_name: string;
  image_url: string;
  price_base: number;
  orientation?: 'portrait' | 'landscape';
  custom_prices?: Record<string, number>;
  enabled_prints?: string[];
  custom_products?: CustomProduct[];
}

// Unified option type for both default and custom products
interface PrintOption {
  id: string;
  type: string;
  label: string;
  size: string;
  price: number;
  color?: string;
  isCustom?: boolean;
  printfulVariantId?: number;
}

export default function ArtworkPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [artwork, setArtwork] = useState<Artwork | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('poster');
  const [selectedOption, setSelectedOption] = useState<PrintOption | null>(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [mockupUrl, setMockupUrl] = useState<string | null>(null);
  const [mockupLoading, setMockupLoading] = useState(false);
  const [mockupCache, setMockupCache] = useState<Record<string, string>>({});

  // Get orientation from artwork, default to portrait
  const orientation = artwork?.orientation || 'portrait';
  const printOptions = printOptionsByOrientation[orientation];

  // Check if selected type is a custom product
  const isCustomProduct = !productTypes.includes(selectedType as ProductType);
  const customProduct = artwork?.custom_products?.find(p => p.id === selectedType);

  // All product types including custom ones
  const allProductTypes = [
    ...productTypes,
    ...(artwork?.custom_products?.map(p => p.id) || []),
  ];

  // Get labels for all product types
  const getTypeLabel = (type: string) => {
    if (productTypes.includes(type as ProductType)) {
      const labels: Record<ProductType, string> = {
        poster: 'Poster',
        canvas: 'Canvas',
        framed: 'Framed',
      };
      return labels[type as ProductType];
    }
    return artwork?.custom_products?.find(p => p.id === type)?.name || type;
  };

  useEffect(() => {
    async function fetchArtwork() {
      const { data } = await supabase
        .from('artworks')
        .select('*')
        .eq('id', resolvedParams.id)
        .single();

      if (data) {
        setArtwork(data);
        // Set initial selected option based on orientation
        const artworkOrientation = (data.orientation as 'portrait' | 'landscape') || 'portrait';
        const opts = printOptionsByOrientation[artworkOrientation];
        setSelectedOption(opts[0]);
      }
      setLoading(false);
    }
    fetchArtwork();
  }, [resolvedParams.id]);

  // Fetch mockup when type/size changes
  const fetchMockup = useCallback(async (
    type: string,
    size: string,
    imageUrl: string,
    artworkId: string,
    artworkOrientation: string,
    customProductData?: { printfulProductId?: number; printfulVariantId?: number; name?: string }
  ) => {
    const cacheKey = `${type}-${size}-${artworkOrientation}`;

    // Check local cache first
    if (mockupCache[cacheKey]) {
      setMockupUrl(mockupCache[cacheKey]);
      return;
    }

    setMockupLoading(true);
    try {
      // Build request body - include Printful IDs for custom products
      const requestBody: Record<string, unknown> = {
        imageUrl,
        artworkId,
        orientation: artworkOrientation,
      };

      if (customProductData?.printfulProductId && customProductData?.printfulVariantId) {
        // Custom product - use direct Printful IDs
        requestBody.printfulProductId = customProductData.printfulProductId;
        requestBody.printfulVariantId = customProductData.printfulVariantId;
        requestBody.customProductName = customProductData.name;
        requestBody.size = size;
      } else {
        // Standard product
        requestBody.productType = type;
        requestBody.size = size;
      }

      const response = await fetch('/api/mockups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
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
    if (artwork?.id && artwork?.image_url && selectedType && selectedOption) {
      // For custom products, pass Printful IDs
      if (selectedOption.isCustom && selectedOption.printfulVariantId && customProduct?.printfulProductId) {
        fetchMockup(
          selectedType,
          selectedOption.size,
          artwork.image_url,
          artwork.id,
          orientation,
          {
            printfulProductId: customProduct.printfulProductId,
            printfulVariantId: selectedOption.printfulVariantId,
            name: customProduct.name,
          }
        );
      } else {
        // Standard product
        fetchMockup(selectedType, selectedOption.size, artwork.image_url, artwork.id, orientation);
      }
    }
  }, [artwork?.id, artwork?.image_url, selectedType, selectedOption, orientation, customProduct, fetchMockup]);

  // Get filtered options for current selection (default or custom product)
  const filteredOptions: PrintOption[] = isCustomProduct && customProduct
    ? customProduct.variants.map(v => ({
        id: v.id,
        type: customProduct.id,
        label: customProduct.name,
        size: v.size,
        price: v.price,
        color: v.color,
        isCustom: true,
        printfulVariantId: v.printfulVariantId,
      }))
    : printOptions.filter((opt) => opt.type === selectedType).map(opt => ({
        ...opt,
        isCustom: false,
      }));

  // Get price - use custom price if set, otherwise default
  const getPrice = (optionId: string, defaultPrice: number) => {
    return artwork?.custom_prices?.[optionId] ?? defaultPrice;
  };

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

  // Get aspect ratio for current product type (1:1 for custom products)
  const getAspectRatio = () => {
    if (isCustomProduct) {
      return 1; // 1:1 for custom products
    }
    return PRODUCT_ASPECT_RATIOS[orientation][selectedType as ProductType];
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
            <div
              className="relative bg-gradient-to-b from-[#f5f0eb] to-[#e8e3de] rounded-2xl overflow-hidden shadow-lg"
              style={{
                aspectRatio: getAspectRatio(),
              }}
            >
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
                  alt={`${artwork.title} - ${getTypeLabel(selectedType)} ${selectedOption?.size || ''}`}
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
              {selectedOption && (
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-medium text-gray-700 shadow-sm">
                  {selectedOption.size} {getTypeLabel(selectedType)}
                  {selectedOption.color && <span className="text-gray-500 ml-1">({selectedOption.color})</span>}
                </div>
              )}
            </div>

            {/* Thumbnail strip */}
            <div className="flex flex-wrap gap-3 mt-4 justify-center">
              {allProductTypes.map((type) => {
                const isCustom = !productTypes.includes(type as ProductType);
                return (
                  <button
                    key={type}
                    onClick={() => {
                      setSelectedType(type);
                      if (isCustom) {
                        const cp = artwork.custom_products?.find(p => p.id === type);
                        if (cp && cp.variants.length > 0) {
                          const v = cp.variants[0];
                          setSelectedOption({
                            id: v.id,
                            type: cp.id,
                            label: cp.name,
                            size: v.size,
                            price: v.price,
                            color: v.color,
                            isCustom: true,
                            printfulVariantId: v.printfulVariantId,
                          });
                        }
                      } else {
                        setSelectedOption(printOptions.find((opt) => opt.type === type)!);
                      }
                    }}
                    className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedType === type
                        ? isCustom ? 'border-blue-500 shadow-md' : 'border-[#d4846a] shadow-md'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                    title={getTypeLabel(type)}
                  >
                    <img
                      src={artwork.image_url}
                      alt={getTypeLabel(type)}
                      className="w-full h-full object-cover"
                    />
                    {isCustom && (
                      <div className="absolute inset-0 flex items-center justify-center bg-blue-500/20">
                        <span className="text-[8px] font-bold text-blue-700 bg-white/80 px-1 rounded">CUSTOM</span>
                      </div>
                    )}
                  </button>
                );
              })}
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
                {allProductTypes.map((type) => {
                  const isCustom = !productTypes.includes(type as ProductType);
                  return (
                    <button
                      key={type}
                      onClick={() => {
                        setSelectedType(type);
                        if (isCustom) {
                          const cp = artwork.custom_products?.find(p => p.id === type);
                          if (cp && cp.variants.length > 0) {
                            const v = cp.variants[0];
                            setSelectedOption({
                              id: v.id,
                              type: cp.id,
                              label: cp.name,
                              size: v.size,
                              price: v.price,
                              color: v.color,
                              isCustom: true,
                              printfulVariantId: v.printfulVariantId,
                            });
                          }
                        } else {
                          setSelectedOption(printOptions.find((opt) => opt.type === type)!);
                        }
                      }}
                      className={`px-5 py-2.5 text-sm rounded-full border transition-all ${
                        selectedType === type
                          ? isCustom
                            ? 'border-blue-500 bg-blue-500 text-white shadow-md'
                            : 'border-[#d4846a] bg-[#d4846a] text-white shadow-md'
                          : isCustom
                            ? 'border-blue-300 text-blue-600 hover:border-blue-500 hover:text-blue-700'
                            : 'border-gray-300 hover:border-[#d4846a] hover:text-[#d4846a]'
                      }`}
                    >
                      {getTypeLabel(type)}
                      {isCustom && <span className="ml-1.5 text-xs opacity-75">(Custom)</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Size Selection */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-900 mb-3">
                {isCustomProduct ? 'Variant' : 'Size'}
              </label>
              <div className="grid grid-cols-3 gap-3">
                {filteredOptions.map((option) => {
                  const price = getPrice(option.id, option.price);
                  return (
                    <button
                      key={option.id}
                      onClick={() => setSelectedOption(option)}
                      className={`p-4 border rounded-xl text-center transition-all ${
                        selectedOption?.id === option.id
                          ? option.isCustom
                            ? 'border-blue-500 bg-blue-50 shadow-md'
                            : 'border-[#d4846a] bg-[#fff8f3] shadow-md'
                          : 'border-gray-200 hover:border-[#e8a87c]'
                      }`}
                    >
                      <div className="text-sm font-medium">{option.size}</div>
                      {option.color && (
                        <div className="text-xs text-gray-500">{option.color}</div>
                      )}
                      <div className={`text-sm font-medium ${option.isCustom ? 'text-blue-600' : 'text-[#d4846a]'}`}>
                        ${price.toFixed(2)}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price & Add to Cart */}
            <div className="border-t border-[#e8a87c]/20 pt-6">
              <div className="flex items-center justify-between mb-6">
                <span className="text-3xl font-light">
                  ${selectedOption ? getPrice(selectedOption.id, selectedOption.price).toFixed(2) : '0.00'}
                </span>
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
