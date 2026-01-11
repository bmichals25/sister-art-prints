import Link from 'next/link';

// Demo artworks - will be fetched from Supabase
const artworks = [
  { id: '1', title: 'Sunset Over Mountains', artist_name: 'Artist Name', price_base: 29.99 },
  { id: '2', title: 'Abstract Dreams', artist_name: 'Artist Name', price_base: 34.99 },
  { id: '3', title: 'Ocean Waves', artist_name: 'Artist Name', price_base: 39.99 },
  { id: '4', title: 'Forest Path', artist_name: 'Artist Name', price_base: 29.99 },
  { id: '5', title: 'City Lights', artist_name: 'Artist Name', price_base: 44.99 },
  { id: '6', title: 'Desert Bloom', artist_name: 'Artist Name', price_base: 34.99 },
];

export default function GalleryPage() {
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
              <span className="text-gray-900">Gallery</span>
              <Link href="/about" className="text-gray-600 hover:text-gray-900 transition">
                About
              </Link>
              <Link href="/cart" className="text-gray-600 hover:text-gray-900 transition">
                Cart (0)
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-light text-gray-900 mb-2">Gallery</h1>
          <p className="text-gray-600">Browse our collection of original artwork prints</p>
        </div>

        {/* Filter/Sort - placeholder */}
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100">
          <div className="flex gap-4">
            <button className="text-sm text-gray-900 border-b-2 border-gray-900 pb-1">
              All
            </button>
            <button className="text-sm text-gray-500 hover:text-gray-900 pb-1">
              Landscapes
            </button>
            <button className="text-sm text-gray-500 hover:text-gray-900 pb-1">
              Abstract
            </button>
            <button className="text-sm text-gray-500 hover:text-gray-900 pb-1">
              Portraits
            </button>
          </div>
          <select className="text-sm text-gray-600 border border-gray-200 px-3 py-2">
            <option>Newest</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
          </select>
        </div>

        {/* Artwork Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {artworks.map((artwork) => (
            <Link key={artwork.id} href={`/artwork/${artwork.id}`} className="group">
              <div className="aspect-[4/5] bg-gray-100 mb-4 overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 group-hover:scale-105 transition-transform duration-300 flex items-center justify-center">
                  <span className="text-gray-400 text-sm">Artwork Preview</span>
                </div>
              </div>
              <h3 className="text-lg text-gray-900 mb-1">{artwork.title}</h3>
              <p className="text-gray-500 text-sm mb-2">{artwork.artist_name}</p>
              <p className="text-gray-900">From ${artwork.price_base}</p>
            </Link>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
          <p>&copy; 2026 Art Prints. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
