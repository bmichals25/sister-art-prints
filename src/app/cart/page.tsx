'use client';

import { useState } from 'react';
import Link from 'next/link';

// Demo cart items - will use localStorage/state management
const demoCartItems = [
  {
    id: '1',
    artworkId: '1',
    artworkTitle: 'Sunset Over Mountains',
    printType: 'Poster',
    size: '18×24"',
    price: 34.99,
    quantity: 1,
    variantId: 2,
  },
];

export default function CartPage() {
  const [cartItems, setCartItems] = useState(demoCartItems);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal >= 100 ? 0 : 9.99;
  const total = subtotal + shipping;

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) {
      setCartItems(cartItems.filter((item) => item.id !== id));
    } else {
      setCartItems(
        cartItems.map((item) =>
          item.id === id ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const handleCheckout = async () => {
    setIsCheckingOut(true);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cartItems.map((item) => ({
            name: `${item.artworkTitle} - ${item.printType} ${item.size}`,
            description: `${item.printType} print, ${item.size}`,
            price: item.price,
            quantity: item.quantity,
            artworkId: item.artworkId,
            variantId: item.variantId,
          })),
        }),
      });

      const { url, error } = await response.json();

      if (error) {
        throw new Error(error);
      }

      window.location.href = url;
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to start checkout. Please try again.');
      setIsCheckingOut(false);
    }
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
              <span className="text-gray-900">Cart ({cartItems.length})</span>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-light text-gray-900 mb-8">Your Cart</h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 mb-6">Your cart is empty</p>
            <Link
              href="/gallery"
              className="inline-block bg-gray-900 text-white px-8 py-3 text-sm tracking-wide hover:bg-gray-800 transition"
            >
              Browse Gallery
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="divide-y divide-gray-100">
                {cartItems.map((item) => (
                  <div key={item.id} className="py-6 flex gap-6">
                    <div className="w-24 h-32 bg-gray-100 flex-shrink-0 flex items-center justify-center">
                      <span className="text-gray-400 text-xs">Preview</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-gray-900 mb-1">{item.artworkTitle}</h3>
                      <p className="text-sm text-gray-500 mb-4">
                        {item.printType} - {item.size}
                      </p>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center border border-gray-200">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="px-3 py-1 text-gray-600 hover:bg-gray-50"
                          >
                            -
                          </button>
                          <span className="px-3 py-1">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-3 py-1 text-gray-600 hover:bg-gray-50"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => updateQuantity(item.id, 0)}
                          className="text-sm text-gray-500 hover:text-gray-900"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="text-gray-900">${(item.price * item.quantity).toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-6">Order Summary</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-gray-900">
                      {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  {shipping > 0 && (
                    <p className="text-xs text-gray-500">
                      Free shipping on orders over $100
                    </p>
                  )}
                  <div className="border-t border-gray-200 pt-3 flex justify-between text-base">
                    <span className="font-medium">Total</span>
                    <span className="font-medium">${total.toFixed(2)}</span>
                  </div>
                </div>
                <button
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                  className="w-full mt-6 bg-gray-900 text-white py-3 text-sm tracking-wide hover:bg-gray-800 transition disabled:bg-gray-400"
                >
                  {isCheckingOut ? 'Processing...' : 'Checkout'}
                </button>
                <p className="mt-4 text-xs text-gray-500 text-center">
                  Secure checkout powered by Stripe
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
