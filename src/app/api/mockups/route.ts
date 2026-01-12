import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const PRINTFUL_API_URL = 'https://api.printful.com';
const PRINTFUL_STORE_ID = '17528088';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Printful product IDs
const PRINTFUL_PRODUCTS: Record<string, number> = {
  poster: 1,
  canvas: 3,
  framed: 2,
};

// Variant IDs for different sizes - organized by orientation
const VARIANT_IDS: Record<string, Record<string, Record<string, number>>> = {
  portrait: {
    poster: {
      '12×18"': 3876,
      '18×24"': 1,
      '24×36"': 2,
    },
    canvas: {
      '12×16"': 5,
      '18×24"': 7,
      '24×36"': 825,
    },
    framed: {
      '12×18"': 4398,
      '18×24"': 3,
      '24×36"': 4,
    },
  },
  landscape: {
    poster: {
      '18×12"': 3877,
      '24×18"': 10,
      '36×24"': 11,
    },
    canvas: {
      '16×12"': 6,
      '24×18"': 8,
      '36×24"': 826,
    },
    framed: {
      '18×12"': 4399,
      '24×18"': 12,
      '36×24"': 13,
    },
  },
};

// Print area dimensions for each product/size (from Printful templates)
const PRINT_AREAS: Record<string, Record<string, Record<string, { width: number; height: number }>>> = {
  portrait: {
    poster: {
      '12×18"': { width: 1800, height: 2700 },
      '18×24"': { width: 2700, height: 3600 },
      '24×36"': { width: 3600, height: 5400 },
    },
    canvas: {
      '12×16"': { width: 1800, height: 2400 },
      '18×24"': { width: 2700, height: 3600 },
      '24×36"': { width: 3600, height: 5400 },
    },
    framed: {
      '12×18"': { width: 1800, height: 2700 },
      '18×24"': { width: 2700, height: 3600 },
      '24×36"': { width: 3600, height: 5400 },
    },
  },
  landscape: {
    poster: {
      '18×12"': { width: 2700, height: 1800 },
      '24×18"': { width: 3600, height: 2700 },
      '36×24"': { width: 5400, height: 3600 },
    },
    canvas: {
      '16×12"': { width: 2400, height: 1800 },
      '24×18"': { width: 3600, height: 2700 },
      '36×24"': { width: 5400, height: 3600 },
    },
    framed: {
      '18×12"': { width: 2700, height: 1800 },
      '24×18"': { width: 3600, height: 2700 },
      '36×24"': { width: 5400, height: 3600 },
    },
  },
};

