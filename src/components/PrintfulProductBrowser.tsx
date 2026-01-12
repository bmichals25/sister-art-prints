'use client';

import { useState, useEffect } from 'react';

interface PrintfulProduct {
  id: number;
  type: string;
  type_name: string;
  brand: string | null;
  model: string;
  image: string;
  variant_count: number;
  description: string;
}

interface PrintfulVariant {
  id: number;
  product_id: number;
  name: string;
  size: string;
  color: string;
  color_code: string | null;
  price: string;
  in_stock: boolean;
}

interface SelectedVariant {
  id: number;
  name: string;
  size: string;
  color: string;
  price: number;
}

interface PrintfulProductBrowserProps {
  onSelect: (product: {
    name: string;
    printfulProductId: number;
    variants: SelectedVariant[];
  }) => void;
  onCancel: () => void;
}

export function PrintfulProductBrowser({ onSelect, onCancel }: PrintfulProductBrowserProps) {
  const [products, setProducts] = useState<PrintfulProduct[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<PrintfulProduct | null>(null);
  const [variants, setVariants] = useState<PrintfulVariant[]>([]);
  const [selectedVariants, setSelectedVariants] = useState<SelectedVariant[]>([]);
  const [loadingVariants, setLoadingVariants] = useState(false);

  // Fetch products on mount
  useEffect(() => {
    async function fetchProducts() {
      try {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (selectedCategory) params.set('category', selectedCategory);

        const response = await fetch(`/api/printful/products?${params}`);
        if (!response.ok) throw new Error('Failed to fetch products');

        const data = await response.json();
        setProducts(data.products);
        setCategories(data.categories);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load products');
        setLoading(false);
      }
    }

    fetchProducts();
  }, [search, selectedCategory]);

  // Fetch variants when product is selected
  useEffect(() => {
    if (!selectedProduct) {
      setVariants([]);
      setSelectedVariants([]);
      return;
    }

    const productId = selectedProduct.id;

    async function fetchVariants() {
      setLoadingVariants(true);
      try {
        const response = await fetch(`/api/printful/products?productId=${productId}`);
        if (!response.ok) throw new Error('Failed to fetch variants');

        const data = await response.json();
        setVariants(data.variants);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load variants');
      } finally {
        setLoadingVariants(false);
      }
    }

    fetchVariants();
  }, [selectedProduct]);

  const toggleVariant = (variant: PrintfulVariant) => {
    const existing = selectedVariants.find(v => v.id === variant.id);
    if (existing) {
      setSelectedVariants(prev => prev.filter(v => v.id !== variant.id));
    } else {
      setSelectedVariants(prev => [...prev, {
        id: variant.id,
        name: variant.name,
        size: variant.size,
        color: variant.color,
        price: parseFloat(variant.price) || 0,
      }]);
    }
  };

  const updateVariantPrice = (variantId: number, price: number) => {
    setSelectedVariants(prev => prev.map(v =>
      v.id === variantId ? { ...v, price } : v
    ));
  };

  const handleConfirm = () => {
    if (selectedProduct && selectedVariants.length > 0) {
      onSelect({
        name: selectedProduct.model,
        printfulProductId: selectedProduct.id,
        variants: selectedVariants,
      });
    }
  };

  if (loading) {
    return (
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full mx-auto mb-3" />
        <p className="text-sm text-gray-500">Loading Printful products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border-2 border-dashed border-red-300 rounded-lg p-4 text-center">
        <p className="text-sm text-red-600">{error}</p>
        <button
          type="button"
          onClick={onCancel}
          className="mt-2 text-sm text-gray-600 hover:text-gray-900"
        >
          Cancel
        </button>
      </div>
    );
  }

  // Product selection view
  if (!selectedProduct) {
    return (
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-900">Select Printful Product</h4>
          <button
            type="button"
            onClick={onCancel}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
        </div>

        {/* Search and filter */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
          {products.slice(0, 20).map(product => (
            <button
              key={product.id}
              type="button"
              onClick={() => setSelectedProduct(product)}
              className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition text-left"
            >
              <img
                src={product.image}
                alt={product.model}
                className="w-12 h-12 object-cover rounded"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{product.model}</p>
                <p className="text-xs text-gray-500 truncate">{product.type_name}</p>
              </div>
            </button>
          ))}
        </div>

        {products.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4">No products found</p>
        )}
      </div>
    );
  }

  // Variant selection view
  return (
    <div className="border-2 border-gray-300 rounded-lg p-4 space-y-4 bg-gray-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSelectedProduct(null)}
            className="p-1 text-gray-500 hover:text-gray-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <img
            src={selectedProduct.image}
            alt={selectedProduct.model}
            className="w-10 h-10 object-cover rounded"
          />
          <div>
            <h4 className="text-sm font-medium text-gray-900">{selectedProduct.model}</h4>
            <p className="text-xs text-gray-500">{selectedProduct.type_name}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Cancel
        </button>
      </div>

      {loadingVariants ? (
        <div className="py-8 text-center">
          <div className="animate-spin w-6 h-6 border-2 border-gray-300 border-t-gray-900 rounded-full mx-auto mb-2" />
          <p className="text-sm text-gray-500">Loading variants...</p>
        </div>
      ) : (
        <>
          {/* Variant list */}
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {variants.filter(v => v.in_stock).map(variant => {
              const isSelected = selectedVariants.some(v => v.id === variant.id);
              const selectedVar = selectedVariants.find(v => v.id === variant.id);

              return (
                <div
                  key={variant.id}
                  className={`flex items-center gap-3 p-2 rounded-lg border transition ${
                    isSelected ? 'border-gray-900 bg-white' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleVariant(variant)}
                    className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{variant.size}</p>
                    <p className="text-xs text-gray-500">{variant.color}</p>
                  </div>
                  {isSelected && (
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-500">$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={selectedVar?.price || 0}
                        onChange={(e) => updateVariantPrice(variant.id, parseFloat(e.target.value) || 0)}
                        className="w-16 px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-900"
                      />
                    </div>
                  )}
                  {!isSelected && (
                    <span className="text-xs text-gray-400">Base: ${variant.price}</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Confirm button */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setSelectedProduct(null)}
              className="flex-1 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={selectedVariants.length === 0}
              className="flex-1 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add {selectedVariants.length} Variant{selectedVariants.length !== 1 ? 's' : ''}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
