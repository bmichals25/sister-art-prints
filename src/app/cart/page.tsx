'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice, totalItems, clearCart } = useCart();

  const formatProductType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

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
              <span className="text-sm text-gray-900 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Cart ({totalItems})
              </span>
            </nav>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-16 px-6 lg:px-8 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-[#e8a87c]/5 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-[#f5d4be]/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto relative">
          {/* Header */}
          <div className="mb-12">
            <nav className="text-sm text-gray-500 mb-4">
              <Link href="/" className="hover:text-[#d4846a] transition">Home</Link>
              <span className="mx-2 text-[#e8a87c]">/</span>
              <span className="text-gray-900">Cart</span>
            </nav>
            <h1 className="text-5xl md:text-7xl font-serif font-light text-gray-900 mb-6 fade-in">
              <span className="gradient-text">Your Cart</span>
            </h1>
            <div className="mt-6 w-24 h-0.5 bg-gradient-to-r from-[#e8a87c] to-transparent fade-in fade-in-delay-2" />
          </div>

          {items.length === 0 ? (
            /* Empty Cart */
            <div className="text-center py-32 relative">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-64 h-64 rounded-full bg-gradient-to-br from-[#e8a87c]/10 to-transparent blur-3xl" />
              </div>
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-[#fff8f3] to-[#f5d4be]/30 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg">
                  <svg className="w-12 h-12 text-[#d4846a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-serif font-light text-gray-900 mb-3">Your cart is empty</h3>
                <p className="text-gray-500 text-lg mb-8">Discover beautiful artwork to add to your collection</p>
                <Link
                  href="/gallery"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#d4846a] to-[#e8a87c] text-white rounded-full hover:shadow-lg hover:shadow-[#e8a87c]/25 transition-all duration-300"
                >
                  Browse Gallery
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>
          ) : (
            /* Cart with items */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-6">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100/50 flex gap-6 fade-in"
                  >
                    {/* Product Image */}
                    <div className="w-32 h-32 flex-shrink-0 rounded-xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                      {item.mockupUrl ? (
                        <img
                          src={item.mockupUrl}
                          alt={`${item.artworkTitle} - ${formatProductType(item.productType)}`}
                          className="w-full h-full object-cover"
                        />
                      ) : item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.artworkTitle}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-8 h-8 text-[#e8a87c]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 truncate">{item.artworkTitle}</h3>
                          <p className="text-sm text-gray-500">{item.artistName}</p>
                          <div className="mt-2 flex items-center gap-3">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#fff8f3] text-[#d4846a] border border-[#e8a87c]/20">
                              {formatProductType(item.productType)}
                            </span>
                            <span className="text-sm text-gray-600">{item.size}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-2 text-gray-400 hover:text-red-500 transition"
                          title="Remove item"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:border-[#e8a87c] hover:text-[#d4846a] transition"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </button>
                          <span className="w-8 text-center font-medium text-gray-900">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:border-[#e8a87c] hover:text-[#d4846a] transition"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>

                        {/* Price */}
                        <p className="text-lg font-medium text-[#d4846a]">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Clear Cart */}
                <div className="flex justify-end">
                  <button
                    onClick={clearCart}
                    className="text-sm text-gray-500 hover:text-red-500 transition flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Clear cart
                  </button>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100/50 sticky top-24">
                  <h2 className="text-xl font-serif font-light text-gray-900 mb-6">Order Summary</h2>

                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal ({totalItems} items)</span>
                      <span>${totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Shipping</span>
                      <span className="text-[#d4846a]">Calculated at checkout</span>
                    </div>
                    <div className="border-t border-gray-100 pt-4">
                      <div className="flex justify-between text-lg font-medium text-gray-900">
                        <span>Total</span>
                        <span>${totalPrice.toFixed(2)}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Tax included where applicable</p>
                    </div>
                  </div>

                  <button
                    className="w-full py-4 bg-gradient-to-r from-[#d4846a] to-[#e8a87c] text-white rounded-full font-medium hover:shadow-lg hover:shadow-[#e8a87c]/25 transition-all duration-300"
                  >
                    Proceed to Checkout
                  </button>

                  <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Secure checkout powered by Stripe
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <Link
                      href="/gallery"
                      className="flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-[#d4846a] transition"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                      </svg>
                      Continue Shopping
                    </Link>
                  </div>
                </div>
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
