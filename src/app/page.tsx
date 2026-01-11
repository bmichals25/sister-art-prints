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

async function getFeaturedArtworks() {
  const { data } = await supabase
    .from('artworks')
    .select('*')
    .eq('featured', true)
    .order('created_at', { ascending: false })
    .limit(6);
  return data || [];
}

export const revalidate = 60; // Revalidate every 60 seconds

export default async function Home() {
  const featuredArtworks = await getFeaturedArtworks();
  const allArtworks = await getArtworks();

  // Use all artworks if no featured ones
  const displayArtworks = featuredArtworks.length > 0 ? featuredArtworks : allArtworks.slice(0, 6);

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
              <Link href="/gallery" className="text-sm text-gray-600 hover:text-gray-900 nav-link transition">
                Gallery
              </Link>
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

      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-16 overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="abstract-shape abstract-shape-1" />
          <div className="abstract-shape abstract-shape-2" />
          <div className="abstract-shape abstract-shape-3" />
          <div className="glow-orb glow-orb-1" />
          <div className="glow-orb glow-orb-2" />
        </div>

        {/* Animated Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-10" viewBox="0 0 1440 900" fill="none">
          <path className="draw-line" d="M0 450 Q 360 200 720 450 T 1440 450" stroke="url(#gradient1)" strokeWidth="1" fill="none" style={{ animationDelay: '0.5s' }} />
          <path className="draw-line" d="M0 500 Q 360 700 720 500 T 1440 500" stroke="url(#gradient1)" strokeWidth="1" fill="none" style={{ animationDelay: '1s' }} />
          <path className="draw-line" d="M-100 300 Q 400 100 700 350 T 1500 200" stroke="url(#gradient2)" strokeWidth="0.5" fill="none" style={{ animationDelay: '1.5s' }} />
          <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#e8a87c" stopOpacity="0" />
              <stop offset="50%" stopColor="#d4846a" stopOpacity="1" />
              <stop offset="100%" stopColor="#e8a87c" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f5d4be" stopOpacity="0" />
              <stop offset="50%" stopColor="#e8a87c" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#f5d4be" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>

        <div className="absolute inset-0 grain" />

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-light text-gray-900 mb-6 fade-in">
            <span className="gradient-text">Original Art,</span>
            <br />
            <span className="italic">Beautiful Prints</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10 fade-in fade-in-delay-1">
            Discover our curated collection of original artwork,
            available as museum-quality prints delivered to your door.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center fade-in fade-in-delay-2">
            <Link
              href="/gallery"
              className="group inline-flex items-center justify-center px-8 py-4 bg-gray-900 text-white text-sm tracking-wide hover:bg-gray-800 transition btn-primary interactive-glow rounded-full"
            >
              Explore Collection
              <svg className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              href="#featured"
              className="group inline-flex items-center justify-center px-8 py-4 border border-gray-300 text-gray-700 text-sm tracking-wide hover:border-[#e8a87c] hover:text-[#d4846a] transition rounded-full"
            >
              View Featured Works
              <svg className="w-4 h-4 ml-2 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 fade-in fade-in-delay-3">
          <div className="flex flex-col items-center gap-2 text-gray-400">
            <span className="text-xs tracking-widest uppercase">Scroll</span>
            <svg className="w-4 h-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>

        {/* Floating accent circles */}
        <div className="absolute top-1/4 left-10 w-2 h-2 rounded-full bg-[#e8a87c]/40 animate-pulse" style={{ animationDuration: '3s' }} />
        <div className="absolute top-1/3 right-16 w-3 h-3 rounded-full bg-[#d4846a]/30 animate-pulse" style={{ animationDuration: '4s', animationDelay: '1s' }} />
        <div className="absolute bottom-1/3 left-20 w-1.5 h-1.5 rounded-full bg-[#f5d4be]/50 animate-pulse" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }} />
      </section>

      {/* Featured Works */}
      <section id="featured" className="py-24 px-6 lg:px-8 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#e8a87c]/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-[#f5d4be]/10 to-transparent rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto relative">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-sm text-[#d4846a] tracking-widest uppercase mb-2 font-medium">Collection</p>
              <h2 className="text-3xl md:text-5xl font-serif font-light text-gray-900">
                Featured <span className="italic text-[#d4846a]">Works</span>
              </h2>
            </div>
            <Link
              href="/gallery"
              className="hidden sm:flex items-center gap-2 text-sm text-gray-600 hover:text-[#d4846a] nav-link transition group"
            >
              View All
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          {displayArtworks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayArtworks.map((artwork, index) => (
                <Link
                  key={artwork.id}
                  href={`/artwork/${artwork.id}`}
                  className="group artwork-card"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="aspect-[4/5] bg-gray-100 mb-5 overflow-hidden rounded-sm">
                    {artwork.image_url ? (
                      <img
                        src={artwork.image_url}
                        alt={artwork.title}
                        className="w-full h-full object-cover artwork-image"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <span className="text-gray-400 text-sm">No image</span>
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
            <div className="text-center py-20 bg-gray-50 rounded-lg">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-gray-500">No artworks yet</p>
            </div>
          )}

          <div className="mt-12 text-center sm:hidden">
            <Link
              href="/gallery"
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition"
            >
              View All Works
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Print Options */}
      <section className="py-24 px-6 lg:px-8 bg-white relative overflow-hidden">
        {/* Abstract corner decorations */}
        <svg className="absolute top-0 left-0 w-64 h-64 text-[#e8a87c]/5" viewBox="0 0 200 200" fill="currentColor">
          <circle cx="0" cy="0" r="150" />
        </svg>
        <svg className="absolute bottom-0 right-0 w-48 h-48 text-[#f5d4be]/10" viewBox="0 0 200 200" fill="currentColor">
          <circle cx="200" cy="200" r="180" />
        </svg>

        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-16">
            <p className="text-sm text-[#d4846a] tracking-widest uppercase mb-2 font-medium">Premium Quality</p>
            <h2 className="text-3xl md:text-5xl font-serif font-light text-gray-900">
              Print <span className="italic">Options</span>
            </h2>
            <div className="mt-4 w-24 h-0.5 bg-gradient-to-r from-transparent via-[#e8a87c] to-transparent mx-auto" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[
              {
                name: 'Poster',
                desc: 'Museum-quality giclée prints on archival paper',
                from: '$24',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                )
              },
              {
                name: 'Canvas',
                desc: 'Gallery-wrapped canvas with solid wood frame',
                from: '$49',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )
              },
              {
                name: 'Framed',
                desc: 'Ready to hang with premium wooden frame',
                from: '$59',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 9a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H9a1 1 0 01-1-1V9z" />
                  </svg>
                )
              },
              {
                name: 'Metal',
                desc: 'Vibrant HD prints on lightweight aluminum',
                from: '$79',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                )
              },
            ].map((option, index) => (
              <div
                key={option.name}
                className="text-center p-6 md:p-8 bg-[#fff8f3] rounded-2xl hover:bg-gradient-to-b hover:from-[#fff8f3] hover:to-white transition-all duration-500 group cursor-pointer hover:shadow-xl hover:shadow-[#e8a87c]/10 hover:-translate-y-2"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-5 text-[#d4846a] group-hover:text-[#e8a87c] transition-all duration-300 shadow-sm group-hover:shadow-md group-hover:scale-110 group-hover:rotate-3">
                  {option.icon}
                </div>
                <h3 className="font-medium text-gray-900 mb-2 group-hover:text-[#d4846a] transition-colors">{option.name}</h3>
                <p className="text-sm text-gray-500 mb-3 hidden md:block">{option.desc}</p>
                <p className="text-sm font-medium text-[#d4846a]">From {option.from}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About/CTA Section */}
      <section className="py-32 px-6 lg:px-8 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-[#e8a87c]/10 via-transparent to-transparent rounded-full animate-pulse" style={{ animationDuration: '4s' }} />
        </div>

        {/* Decorative lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
          <line x1="0" y1="50" x2="30" y2="50" stroke="url(#ctaGradient)" strokeWidth="0.1" className="opacity-20" />
          <line x1="70" y1="50" x2="100" y2="50" stroke="url(#ctaGradient)" strokeWidth="0.1" className="opacity-20" />
          <defs>
            <linearGradient id="ctaGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="50%" stopColor="#e8a87c" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
        </svg>

        <div className="max-w-4xl mx-auto text-center relative">
          <h2 className="text-4xl md:text-6xl font-serif font-light text-gray-900 mb-6">
            Every print tells <span className="italic text-[#d4846a]">a story</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Each piece in our collection is carefully crafted and printed on demand,
            ensuring the highest quality and minimal environmental impact.
          </p>
          <Link
            href="/gallery"
            className="group inline-flex items-center justify-center px-10 py-5 bg-gray-900 text-white text-sm tracking-wide hover:bg-[#d4846a] transition-all duration-300 btn-primary rounded-full interactive-glow"
          >
            Start Your Collection
            <svg className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#e8a87c]/20 py-16 px-6 lg:px-8 relative overflow-hidden">
        {/* Subtle background gradient */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-32 bg-gradient-to-t from-[#e8a87c]/5 to-transparent blur-3xl" />

        <div className="max-w-7xl mx-auto relative">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-center md:text-left">
              <p className="text-2xl tracking-tight font-light mb-2">
                Katia<span className="font-serif italic text-[#d4846a]">Prints</span>
              </p>
              <p className="text-sm text-gray-500">Original artwork, beautifully printed</p>
            </div>
            <div className="flex items-center gap-8 text-sm text-gray-500">
              <Link href="/gallery" className="hover:text-[#d4846a] transition nav-link">Gallery</Link>
              <Link href="/about" className="hover:text-[#d4846a] transition nav-link">About</Link>
              <Link href="/cart" className="hover:text-[#d4846a] transition nav-link">Cart</Link>
            </div>
          </div>
          <div className="mt-10 pt-8 border-t border-[#e8a87c]/10 text-center text-sm text-gray-400">
            <p>&copy; {new Date().getFullYear()} KatiaPrints. All rights reserved.</p>
            <p className="mt-1">Prints fulfilled with care by Printful</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
