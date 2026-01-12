import { NextRequest, NextResponse } from 'next/server';

const PRINTFUL_API_URL = 'https://api.printful.com';
const PRINTFUL_STORE_ID = '17528088';

// Popular products for art/merchandise
const FEATURED_PRODUCT_IDS = [
  1,    // Poster
  2,    // Framed poster
  3,    // Canvas
  19,   // All-over print t-shirt
  71,   // Premium t-shirt
  380,  // Mug 11oz
  382,  // Mug 15oz
  394,  // Sticker sheet
  534,  // Water bottle
  588,  // Hoodie
  628,  // Tote bag
];

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

async function printfulRequest<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${PRINTFUL_API_URL}${endpoint}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${process.env.PRINTFUL_API_TOKEN}`,
      'X-PF-Store-Id': PRINTFUL_STORE_ID,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.result || error.error?.message || 'Printful API error');
  }

  const data = await response.json();
  return data.result;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const productId = searchParams.get('productId');
  const category = searchParams.get('category');
  const search = searchParams.get('search');

  try {
    // If productId is specified, get product details with variants
    if (productId) {
      const [product, variants] = await Promise.all([
        printfulRequest<PrintfulProduct>(`/products/${productId}`),
        printfulRequest<{ variants: PrintfulVariant[] }>(`/products/${productId}`),
      ]);

      // Get print file info for this product
      const printFiles = await printfulRequest<{
        product_id: number;
        available_placements: Record<string, {
          title: string;
          options: Array<{ id: string; title: string }>;
        }>;
        printfile_id: number;
        min_dpi: number;
        option_groups: string[];
      }>(`/mockup-generator/printfiles/${productId}`);

      return NextResponse.json({
        product,
        variants: variants.variants || [],
        printFiles,
      });
    }

    // Get all products
    const products = await printfulRequest<PrintfulProduct[]>('/products');

    // Filter and sort
    let filteredProducts = products;

    if (search) {
      const searchLower = search.toLowerCase();
      filteredProducts = products.filter((p: PrintfulProduct) =>
        p.model.toLowerCase().includes(searchLower) ||
        p.type_name.toLowerCase().includes(searchLower)
      );
    }

    if (category) {
      filteredProducts = filteredProducts.filter((p: PrintfulProduct) =>
        p.type_name.toLowerCase().includes(category.toLowerCase())
      );
    }

    // Sort with featured products first
    filteredProducts.sort((a: PrintfulProduct, b: PrintfulProduct) => {
      const aFeatured = FEATURED_PRODUCT_IDS.includes(a.id);
      const bFeatured = FEATURED_PRODUCT_IDS.includes(b.id);
      if (aFeatured && !bFeatured) return -1;
      if (!aFeatured && bFeatured) return 1;
      return a.model.localeCompare(b.model);
    });

    // Get unique categories
    const categories = [...new Set(products.map((p: PrintfulProduct) => p.type_name))].sort();

    return NextResponse.json({
      products: filteredProducts,
      categories,
      featured: FEATURED_PRODUCT_IDS,
    });
  } catch (error) {
    console.error('Printful products API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get products' },
      { status: 500 }
    );
  }
}
