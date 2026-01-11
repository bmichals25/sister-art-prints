import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const PRINTFUL_API_URL = 'https://api.printful.com';
const PRINTFUL_STORE_ID = '17528088';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// All product/size combinations to pre-generate
const MOCKUP_CONFIGS = [
  { productType: 'poster', productId: 1, size: '12×18"', variantId: 3876 },
  { productType: 'poster', productId: 1, size: '18×24"', variantId: 1 },
  { productType: 'poster', productId: 1, size: '24×36"', variantId: 2 },
  { productType: 'canvas', productId: 3, size: '12×16"', variantId: 5 },
  { productType: 'canvas', productId: 3, size: '18×24"', variantId: 7 },
  { productType: 'canvas', productId: 3, size: '24×36"', variantId: 825 },
  { productType: 'framed', productId: 2, size: '12×18"', variantId: 4398 },
  { productType: 'framed', productId: 2, size: '18×24"', variantId: 3 },
  { productType: 'framed', productId: 2, size: '24×36"', variantId: 4 },
];

const PRINT_AREAS: Record<string, Record<string, { width: number; height: number }>> = {
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

async function generateMockup(
  artworkId: string,
  imageUrl: string,
  config: typeof MOCKUP_CONFIGS[0],
  positions?: Record<string, { scale: number; offsetX: number; offsetY: number }>
): Promise<string | null> {
  try {
    // Check if already cached
    const { data: cached } = await supabase
      .from('mockup_cache')
      .select('mockup_url')
      .eq('artwork_id', artworkId)
      .eq('product_type', config.productType)
      .eq('size', config.size)
      .single();

    if (cached?.mockup_url) {
      return cached.mockup_url;
    }

    // Get print area
    const printArea = PRINT_AREAS[config.productType]?.[config.size] || { width: 1800, height: 2700 };

    // Apply positioning if set
    const position = positions?.[config.productType];
    const scale = position?.scale ? position.scale / 100 : 1;
    const offsetX = position?.offsetX || 0;
    const offsetY = position?.offsetY || 0;

    // Create mockup task
    const task = await printfulRequest<{ task_key: string }>(
      `/mockup-generator/create-task/${config.productId}`,
      {
        method: 'POST',
        body: {
          variant_ids: [config.variantId],
          files: [{
            placement: 'default',
            image_url: imageUrl,
            position: {
              area_width: printArea.width,
              area_height: printArea.height,
              width: Math.round(printArea.width * scale),
              height: Math.round(printArea.height * scale),
              top: Math.round(offsetY * printArea.height / 100),
              left: Math.round(offsetX * printArea.width / 100),
            },
          }],
          format: 'jpg',
        },
      }
    );

    // Poll for result (max 30 seconds)
    for (let i = 0; i < 30; i++) {
      await new Promise(r => setTimeout(r, 1000));
      const result = await printfulRequest<{
        status: string;
        mockups?: Array<{ mockup_url: string }>;
        error?: string;
      }>(`/mockup-generator/task?task_key=${task.task_key}`);

      if (result.status === 'completed' && result.mockups?.[0]) {
        const mockupUrl = result.mockups[0].mockup_url;

        // Cache the result
        await supabase
          .from('mockup_cache')
          .upsert({
            artwork_id: artworkId,
            product_type: config.productType,
            size: config.size,
            mockup_url: mockupUrl,
          }, { onConflict: 'artwork_id,product_type,size' });

        return mockupUrl;
      }

      if (result.status === 'failed') {
        console.error(`Mockup failed for ${config.productType} ${config.size}:`, result.error);
        return null;
      }
    }

    return null;
  } catch (error) {
    console.error(`Error generating mockup for ${config.productType} ${config.size}:`, error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { artworkId } = await request.json();

    if (!artworkId) {
      return NextResponse.json({ error: 'Missing artworkId' }, { status: 400 });
    }

    // Get artwork details
    const { data: artwork, error: fetchError } = await supabase
      .from('artworks')
      .select('*')
      .eq('id', artworkId)
      .single();

    if (fetchError || !artwork) {
      return NextResponse.json({ error: 'Artwork not found' }, { status: 404 });
    }

    const positions = artwork.artwork_positions || {};
    const results: Record<string, string | null> = {};

    // Generate mockups sequentially to avoid rate limits
    for (const config of MOCKUP_CONFIGS) {
      const key = `${config.productType}-${config.size}`;
      results[key] = await generateMockup(artworkId, artwork.image_url, config, positions);

      // Small delay between requests to avoid rate limiting
      await new Promise(r => setTimeout(r, 500));
    }

    const successCount = Object.values(results).filter(Boolean).length;

    return NextResponse.json({
      success: true,
      generated: successCount,
      total: MOCKUP_CONFIGS.length,
      results,
    });
  } catch (error) {
    console.error('Pre-generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to pre-generate mockups' },
      { status: 500 }
    );
  }
}
