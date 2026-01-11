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
    <div className="min-h-screen bg-[#fff8f3]">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-[#fff8f3]/80 backdrop-blur-md border-b border-gray-100/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-xl tracking-tight font-light">
              Katia<span className="font-serif italic">Prints</span>
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

      <main className="pt-24 pb-16 px-6 lg:px-8 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-[#e8a87c]/5 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-[#f5d4be]/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative">
          {/* Header */}
          <div className="mb-16">
            <nav className="text-sm text-gray-500 mb-4">
              <Link href="/" className="hover:text-[#d4846a] transition">Home</Link>
              <span className="mx-2 text-[#e8a87c]">/</span>
              <span className="text-gray-900">Gallery</span>
            </nav>
            <h1 className="text-5xl md:text-7xl font-serif font-light text-gray-900 mb-6 fade-in">
              <span className="gradient-text">Gallery</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl fade-in fade-in-delay-1">
              Browse our complete collection of original artwork prints. Each piece is available in multiple sizes and formats.
            </p>
            <div className="mt-6 w-24 h-0.5 bg-gradient-to-r from-[#e8a87c] to-transparent fade-in fade-in-delay-2" />
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
              ))}
            </div>
          ) : (
            <div className="text-center py-32 relative">
              {/* Decorative elements */}
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
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#e8a87c]/20 py-12 px-6 lg:px-8">
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
