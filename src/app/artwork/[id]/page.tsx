'use client';

import { useState } from 'react';
import Link from 'next/link';

// Print options with Printful variant mappings
const printOptions = [
  { id: 'poster-12x18', type: 'Poster', size: '12×18"', price: 24.99, variantId: 1 },
  { id: 'poster-18x24', type: 'Poster', size: '18×24"', price: 34.99, variantId: 2 },
  { id: 'poster-24x36', type: 'Poster', size: '24×36"', price: 44.99, variantId: 3 },
  { id: 'canvas-12x16', type: 'Canvas', size: '12×16"', price: 49.99, variantId: 4 },
  { id: 'canvas-18x24', type: 'Canvas', size: '18×24"', price: 79.99, variantId: 5 },
  { id: 'canvas-24x36', type: 'Canvas', size: '24×36"', price: 119.99, variantId: 6 },
  { id: 'framed-12x18', type: 'Framed', size: '12×18"', price: 59.99, variantId: 7 },
  { id: 'framed-18x24', type: 'Framed', size: '18×24"', price: 89.99, variantId: 8 },
  { id: 'metal-12x16', type: 'Metal', size: '12×16"', price: 79.99, variantId: 9 },
  { id: 'metal-18x24', type: 'Metal', size: '18×24"', price: 129.99, variantId: 10 },
];

// Demo artwork - will come from Supabase
const demoArtwork = {
  id: '1',
  title: 'Sunset Over Mountains',
  description: 'A breathtaking view of the sun setting behind mountain peaks, painted with vibrant oranges and deep purples. This piece captures the peaceful moment when day transitions to night.',
  artist_name: 'Artist Name',
  image_url: '/placeholder-art-1.jpg',
};

export default function ArtworkPage({ params }: { params: Promise<{ id: string }> }) {
  const [selectedType, setSelectedType] = useState('Poster');
  const [selectedOption, setSelectedOption] = useState(printOptions[0]);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const filteredOptions = printOptions.filter((opt) => opt.type === selectedType);

  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    // TODO: Add to cart state/localStorage
    setTimeout(() => {
      setIsAddingToCart(false);
      alert('Added to cart!');
    }, 500);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-light tracking-wide text-gray-900">
              Art Prints
            </Link>
            <nav className="flex items-center gap-6">
              <Link href="/gallery" className="text-gray-600 hover:text-gray-900 transition">
                Gallery
              </Link>
              <Link href="/cart" className="text-gray-600 hover:text-gray-900 transition">
                Cart (0)
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="text-sm text-gray-500">
          <Link href="/" className="hover:text-gray-900">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/gallery" className="hover:text-gray-900">Gallery</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{demoArtwork.title}</span>
        </nav>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image */}
          <div className="aspect-[4/5] bg-gray-100 flex items-center justify-center">
            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
              <span className="text-gray-400">Artwork Preview</span>
            </div>
          </div>

          {/* Details */}
          <div>
            <h1 className="text-3xl font-light text-gray-900 mb-2">{demoArtwork.title}</h1>
            <p className="text-gray-500 mb-6">by {demoArtwork.artist_name}</p>
            <p className="text-gray-600 mb-8 leading-relaxed">{demoArtwork.description}</p>

            {/* Print Type Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-900 mb-3">Print Type</label>
              <div className="flex gap-2">
                {['Poster', 'Canvas', 'Framed', 'Metal'].map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      setSelectedType(type);
                      setSelectedOption(printOptions.find((opt) => opt.type === type)!);
                    }}
                    className={`px-4 py-2 text-sm border transition ${
                      selectedType === type
                        ? 'border-gray-900 bg-gray-900 text-white'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {type}
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
                    className={`p-4 border text-center transition ${
                      selectedOption.id === option.id
                        ? 'border-gray-900 bg-gray-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-sm font-medium">{option.size}</div>
                    <div className="text-sm text-gray-500">${option.price}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Price & Add to Cart */}
            <div className="border-t border-gray-100 pt-6">
              <div className="flex items-center justify-between mb-6">
                <span className="text-2xl font-light">${selectedOption.price}</span>
                <span className="text-sm text-gray-500">Free shipping on orders over $100</span>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={isAddingToCart}
                className="w-full bg-gray-900 text-white py-4 text-sm tracking-wide hover:bg-gray-800 transition disabled:bg-gray-400"
              >
                {isAddingToCart ? 'Adding...' : 'Add to Cart'}
              </button>
            </div>

            {/* Product Info */}
            <div className="mt-8 pt-8 border-t border-gray-100">
              <h3 className="text-sm font-medium text-gray-900 mb-4">About this print</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>Printed on demand by Printful</li>
                <li>Ships within 3-5 business days</li>
                <li>30-day satisfaction guarantee</li>
                <li>Museum-quality materials</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
