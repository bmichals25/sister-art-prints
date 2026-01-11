import { NextRequest, NextResponse } from 'next/server';
import { createMockupTask, getMockupTaskResult, PRINTFUL_PRODUCTS } from '@/lib/printful';

// Variant IDs for different sizes (these are Printful's actual variant IDs)
const VARIANT_IDS: Record<string, Record<string, number>> = {
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
};

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, productType, size } = await request.json();

    if (!imageUrl || !productType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const productId = PRINTFUL_PRODUCTS[productType as keyof typeof PRINTFUL_PRODUCTS];
    if (!productId) {
      return NextResponse.json({ error: 'Invalid product type' }, { status: 400 });
    }

    // Get variant ID for the size, or use first available
    const variants = VARIANT_IDS[productType];
    const variantId = size && variants ? variants[size] : Object.values(variants || {})[0];

    if (!variantId) {
      return NextResponse.json({ error: 'Invalid size for product type' }, { status: 400 });
    }

    // Create mockup task
    const task = await createMockupTask(productId, [variantId], imageUrl);

    // Poll for result (Printful processes async)
    let result;
    let attempts = 0;
    const maxAttempts = 30; // 30 seconds max

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      result = await getMockupTaskResult(task.task_key);

      if (result.status === 'completed') {
        break;
      } else if (result.status === 'failed') {
        return NextResponse.json({ error: result.error || 'Mockup generation failed' }, { status: 500 });
      }

      attempts++;
    }

    if (!result || result.status !== 'completed') {
      return NextResponse.json({ error: 'Mockup generation timed out' }, { status: 504 });
    }

    return NextResponse.json({
      mockups: result.mockups,
    });
  } catch (error) {
    console.error('Mockup API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate mockup' },
      { status: 500 }
    );
  }
}

// GET endpoint to check available templates
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const productType = searchParams.get('productType');

  if (!productType) {
    return NextResponse.json({
      products: PRINTFUL_PRODUCTS,
      variants: VARIANT_IDS,
    });
  }

  const productId = PRINTFUL_PRODUCTS[productType as keyof typeof PRINTFUL_PRODUCTS];
  if (!productId) {
    return NextResponse.json({ error: 'Invalid product type' }, { status: 400 });
  }

  try {
    const { getMockupTemplates } = await import('@/lib/printful');
    const templates = await getMockupTemplates(productId);
    return NextResponse.json(templates);
  } catch (error) {
    console.error('Templates API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get templates' },
      { status: 500 }
    );
  }
}