async function printfulRequest<T>(endpoint: string, options: { method?: string; body?: unknown } = {}): Promise<T> {
  const response = await fetch(`${PRINTFUL_API_URL}${endpoint}`, {
    method: options.method || 'GET',
    headers: {
      'Authorization': `Bearer ${process.env.PRINTFUL_API_TOKEN}`,
      'X-PF-Store-Id': PRINTFUL_STORE_ID,
      'Content-Type': 'application/json',
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.result || error.error?.message || 'Printful API error');
  }

  const data = await response.json();
  return data.result;
}

export async function POST(request: NextRequest) {
  try {
    const {
      imageUrl,
      productType,
      size,
      artworkId,
      orientation = 'portrait',
      // Custom product support - direct Printful IDs
      printfulProductId,
      printfulVariantId,
      customProductName,
    } = await request.json();

    if (!imageUrl) {
      return NextResponse.json({ error: 'Missing image URL' }, { status: 400 });
    }

    let productId: number;
    let variantId: number;

    // Handle custom products with direct Printful IDs
    if (printfulProductId && printfulVariantId) {
      productId = printfulProductId;
      variantId = printfulVariantId;
    } else {
      // Handle standard products (poster, canvas, framed)
      if (!productType) {
        return NextResponse.json({ error: 'Missing product type' }, { status: 400 });
      }

      productId = PRINTFUL_PRODUCTS[productType];
      if (!productId) {
        return NextResponse.json({ error: 'Invalid product type' }, { status: 400 });
      }

      // Get variants for the specified orientation
      const orientationVariants = VARIANT_IDS[orientation] || VARIANT_IDS.portrait;
      const variants = orientationVariants[productType];
      variantId = size && variants ? variants[size] : Object.values(variants || {})[0];

      if (!variantId) {
        return NextResponse.json({ error: 'Invalid size for product type' }, { status: 400 });
      }
    }

    // Determine cache key - use customProductName for custom products
    const cacheProductType = customProductName || productType;
    const cacheSize = size || `variant_${variantId}`;

    // Check cache first if artworkId is provided
    if (artworkId) {
      const { data: cached } = await supabase
        .from('mockup_cache')
        .select('mockup_url')
        .eq('artwork_id', artworkId)
        .eq('product_type', cacheProductType)
        .eq('size', cacheSize)
        .eq('orientation', orientation)
        .single();

      if (cached?.mockup_url) {
        return NextResponse.json({
          mockups: [{ mockup_url: cached.mockup_url }],
          cached: true,
        });
      }
    }

    // Get print area - for custom products, fetch from Printful API
    let printArea = { width: 1800, height: 2700 };

    if (printfulProductId) {
      // Fetch print file info from Printful for custom products
      try {
        const printFiles = await printfulRequest<{
          available_placements: Record<string, { width: number; height: number }>;
        }>(`/mockup-generator/printfiles/${productId}`);

        // Use the first available placement dimensions
        const placements = Object.values(printFiles.available_placements || {});
        if (placements.length > 0 && placements[0].width && placements[0].height) {
          printArea = { width: placements[0].width, height: placements[0].height };
        }
      } catch {
        // Fall back to default if we can't get print file info
        console.warn('Could not fetch print file info, using defaults');
      }
    } else {
      // Standard products use predefined print areas
      const orientationAreas = PRINT_AREAS[orientation] || PRINT_AREAS.portrait;
      printArea = orientationAreas[productType]?.[size] || printArea;
    }

    // Create mockup task with Printful
    const task = await printfulRequest<{ task_key: string; status: string }>(
      `/mockup-generator/create-task/${productId}`,
      {
        method: 'POST',
        body: {
          variant_ids: [variantId],
          files: [
            {
              placement: 'default',
              image_url: imageUrl,
              position: {
                area_width: printArea.width,
                area_height: printArea.height,
                width: printArea.width,
                height: printArea.height,
                top: 0,
                left: 0,
              },
            },
          ],
          format: 'jpg',
        },
      }
    );

    // Poll for result
    let result: { status: string; mockups?: Array<{ mockup_url: string }>; error?: string } | undefined;
    let attempts = 0;
    const maxAttempts = 30;

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      result = await printfulRequest<typeof result>(`/mockup-generator/task?task_key=${task.task_key}`);

      if (result?.status === 'completed') {
        break;
      } else if (result?.status === 'failed') {
        return NextResponse.json({ error: result.error || 'Mockup generation failed' }, { status: 500 });
      }

      attempts++;
    }

    if (!result || result.status !== 'completed' || !result.mockups?.[0]) {
      return NextResponse.json({ error: 'Mockup generation timed out' }, { status: 504 });
    }

    const mockupUrl = result.mockups[0].mockup_url;

    // Cache the result if artworkId is provided
    if (artworkId && mockupUrl) {
      await supabase
        .from('mockup_cache')
        .upsert({
          artwork_id: artworkId,
          product_type: cacheProductType,
          size: cacheSize,
          orientation: orientation,
          mockup_url: mockupUrl,
        }, {
          onConflict: 'artwork_id,product_type,size,orientation',
        });
    }

    return NextResponse.json({
      mockups: result.mockups,
      cached: false,
    });
  } catch (error) {
    console.error('Mockup API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate mockup' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const productType = searchParams.get('productType');

  if (!productType) {
    return NextResponse.json({
      products: PRINTFUL_PRODUCTS,
      variants: VARIANT_IDS,
    });
  }

  const productId = PRINTFUL_PRODUCTS[productType];
  if (!productId) {
    return NextResponse.json({ error: 'Invalid product type' }, { status: 400 });
  }

  try {
    const templates = await printfulRequest<unknown>(`/mockup-generator/templates/${productId}`);
    return NextResponse.json(templates);
  } catch (error) {
    console.error('Templates API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get templates' },
      { status: 500 }
    );
  }
}
