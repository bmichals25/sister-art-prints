'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Artwork } from '@/lib/supabase';
import { ArtworkPositionerTabs } from './ArtworkPositioner';
import { PrintfulProductBrowser, PrintfulProductBrowserFullscreen } from './PrintfulProductBrowser';
import { useAdmin } from './AdminProvider';

interface AdminPanelProps {
  onClose: () => void;
}

export function AdminPanel({ onClose }: AdminPanelProps) {
  const { openDesignDrawer } = useAdmin();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [activeTab, setActiveTab] = useState<'artworks' | 'add' | 'design' | 'settings'>('artworks');

  const handleTabClick = (tab: typeof activeTab) => {
    if (tab === 'design') {
      openDesignDrawer();
    } else {
      setActiveTab(tab);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    setIsAuthenticated(!!session);
    setIsLoading(false);
    if (session) {
      loadArtworks();
    }
  }

  async function loadArtworks() {
    const { data, error } = await supabase
      .from('artworks')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setArtworks(data);
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthError('');
    setIsLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setAuthError(error.message);
      setIsLoading(false);
    } else {
      setIsAuthenticated(true);
      setIsLoading(false);
      loadArtworks();
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setAuthError('');
    setIsLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setAuthError(error.message);
      setIsLoading(false);
    } else {
      setAuthError('');
      setAuthMode('signin');
      setIsLoading(false);
      alert('Account created! Please check your email to verify, then sign in.');
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setArtworks([]);
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 admin-overlay">
        <div className="bg-white p-8 rounded-lg">
          <div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex admin-overlay">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[90vh] bg-white shadow-2xl rounded-2xl admin-panel overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-medium">Admin Panel</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {!isAuthenticated ? (
          /* Login/Signup Form */
          <div className="flex-1 flex items-center justify-center p-8">
            <form onSubmit={authMode === 'signin' ? handleLogin : handleSignUp} className="w-full max-w-sm space-y-6">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-light mb-2">
                  {authMode === 'signin' ? 'Welcome Back' : 'Create Account'}
                </h3>
                <p className="text-gray-500 text-sm">
                  {authMode === 'signin' ? 'Sign in to manage your gallery' : 'Sign up to start managing your gallery'}
                </p>
              </div>

              {authError && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">
                  {authError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition disabled:opacity-50"
              >
                {isLoading
                  ? (authMode === 'signin' ? 'Signing in...' : 'Creating account...')
                  : (authMode === 'signin' ? 'Sign In' : 'Create Account')}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode(authMode === 'signin' ? 'signup' : 'signin');
                    setAuthError('');
                  }}
                  className="text-sm text-gray-600 hover:text-gray-900 transition"
                >
                  {authMode === 'signin'
                    ? "Don't have an account? Sign up"
                    : 'Already have an account? Sign in'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Admin Dashboard */
          <>
            {/* Tabs */}
            <div className="flex border-b border-gray-100">
              {(['artworks', 'add', 'design', 'settings'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => handleTabClick(tab)}
                  className={`flex-1 py-3 text-sm font-medium transition ${
                    activeTab === tab && tab !== 'design'
                      ? 'text-gray-900 border-b-2 border-gray-900'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab === 'artworks' && 'Artworks'}
                  {tab === 'add' && 'Add'}
                  {tab === 'design' && (
                    <span className="flex items-center justify-center gap-1">
                      Design
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </span>
                  )}
                  {tab === 'settings' && 'Settings'}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'artworks' && (
                <ArtworkList artworks={artworks} onUpdate={loadArtworks} />
              )}
              {activeTab === 'add' && (
                <AddArtwork onSuccess={() => { loadArtworks(); setActiveTab('artworks'); }} />
              )}
              {activeTab === 'settings' && (
                <Settings onLogout={handleLogout} />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ArtworkList({ artworks, onUpdate }: { artworks: Artwork[]; onUpdate: () => void }) {
  const [editingArtwork, setEditingArtwork] = useState<Artwork | null>(null);

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this artwork?')) return;

    await supabase.from('artworks').delete().eq('id', id);
    onUpdate();
  }

  async function toggleFeatured(id: string, currentValue: boolean) {
    await supabase.from('artworks').update({ featured: !currentValue }).eq('id', id);
    onUpdate();
  }

  if (editingArtwork) {
    return (
      <EditArtwork
        artwork={editingArtwork}
        onSave={() => { setEditingArtwork(null); onUpdate(); }}
        onCancel={() => setEditingArtwork(null)}
      />
    );
  }

  if (artworks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-gray-500 mb-2">No artworks yet</p>
        <p className="text-sm text-gray-400">Add your first artwork to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500 mb-4">Click on an artwork to edit it</p>
      {artworks.map((artwork) => (
        <div
          key={artwork.id}
          onClick={() => setEditingArtwork(artwork)}
          className="flex gap-4 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition"
        >
          <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
            {artwork.image_url ? (
              <img
                src={artwork.image_url}
                alt={artwork.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-900 truncate">{artwork.title}</h4>
            <p className="text-sm text-gray-500">{artwork.artist_name}</p>
            <p className="text-sm text-gray-900 mt-1">${artwork.price_base}</p>
            {(artwork as Artwork & { published_by_email?: string }).published_by_email && (
              <p className="text-xs text-gray-400 mt-1">
                by {(artwork as Artwork & { published_by_email?: string }).published_by_email}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => toggleFeatured(artwork.id, artwork.featured)}
              className={`px-3 py-1 text-xs rounded-full transition ${
                artwork.featured
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              {artwork.featured ? 'Featured' : 'Feature'}
            </button>
            <button
              onClick={() => handleDelete(artwork.id)}
              className="px-3 py-1 text-xs bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// Print options organized by orientation
const PRINT_OPTIONS_BY_ORIENTATION = {
  portrait: [
    { id: 'poster-12x18', type: 'poster', label: 'Poster 12×18"', size: '12×18"', price: 24.99 },
    { id: 'poster-18x24', type: 'poster', label: 'Poster 18×24"', size: '18×24"', price: 34.99 },
    { id: 'poster-24x36', type: 'poster', label: 'Poster 24×36"', size: '24×36"', price: 44.99 },
    { id: 'canvas-12x16', type: 'canvas', label: 'Canvas 12×16"', size: '12×16"', price: 49.99 },
    { id: 'canvas-18x24', type: 'canvas', label: 'Canvas 18×24"', size: '18×24"', price: 79.99 },
    { id: 'canvas-24x36', type: 'canvas', label: 'Canvas 24×36"', size: '24×36"', price: 119.99 },
    { id: 'framed-12x18', type: 'framed', label: 'Framed 12×18"', size: '12×18"', price: 59.99 },
    { id: 'framed-18x24', type: 'framed', label: 'Framed 18×24"', size: '18×24"', price: 89.99 },
    { id: 'framed-24x36', type: 'framed', label: 'Framed 24×36"', size: '24×36"', price: 129.99 },
  ],
  landscape: [
    { id: 'poster-18x12', type: 'poster', label: 'Poster 18×12"', size: '18×12"', price: 24.99 },
    { id: 'poster-24x18', type: 'poster', label: 'Poster 24×18"', size: '24×18"', price: 34.99 },
    { id: 'poster-36x24', type: 'poster', label: 'Poster 36×24"', size: '36×24"', price: 44.99 },
    { id: 'canvas-16x12', type: 'canvas', label: 'Canvas 16×12"', size: '16×12"', price: 49.99 },
    { id: 'canvas-24x18', type: 'canvas', label: 'Canvas 24×18"', size: '24×18"', price: 79.99 },
    { id: 'canvas-36x24', type: 'canvas', label: 'Canvas 36×24"', size: '36×24"', price: 119.99 },
    { id: 'framed-18x12', type: 'framed', label: 'Framed 18×12"', size: '18×12"', price: 59.99 },
    { id: 'framed-24x18', type: 'framed', label: 'Framed 24×18"', size: '24×18"', price: 89.99 },
    { id: 'framed-36x24', type: 'framed', label: 'Framed 36×24"', size: '36×24"', price: 129.99 },
  ],
};

// Default product types
const DEFAULT_PRODUCT_TYPES = ['poster', 'canvas', 'framed'];

// Helper to get print options for current orientation
const getPrintOptions = (orientation: 'portrait' | 'landscape') => PRINT_OPTIONS_BY_ORIENTATION[orientation];

// Custom product type interface
interface CustomProduct {
  id: string;
  name: string;
  printfulProductId?: number;
  productImage?: string;
  variants: Array<{
    id: string;
    printfulVariantId?: number;
    size: string;
    color?: string;
    price: number;
  }>;
}

interface ArtworkPosition {
  scale: number;
  offsetX: number;
  offsetY: number;
}

type EditSection = 'details' | 'prints' | 'positioning';

function EditArtwork({ artwork, onSave, onCancel }: { artwork: Artwork; onSave: () => void; onCancel: () => void }) {
  const [isSaving, setIsSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<EditSection>('details');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(
    (artwork as Artwork & { orientation?: 'portrait' | 'landscape' }).orientation || 'portrait'
  );
  const [formData, setFormData] = useState({
    title: artwork.title,
    description: artwork.description || '',
    artist_name: artwork.artist_name,
    featured: artwork.featured,
  });
  const [enabledPrints, setEnabledPrints] = useState<string[]>(
    (artwork as Artwork & { enabled_prints?: string[] }).enabled_prints || getPrintOptions(orientation).map(p => p.id)
  );
  // Custom prices for each print option (overrides default prices)
  const [customPrices, setCustomPrices] = useState<Record<string, number>>(
    (artwork as Artwork & { custom_prices?: Record<string, number> }).custom_prices || {}
  );
  const [artworkPositions, setArtworkPositions] = useState<Record<string, ArtworkPosition>>(
    (artwork as Artwork & { artwork_positions?: Record<string, ArtworkPosition> }).artwork_positions || {}
  );
  const [customProducts, setCustomProducts] = useState<CustomProduct[]>(
    (artwork as Artwork & { custom_products?: CustomProduct[] }).custom_products || []
  );
  // All sections collapsed by default
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    poster: true,
    canvas: true,
    framed: true,
  });
  const [showAddProduct, setShowAddProduct] = useState(false);

  const handlePositionsChange = useCallback((positions: Record<string, ArtworkPosition>) => {
    setArtworkPositions(positions);
  }, []);

  const toggleSection = (sectionId: string) => {
    setCollapsedSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const addCustomProduct = (product: {
    name: string;
    printfulProductId: number;
    productImage: string;
    variants: Array<{ id: number; name: string; size: string; color: string; price: number }>;
  }) => {
    const productId = product.name.toLowerCase().replace(/\s+/g, '-');
    if (customProducts.some(p => p.id === productId) || DEFAULT_PRODUCT_TYPES.includes(productId)) {
      alert('A product with this name already exists');
      return;
    }
    const newProduct: CustomProduct = {
      id: productId,
      name: product.name,
      printfulProductId: product.printfulProductId,
      productImage: product.productImage,
      variants: product.variants.map(v => ({
        id: `${productId}-${v.size.toLowerCase().replace(/\s+/g, '-')}`,
        printfulVariantId: v.id,
        size: v.size,
        color: v.color,
        price: v.price,
      })),
    };
    setCustomProducts([...customProducts, newProduct]);
    setShowAddProduct(false);
    // Enable all variants by default
    setEnabledPrints(prev => [...prev, ...newProduct.variants.map(v => v.id)]);
  };

  const removeCustomProduct = (productId: string) => {
    setCustomProducts(customProducts.filter(p => p.id !== productId));
    setEnabledPrints(enabledPrints.filter(id => !id.startsWith(`${productId}-`)));
  };

  // Get price for a print option (custom price overrides default)
  const getPrice = (optionId: string, defaultPrice: number) => {
    return customPrices[optionId] ?? defaultPrice;
  };

  // Set custom price for an option
  const setPrice = (optionId: string, price: number) => {
    setCustomPrices(prev => ({ ...prev, [optionId]: price }));
  };

  // When orientation changes, reset enabled prints to new orientation's options
  function handleOrientationChange(newOrientation: 'portrait' | 'landscape') {
    setOrientation(newOrientation);
    setEnabledPrints(getPrintOptions(newOrientation).map(p => p.id));
  }

  async function handleSubmit() {
    setIsSaving(true);

    const { error } = await supabase
      .from('artworks')
      .update({
        title: formData.title,
        description: formData.description,
        artist_name: formData.artist_name,
        featured: formData.featured,
        orientation: orientation,
        enabled_prints: enabledPrints,
        artwork_positions: artworkPositions,
        custom_products: customProducts,
        custom_prices: customPrices,
      })
      .eq('id', artwork.id);

    if (error) {
      setIsSaving(false);
      alert('Failed to save. Please try again.');
    } else {
      // Trigger mockup pre-generation in background
      fetch('/api/mockups/pregenerate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artworkId: artwork.id, orientation }),
      }).catch(console.error);

      setIsSaving(false);
      onSave();
    }
  }

  function togglePrint(printId: string) {
    setEnabledPrints(prev =>
      prev.includes(printId)
        ? prev.filter(id => id !== printId)
        : [...prev, printId]
    );
  }

  const sections: { id: EditSection; label: string; icon: React.ReactNode }[] = [
    {
      id: 'details',
      label: 'Details',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
    },
    {
      id: 'prints',
      label: 'Print Options',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
        </svg>
      ),
    },
    {
      id: 'positioning',
      label: 'Positioning',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
        </svg>
      ),
    },
  ];

  // Full-screen Printful Product Browser
  if (showAddProduct) {
    return (
      <div className="flex flex-col h-full -m-6">
        {/* Header */}
        <div className="flex items-center gap-4 p-4 border-b border-gray-100 bg-gray-50">
          <button
            type="button"
            onClick={() => setShowAddProduct(false)}
            className="p-2 text-gray-500 hover:text-gray-700 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex-1">
            <h3 className="font-medium text-gray-900">Add Product from Printful</h3>
            <p className="text-sm text-gray-500">Browse and select products to add</p>
          </div>
        </div>

        {/* Full-height browser */}
        <div className="flex-1 overflow-y-auto p-4">
          <PrintfulProductBrowserFullscreen
            onSelect={(product) => {
              addCustomProduct(product);
            }}
            onCancel={() => setShowAddProduct(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full -m-6">
      {/* Header with Preview */}
      <div className="flex items-center gap-4 p-4 border-b border-gray-100 bg-gray-50">
        <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
          <img
            src={artwork.image_url}
            alt={artwork.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 truncate">{formData.title || 'Edit Artwork'}</h3>
          <p className="text-sm text-gray-500">{formData.artist_name}</p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="p-2 text-gray-400 hover:text-gray-600 transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Section Tabs */}
      <div className="flex border-b border-gray-100">
        {sections.map((section) => (
          <button
            key={section.id}
            type="button"
            onClick={() => setActiveSection(section.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition ${
              activeSection === section.id
                ? 'text-gray-900 border-b-2 border-gray-900 bg-white'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            {section.icon}
            {section.label}
          </button>
        ))}
      </div>

      {/* Section Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Details Section */}
        {activeSection === 'details' && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Artist Name</label>
              <input
                type="text"
                value={formData.artist_name}
                onChange={(e) => setFormData({ ...formData, artist_name: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none text-sm"
                rows={3}
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="edit-featured-checkbox"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
              />
              <label htmlFor="edit-featured-checkbox" className="text-sm text-gray-700 cursor-pointer">
                Feature on homepage
              </label>
            </div>
          </div>
        )}

        {/* Print Options Section */}
        {activeSection === 'prints' && (
          <div className="space-y-4">
            {/* Orientation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Orientation</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleOrientationChange('portrait')}
                  className={`p-2.5 rounded-lg border-2 transition flex items-center justify-center gap-2 ${
                    orientation === 'portrait'
                      ? 'border-gray-900 bg-gray-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-5 h-7 rounded border-2 ${orientation === 'portrait' ? 'border-gray-900 bg-gray-200' : 'border-gray-300'}`} />
                  <span className="text-sm font-medium">Portrait</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOrientationChange('landscape')}
                  className={`p-2.5 rounded-lg border-2 transition flex items-center justify-center gap-2 ${
                    orientation === 'landscape'
                      ? 'border-gray-900 bg-gray-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-7 h-5 rounded border-2 ${orientation === 'landscape' ? 'border-gray-900 bg-gray-200' : 'border-gray-300'}`} />
                  <span className="text-sm font-medium">Landscape</span>
                </button>
              </div>
            </div>

            {/* Default Print Types - Collapsible */}
            <div className="space-y-2">
              {DEFAULT_PRODUCT_TYPES.map((type) => {
                const options = getPrintOptions(orientation).filter(p => p.type === type);
                const enabledCount = options.filter(o => enabledPrints.includes(o.id)).length;
                const isCollapsed = collapsedSections[type];

                return (
                  <div key={type} className="border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      type="button"
                      onClick={() => toggleSection(type)}
                      className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition"
                    >
                      <div className="flex items-center gap-2">
                        <svg
                          className={`w-4 h-4 text-gray-400 transition-transform ${isCollapsed ? '' : 'rotate-90'}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        <span className="text-sm font-medium text-gray-700 capitalize">{type}</span>
                      </div>
                      <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded-full">
                        {enabledCount}/{options.length}
                      </span>
                    </button>
                    {!isCollapsed && (
                      <div className="p-3 space-y-2">
                        {options.map((option) => {
                          const isEnabled = enabledPrints.includes(option.id);
                          const currentPrice = getPrice(option.id, option.price);
                          return (
                            <div
                              key={option.id}
                              className={`flex items-center gap-3 p-2 rounded-lg transition ${
                                isEnabled ? 'bg-gray-100' : 'bg-gray-50 opacity-60'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isEnabled}
                                onChange={() => togglePrint(option.id)}
                                className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                              />
                              <span className="flex-1 text-sm font-medium text-gray-700">{option.size}</span>
                              <div className="flex items-center gap-1">
                                <span className="text-gray-400 text-sm">$</span>
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={currentPrice}
                                  onChange={(e) => setPrice(option.id, parseFloat(e.target.value) || 0)}
                                  className="w-16 px-2 py-1 text-sm text-right border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-400"
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Custom Products - Collapsible */}
              {customProducts.map((product) => {
                const enabledCount = product.variants.filter(v => enabledPrints.includes(v.id)).length;
                const isCollapsed = collapsedSections[product.id];
                return (
                  <div key={product.id} className="border border-blue-200 rounded-lg overflow-hidden bg-blue-50/30">
                    <button
                      type="button"
                      onClick={() => toggleSection(product.id)}
                      className="w-full flex items-center justify-between p-3 bg-blue-50 hover:bg-blue-100 transition"
                    >
                      <div className="flex items-center gap-2">
                        <svg
                          className={`w-4 h-4 text-blue-400 transition-transform ${isCollapsed ? '' : 'rotate-90'}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        <span className="text-sm font-medium text-blue-700">{product.name}</span>
                        <span className="text-xs text-blue-500 bg-blue-100 px-1.5 py-0.5 rounded">Printful</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-blue-500 bg-white px-2 py-0.5 rounded-full">
                          {enabledCount}/{product.variants.length}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); removeCustomProduct(product.id); }}
                          className="p-1 text-red-400 hover:text-red-600 transition"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </button>
                    {!isCollapsed && (
                      <div className="p-3 space-y-2">
                        {product.variants.map((variant) => {
                          const isEnabled = enabledPrints.includes(variant.id);
                          const currentPrice = getPrice(variant.id, variant.price);
                          return (
                            <div
                              key={variant.id}
                              className={`flex items-center gap-3 p-2 rounded-lg transition ${
                                isEnabled ? 'bg-blue-50' : 'bg-gray-50 opacity-60'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isEnabled}
                                onChange={() => togglePrint(variant.id)}
                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <div className="flex-1 min-w-0">
                                <span className="text-sm font-medium text-gray-700">{variant.size}</span>
                                {variant.color && (
                                  <span className="text-xs text-gray-500 ml-2">({variant.color})</span>
                                )}
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-gray-400 text-sm">$</span>
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={currentPrice}
                                  onChange={(e) => setPrice(variant.id, parseFloat(e.target.value) || 0)}
                                  className="w-16 px-2 py-1 text-sm text-right border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Add Custom Product Button */}
            <button
              type="button"
              onClick={() => setShowAddProduct(true)}
              className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-gray-400 hover:text-gray-700 transition flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Product from Printful Catalog
            </button>
          </div>
        )}

        {/* Positioning Section */}
        {activeSection === 'positioning' && (
          <div>
            <ArtworkPositionerTabs
              imageUrl={artwork.image_url}
              orientation={orientation}
              positions={artworkPositions}
              onPositionsChange={handlePositionsChange}
              customProducts={customProducts}
            />
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex gap-3 p-4 border-t border-gray-100 bg-white">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2.5 border border-gray-200 rounded-lg font-medium text-sm hover:bg-gray-50 transition"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSaving}
          className="flex-1 bg-gray-900 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-gray-800 transition disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}

function AddArtwork({ onSuccess }: { onSuccess: () => void }) {
  const [isUploading, setIsUploading] = useState(false);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    artist_name: '',
    price_base: '29.99',
    featured: false,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!imageFile) {
      alert('Please select an image');
      return;
    }

    setIsUploading(true);

    try {
      // Upload image to Supabase Storage
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('artworks')
        .upload(fileName, imageFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('artworks')
        .getPublicUrl(fileName);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      // Create artwork record
      const { data: insertedArtwork, error: insertError } = await supabase
        .from('artworks')
        .insert({
          title: formData.title,
          description: formData.description,
          artist_name: formData.artist_name,
          price_base: parseFloat(formData.price_base),
          featured: formData.featured,
          orientation: orientation,
          image_url: urlData.publicUrl,
          thumbnail_url: urlData.publicUrl,
          tags: [],
          published_by: user?.id,
          published_by_email: user?.email,
        })
        .select('id')
        .single();

      if (insertError) throw insertError;

      // Trigger mockup pre-generation in background
      if (insertedArtwork?.id) {
        fetch('/api/mockups/pregenerate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ artworkId: insertedArtwork.id, orientation }),
        }).catch(console.error);
      }

      onSuccess();
    } catch (error) {
      console.error('Error adding artwork:', error);
      alert('Failed to add artwork. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Artwork Image
        </label>
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition ${
            imagePreview ? 'border-gray-300' : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          {imagePreview ? (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="max-h-48 mx-auto rounded-lg"
              />
              <button
                type="button"
                onClick={() => { setImageFile(null); setImagePreview(null); }}
                className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-lg hover:bg-gray-100"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <label className="cursor-pointer">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <p className="text-sm text-gray-600">Click to upload artwork</p>
              <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 10MB</p>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Title
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          placeholder="Artwork title"
          required
        />
      </div>

      {/* Artist Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Artist Name
        </label>
        <input
          type="text"
          value={formData.artist_name}
          onChange={(e) => setFormData({ ...formData, artist_name: e.target.value })}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          placeholder="Artist name"
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
          rows={3}
          placeholder="Describe the artwork..."
        />
      </div>

      {/* Orientation */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Print Orientation</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setOrientation('portrait')}
            className={`p-4 rounded-lg border-2 transition flex flex-col items-center gap-2 ${
              orientation === 'portrait'
                ? 'border-gray-900 bg-gray-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className={`w-8 h-12 rounded border-2 ${orientation === 'portrait' ? 'border-gray-900 bg-gray-200' : 'border-gray-300'}`} />
            <span className="text-sm font-medium">Portrait</span>
          </button>
          <button
            type="button"
            onClick={() => setOrientation('landscape')}
            className={`p-4 rounded-lg border-2 transition flex flex-col items-center gap-2 ${
              orientation === 'landscape'
                ? 'border-gray-900 bg-gray-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className={`w-12 h-8 rounded border-2 ${orientation === 'landscape' ? 'border-gray-900 bg-gray-200' : 'border-gray-300'}`} />
            <span className="text-sm font-medium">Landscape</span>
          </button>
        </div>
      </div>

      {/* Price */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Base Price ($)
        </label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={formData.price_base}
          onChange={(e) => setFormData({ ...formData, price_base: e.target.value })}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          required
        />
      </div>

      {/* Featured */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="featured"
          checked={formData.featured}
          onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
          className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
        />
        <label htmlFor="featured" className="text-sm text-gray-700">
          Feature on homepage
        </label>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isUploading}
        className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition disabled:opacity-50"
      >
        {isUploading ? 'Uploading...' : 'Add Artwork'}
      </button>
    </form>
  );
}

interface StoreSettings {
  id: string;
  store_name: string;
  tagline: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  font_heading: string;
  font_body: string;
  vibe: string;
  hero_title: string;
  hero_subtitle: string;
}

const VIBES = [
  { id: 'minimal', name: 'Minimal', desc: 'Clean, simple, lots of whitespace' },
  { id: 'warm', name: 'Warm', desc: 'Earthy tones, cozy feeling' },
  { id: 'bold', name: 'Bold', desc: 'Strong colors, high contrast' },
  { id: 'elegant', name: 'Elegant', desc: 'Sophisticated, refined aesthetic' },
  { id: 'playful', name: 'Playful', desc: 'Fun, colorful, energetic' },
];

const FONTS = [
  { heading: 'Playfair Display', body: 'Inter' },
  { heading: 'Cormorant Garamond', body: 'Lato' },
  { heading: 'Libre Baskerville', body: 'Source Sans Pro' },
  { heading: 'Montserrat', body: 'Open Sans' },
  { heading: 'Josefin Sans', body: 'Nunito' },
];

function DesignSettings() {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const { data, error: fetchError } = await supabase
        .from('store_settings')
        .select('*')
        .single();

      if (fetchError) {
        console.error('Error loading settings:', fetchError);
        if (fetchError.code === 'PGRST116') {
          // No rows found - try to create default settings
          const { data: newData, error: insertError } = await supabase
            .from('store_settings')
            .insert({})
            .select()
            .single();

          if (insertError) {
            setError('Please run the database schema in Supabase SQL Editor first.');
          } else if (newData) {
            setSettings(newData);
          }
        } else {
          setError('Database table not found. Please run the schema in Supabase SQL Editor.');
        }
      } else if (data) {
        setSettings(data);
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to connect to database.');
    }
    setIsLoading(false);
  }

  async function saveSettings() {
    if (!settings) return;
    setIsSaving(true);
    setSaveMessage('');

    const { error } = await supabase
      .from('store_settings')
      .update(settings)
      .eq('id', settings.id);

    setIsSaving(false);
    if (error) {
      setSaveMessage('Failed to save. Please try again.');
    } else {
      setSaveMessage('Settings saved! Refresh the page to see changes.');
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-6 h-6 border-2 border-gray-300 border-t-gray-900 rounded-full" />
      </div>
    );
  }

  if (error || !settings) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h4 className="font-medium text-gray-900 mb-2">Database Setup Required</h4>
        <p className="text-sm text-gray-600 mb-4">{error || 'Could not load store settings.'}</p>
        <a
          href="https://supabase.com/dashboard/project/cfvtatiddqeeknxdrqzp/sql"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
        >
          Open Supabase SQL Editor
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Store Info */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          Store Info
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Store Name</label>
            <input
              type="text"
              value={settings.store_name}
              onChange={(e) => setSettings({ ...settings, store_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Tagline</label>
            <input
              type="text"
              value={settings.tagline}
              onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Hero Section
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Hero Title</label>
            <input
              type="text"
              value={settings.hero_title}
              onChange={(e) => setSettings({ ...settings, hero_title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Hero Subtitle</label>
            <textarea
              value={settings.hero_subtitle}
              onChange={(e) => setSettings({ ...settings, hero_subtitle: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm resize-none"
            />
          </div>
        </div>
      </div>

      {/* Vibe */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
          Vibe
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {VIBES.map((vibe) => (
            <button
              key={vibe.id}
              onClick={() => setSettings({ ...settings, vibe: vibe.id })}
              className={`p-3 text-left rounded-lg border transition ${
                settings.vibe === vibe.id
                  ? 'border-gray-900 bg-gray-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-medium text-sm">{vibe.name}</div>
              <div className="text-xs text-gray-500">{vibe.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
          Colors
        </h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={settings.primary_color}
              onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
              className="w-10 h-10 rounded border border-gray-200 cursor-pointer"
            />
            <div className="flex-1">
              <div className="text-sm text-gray-600">Primary (text, buttons)</div>
              <div className="text-xs text-gray-400 font-mono">{settings.primary_color}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={settings.secondary_color}
              onChange={(e) => setSettings({ ...settings, secondary_color: e.target.value })}
              className="w-10 h-10 rounded border border-gray-200 cursor-pointer"
            />
            <div className="flex-1">
              <div className="text-sm text-gray-600">Background</div>
              <div className="text-xs text-gray-400 font-mono">{settings.secondary_color}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={settings.accent_color}
              onChange={(e) => setSettings({ ...settings, accent_color: e.target.value })}
              className="w-10 h-10 rounded border border-gray-200 cursor-pointer"
            />
            <div className="flex-1">
              <div className="text-sm text-gray-600">Accent</div>
              <div className="text-xs text-gray-400 font-mono">{settings.accent_color}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Fonts */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8m-8 6h16" />
          </svg>
          Typography
        </h3>
        <div className="space-y-2">
          {FONTS.map((font) => (
            <button
              key={font.heading}
              onClick={() => setSettings({ ...settings, font_heading: font.heading, font_body: font.body })}
              className={`w-full p-3 text-left rounded-lg border transition ${
                settings.font_heading === font.heading
                  ? 'border-gray-900 bg-gray-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-medium text-sm">{font.heading}</div>
              <div className="text-xs text-gray-500">Body: {font.body}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="pt-4 border-t border-gray-100">
        {saveMessage && (
          <p className={`text-sm mb-3 ${saveMessage.includes('Failed') ? 'text-red-600' : 'text-green-600'}`}>
            {saveMessage}
          </p>
        )}
        <button
          onClick={saveSettings}
          disabled={isSaving}
          className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save Design Settings'}
        </button>
      </div>
    </div>
  );
}

function Settings({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="space-y-6">
      <div className="p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Storage</h4>
        <p className="text-sm text-gray-600">
          Images are stored in Supabase Storage
        </p>
      </div>

      <div className="p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Supabase Setup</h4>
        <p className="text-sm text-gray-600 mb-2">
          Remember to run the schema SQL and create a storage bucket named &ldquo;artworks&rdquo;
        </p>
        <a
          href="https://supabase.com/dashboard/project/cfvtatiddqeeknxdrqzp"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:underline"
        >
          Open Supabase Dashboard
        </a>
      </div>

      <button
        onClick={onLogout}
        className="w-full py-3 border border-red-200 text-red-600 rounded-lg font-medium hover:bg-red-50 transition"
      >
        Sign Out
      </button>
    </div>
  );
}
