import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items provided' }, { status: 400 });
    }

    const lineItems = items.map((item: {
      name: string;
      description: string;
      price: number;
      quantity: number;
      image?: string;
      artworkId: string;
      variantId: number;
    }) => ({
      name: item.name,
      description: item.description,
      amount: Math.round(item.price * 100), // Convert to cents
      quantity: item.quantity,
      images: item.image ? [item.image] : undefined,
    }));

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const session = await createCheckoutSession({
      lineItems,
      successUrl: `${baseUrl}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${baseUrl}/cart`,
      metadata: {
        items: JSON.stringify(items.map((item: { artworkId: string; variantId: number; quantity: number }) => ({
          artworkId: item.artworkId,
          variantId: item.variantId,
          quantity: item.quantity,
        }))),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
