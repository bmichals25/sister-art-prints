import Link from 'next/link';

export default function AboutPage() {
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
              <span className="text-sm text-gray-900">About</span>
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

      <main className="pt-24 pb-16 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <nav className="text-sm text-gray-500 mb-8">
            <Link href="/" className="hover:text-[#d4846a] transition">Home</Link>
            <span className="mx-2 text-[#e8a87c]">/</span>
            <span className="text-gray-900">About</span>
          </nav>

          {/* Hero */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-serif font-light text-gray-900 mb-6">
              About <span className="italic text-[#d4846a]">Katia</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Original artwork transformed into museum-quality prints,
              delivered with care to art lovers everywhere.
            </p>
          </div>

          {/* Artist Section */}
          <section className="mb-20">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="aspect-square bg-gradient-to-br from-[#f5d4be]/30 to-[#e8a87c]/20 rounded-2xl flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <svg className="w-24 h-24 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <p className="text-sm">Artist Photo</p>
                </div>
              </div>
              <div>
                <h2 className="text-3xl font-serif font-light text-gray-900 mb-4">The Artist</h2>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  Katia is a contemporary artist whose work explores the intersection of
                  nature, emotion, and abstract expression. Each piece is created with
                  intention and care, reflecting moments of beauty captured through
                  her unique artistic vision.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Her work has been featured in galleries across the country, and now
                  she's making her art accessible to everyone through high-quality
                  prints that bring the same vibrancy and detail as the originals.
                </p>
              </div>
            </div>
          </section>

          {/* Quality Section */}
          <section className="mb-20">
            <h2 className="text-3xl font-serif font-light text-gray-900 mb-8 text-center">
              Museum-Quality <span className="italic text-[#d4846a]">Prints</span>
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: 'Premium Materials',
                  description: 'Archival inks and museum-grade papers ensure your print lasts a lifetime.',
                  icon: (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  ),
                },
                {
                  title: 'Print on Demand',
                  description: 'Each print is made fresh when you order, reducing waste and ensuring quality.',
                  icon: (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                  ),
                },
                {
                  title: 'Worldwide Shipping',
                  description: 'Carefully packaged and shipped to your door, wherever you are in the world.',
                  icon: (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ),
                },
              ].map((item) => (
                <div key={item.title} className="text-center p-6 bg-white rounded-2xl shadow-sm">
                  <div className="w-16 h-16 bg-[#fff8f3] rounded-full flex items-center justify-center mx-auto mb-4 text-[#d4846a]">
                    {item.icon}
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="text-center py-16 px-8 bg-white rounded-2xl shadow-sm">
            <h2 className="text-3xl font-serif font-light text-gray-900 mb-4">
              Ready to find your <span className="italic text-[#d4846a]">perfect piece</span>?
            </h2>
            <p className="text-gray-600 mb-8 max-w-lg mx-auto">
              Browse the collection and bring original artwork into your home.
            </p>
            <Link
              href="/gallery"
              className="inline-flex items-center justify-center px-8 py-4 bg-gray-900 text-white text-sm tracking-wide rounded-full hover:bg-[#d4846a] transition-all shadow-lg hover:shadow-xl"
            >
              Explore the Gallery
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </section>
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
