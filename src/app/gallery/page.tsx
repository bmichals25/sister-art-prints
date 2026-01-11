import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { GalleryGrid } from '@/components/GalleryGrid';

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
          <GalleryGrid initialArtworks={artworks} />
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
