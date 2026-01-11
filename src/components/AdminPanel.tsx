'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Artwork } from '@/lib/supabase';
import { ArtworkPositionerTabs } from './ArtworkPositioner';

interface AdminPanelProps {
  onClose: () => void;
}

export function AdminPanel({ onClose }: AdminPanelProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [activeTab, setActiveTab] = useState<'artworks' | 'add' | 'design' | 'settings'>('artworks');

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
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-xl bg-white shadow-2xl admin-panel overflow-hidden flex flex-col">
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
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-3 text-sm font-medium transition ${
                    activeTab === tab
                      ? 'text-gray-900 border-b-2 border-gray-900'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab === 'artworks' && 'Artworks'}
                  {tab === 'add' && 'Add'}
                  {tab === 'design' && 'Design'}
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
              {activeTab === 'design' && (
                <DesignSettings />
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

const PRINT_OPTIONS = [
  { id: 'poster-12x18', type: 'poster', label: 'Poster 12x18"', price: 24.99 },
  { id: 'poster-18x24', type: 'poster', label: 'Poster 18x24"', price: 34.99 },
  { id: 'poster-24x36', type: 'poster', label: 'Poster 24x36"', price: 44.99 },
  { id: 'canvas-12x16', type: 'canvas', label: 'Canvas 12x16"', price: 49.99 },
  { id: 'canvas-18x24', type: 'canvas', label: 'Canvas 18x24"', price: 79.99 },
  { id: 'canvas-24x36', type: 'canvas', label: 'Canvas 24x36"', price: 119.99 },
  { id: 'framed-12x18', type: 'framed', label: 'Framed 12x18"', price: 59.99 },
  { id: 'framed-18x24', type: 'framed', label: 'Framed 18x24"', price: 89.99 },
  { id: 'framed-24x36', type: 'framed', label: 'Framed 24x36"', price: 129.99 },
];

interface ArtworkPosition {
  scale: number;
  offsetX: number;
  offsetY: number;
}

function EditArtwork({ artwork, onSave, onCancel }: { artwork: Artwork; onSave: () => void; onCancel: () => void }) {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: artwork.title,
    description: artwork.description || '',
    artist_name: artwork.artist_name,
    price_base: artwork.price_base.toString(),
    featured: artwork.featured,
  });
  const [enabledPrints, setEnabledPrints] = useState<string[]>(
    (artwork as Artwork & { enabled_prints?: string[] }).enabled_prints || PRINT_OPTIONS.map(p => p.id)
  );
  const [artworkPositions, setArtworkPositions] = useState<Record<string, ArtworkPosition>>(
    (artwork as Artwork & { artwork_positions?: Record<string, ArtworkPosition> }).artwork_positions || {}
  );

  const handlePositionsChange = useCallback((positions: Record<string, ArtworkPosition>) => {
    setArtworkPositions(positions);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);

    const { error } = await supabase
      .from('artworks')
      .update({
        title: formData.title,
        description: formData.description,
        artist_name: formData.artist_name,
        price_base: parseFloat(formData.price_base),
        featured: formData.featured,
        enabled_prints: enabledPrints,
        artwork_positions: artworkPositions,
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
        body: JSON.stringify({ artworkId: artwork.id }),
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <h3 className="font-medium text-gray-900">Edit Artwork</h3>
        <button
          type="button"
          onClick={onCancel}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Cancel
        </button>
      </div>

      {/* Preview */}
      <div className="flex items-center gap-4">
        <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
          <img
            src={artwork.image_url}
            alt={artwork.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <p className="text-sm text-gray-500">Current image</p>
          <p className="text-xs text-gray-400 mt-1">Image cannot be changed</p>
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
          required
        />
      </div>

      {/* Artist */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Artist Name</label>
        <input
          type="text"
          value={formData.artist_name}
          onChange={(e) => setFormData({ ...formData, artist_name: e.target.value })}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
          rows={3}
        />
      </div>

      {/* Price */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Base Price ($)</label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={formData.price_base}
          onChange={(e) => setFormData({ ...formData, price_base: e.target.value })}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
          required
        />
      </div>

      {/* Featured */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="edit-featured"
          checked={formData.featured}
          onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
          className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
        />
        <label htmlFor="edit-featured" className="text-sm text-gray-700">
          Feature on homepage
        </label>
      </div>

      {/* Print Options */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Available Print Options</label>
        <div className="space-y-2">
          {['poster', 'canvas', 'framed'].map((type) => (
            <div key={type} className="mb-4">
              <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">{type}</h4>
              <div className="space-y-2">
                {PRINT_OPTIONS.filter(p => p.type === type).map((option) => (
                  <label
                    key={option.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition"
                  >
                    <input
                      type="checkbox"
                      checked={enabledPrints.includes(option.id)}
                      onChange={() => togglePrint(option.id)}
                      className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                    />
                    <span className="flex-1 text-sm">{option.label}</span>
                    <span className="text-sm text-gray-500">${option.price}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Artwork Positioning */}
      <div className="border-t border-gray-100 pt-6">
        <ArtworkPositionerTabs
          imageUrl={artwork.image_url}
          positions={artworkPositions}
          onPositionsChange={handlePositionsChange}
        />
      </div>

      {/* Submit */}
      <div className="flex gap-3 pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 border border-gray-200 rounded-lg font-medium hover:bg-gray-50 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="flex-1 bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}

function AddArtwork({ onSuccess }: { onSuccess: () => void }) {
  const [isUploading, setIsUploading] = useState(false);
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
          body: JSON.stringify({ artworkId: insertedArtwork.id }),
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
