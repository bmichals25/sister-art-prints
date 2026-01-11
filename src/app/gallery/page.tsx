import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function getArtworks() {
  const { data } = await supabase
    .from('artworks')
    .select('*')
    .order('created_at', { ascending: false });
  return data || [];
}

export const revalidate = 60;

export default async function GalleryPage() {
  const artworks = await getArtworks();

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-[#fafafa]/80 backdrop-blur-md border-b border-gray-100/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-xl tracking-tight font-light">
              <span className="font-serif italic">Art</span> Prints
            </Link>
            <nav className="flex items-center gap-8">
              <span className="text-sm text-gray-900">Gallery</span>
              <Link href="/about" className="text-sm text-gray-600 hover:text-gray-900 nav-link transition">
                About
              </Link>
              <Link
                href="/cart"
                className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-2 transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Cart
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-16 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <nav className="text-sm text-gray-500 mb-4">
              <Link href="/" className="hover:text-gray-900 transition">Home</Link>
              <span className="mx-2">/</span>
              <span className="text-gray-900">Gallery</span>
            </nav>
            <h1 className="text-4xl md:text-5xl font-serif font-light text-gray-900 mb-4">
              Gallery
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl">
              Browse our complete collection of original artwork prints. Each piece is available in multiple sizes and formats.
            </p>
          </div>

          {/* Artwork Grid */}
          {artworks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
              {artworks.map((artwork, index) => (
                <Link
                  key={artwork.id}
                  href={`/artwork/${artwork.id}`}
                  className="group artwork-card fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="aspect-[4/5] bg-gray-100 mb-5 overflow-hidden rounded-sm relative">
                    {artwork.image_url ? (
                      <img
                        src={artwork.image_url}
                        alt={artwork.title}
                        className="w-full h-full object-cover artwork-image"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    {artwork.featured && (
                      <div className="absolute top-3 left-3 px-2 py-1 bg-white/90 backdrop-blur-sm text-xs text-gray-700 rounded">
                        Featured
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-medium text-gray-900 group-hover:text-gray-600 transition">
                      {artwork.title}
                    </h3>
                    <p className="text-sm text-gray-500">{artwork.artist_name}</p>
                    <p className="text-sm text-gray-900 pt-1">From ${artwork.price_base}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-24 bg-white rounded-lg">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">No artworks yet</h3>
              <p className="text-gray-500 mb-6">The gallery is waiting for its first masterpiece</p>
              <p className="text-sm text-gray-400">
                Press <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">Option</kbd> + <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">F3</kbd> to add artwork
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-12 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} Art Prints. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
