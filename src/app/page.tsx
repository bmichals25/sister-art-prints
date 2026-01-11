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
    <div className="min-h-screen bg-[#fafafa]">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-[#fafafa]/80 backdrop-blur-md border-b border-gray-100/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-xl tracking-tight font-light">
              <span className="font-serif italic">Art</span> Prints
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
        <div className="absolute inset-0 grain" />
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-serif font-light text-gray-900 mb-6 fade-in">
            Original Art,
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
              className="inline-flex items-center justify-center px-8 py-4 bg-gray-900 text-white text-sm tracking-wide hover:bg-gray-800 transition btn-primary"
            >
              Explore Collection
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              href="#featured"
              className="inline-flex items-center justify-center px-8 py-4 border border-gray-300 text-gray-700 text-sm tracking-wide hover:border-gray-400 transition"
            >
              View Featured Works
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
      </section>

      {/* Featured Works */}
      <section id="featured" className="py-24 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-sm text-gray-500 tracking-widest uppercase mb-2">Collection</p>
              <h2 className="text-3xl md:text-4xl font-serif font-light text-gray-900">
                Featured Works
              </h2>
            </div>
            <Link
              href="/gallery"
              className="hidden sm:flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 nav-link transition"
            >
              View All
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              <p className="text-gray-500 mb-2">No artworks yet</p>
              <p className="text-sm text-gray-400">Press Option + F3 to add your first artwork</p>
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
      <section className="py-24 px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm text-gray-500 tracking-widest uppercase mb-2">Premium Quality</p>
            <h2 className="text-3xl md:text-4xl font-serif font-light text-gray-900">
              Print Options
            </h2>
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
            ].map((option) => (
              <div
                key={option.name}
                className="text-center p-6 md:p-8 bg-[#fafafa] rounded-lg hover:bg-gray-100 transition group"
              >
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-5 text-gray-400 group-hover:text-gray-600 transition shadow-sm">
                  {option.icon}
                </div>
                <h3 className="font-medium text-gray-900 mb-2">{option.name}</h3>
                <p className="text-sm text-gray-500 mb-3 hidden md:block">{option.desc}</p>
                <p className="text-sm text-gray-900">From {option.from}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About/CTA Section */}
      <section className="py-24 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-light text-gray-900 mb-6">
            Every print tells a story
          </h2>
          <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto">
            Each piece in our collection is carefully crafted and printed on demand,
            ensuring the highest quality and minimal environmental impact.
          </p>
          <Link
            href="/gallery"
            className="inline-flex items-center justify-center px-8 py-4 bg-gray-900 text-white text-sm tracking-wide hover:bg-gray-800 transition btn-primary"
          >
            Start Your Collection
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-12 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <p className="text-xl tracking-tight font-light mb-2">
                <span className="font-serif italic">Art</span> Prints
              </p>
              <p className="text-sm text-gray-500">Original artwork, beautifully printed</p>
            </div>
            <div className="flex items-center gap-8 text-sm text-gray-500">
              <Link href="/gallery" className="hover:text-gray-900 transition">Gallery</Link>
              <Link href="/about" className="hover:text-gray-900 transition">About</Link>
              <Link href="/cart" className="hover:text-gray-900 transition">Cart</Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-100 text-center text-sm text-gray-400">
            <p>&copy; {new Date().getFullYear()} Art Prints. All rights reserved.</p>
            <p className="mt-1">Prints fulfilled with care by Printful</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
