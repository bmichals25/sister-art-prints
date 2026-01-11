import Link from 'next/link';
import Image from 'next/image';

// Demo artwork data - will be replaced with Supabase data
const demoArtworks = [
  {
    id: '1',
    title: 'Sunset Over Mountains',
    artist_name: 'Artist Name',
    image_url: '/placeholder-art-1.jpg',
    price_base: 29.99,
    featured: true,
  },
  {
    id: '2',
    title: 'Abstract Dreams',
    artist_name: 'Artist Name',
    image_url: '/placeholder-art-2.jpg',
    price_base: 34.99,
    featured: true,
  },
  {
    id: '3',
    title: 'Ocean Waves',
    artist_name: 'Artist Name',
    image_url: '/placeholder-art-3.jpg',
    price_base: 39.99,
    featured: false,
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-light tracking-wide text-gray-900">
              Art Prints
            </h1>
            <nav className="flex items-center gap-6">
              <Link href="/gallery" className="text-gray-600 hover:text-gray-900 transition">
                Gallery
              </Link>
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

      {/* Hero */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-light text-gray-900 mb-4">
            Original Art, Beautiful Prints
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            High-quality prints of original artwork, shipped directly to your door.
            Available as posters, canvas prints, and framed pieces.
          </p>
          <Link
            href="/gallery"
            className="inline-block bg-gray-900 text-white px-8 py-3 text-sm tracking-wide hover:bg-gray-800 transition"
          >
            Browse Collection
          </Link>
        </div>
      </section>

      {/* Featured Artworks */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl font-light text-gray-900 mb-8">Featured Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {demoArtworks.map((artwork) => (
              <Link
                key={artwork.id}
                href={`/artwork/${artwork.id}`}
                className="group"
              >
                <div className="aspect-[4/5] bg-gray-100 mb-4 overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 group-hover:scale-105 transition-transform duration-300 flex items-center justify-center">
                    <span className="text-gray-400 text-sm">Artwork Preview</span>
                  </div>
                </div>
                <h4 className="text-lg text-gray-900 mb-1">{artwork.title}</h4>
                <p className="text-gray-500 text-sm mb-2">{artwork.artist_name}</p>
                <p className="text-gray-900">From ${artwork.price_base}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Print Options */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl font-light text-gray-900 mb-8 text-center">Print Options</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { name: 'Poster', desc: 'Museum-quality paper', from: '$24' },
              { name: 'Canvas', desc: 'Gallery-wrapped canvas', from: '$49' },
              { name: 'Framed', desc: 'Ready to hang', from: '$59' },
              { name: 'Metal', desc: 'Vibrant HD metal prints', from: '$79' },
            ].map((option) => (
              <div key={option.name} className="text-center p-6 bg-white">
                <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4" />
                <h4 className="font-medium text-gray-900 mb-2">{option.name}</h4>
                <p className="text-sm text-gray-500 mb-2">{option.desc}</p>
                <p className="text-gray-900">From {option.from}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
          <p>&copy; 2026 Art Prints. All rights reserved.</p>
          <p className="mt-2">Prints fulfilled by Printful</p>
        </div>
      </footer>
    </div>
  );
}
