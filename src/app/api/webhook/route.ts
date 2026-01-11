import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createOrder as createPrintfulOrder } from '@/lib/printful';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    // Get the items from metadata
    const items = JSON.parse(session.metadata?.items || '[]');
    const shippingDetails = session.shipping_details;
    const customerEmail = session.customer_email;

    if (shippingDetails && items.length > 0) {
      try {
        // Create Printful order
        const printfulOrder = await createPrintfulOrder({
          recipient: {
            name: shippingDetails.name || '',
            address1: shippingDetails.address?.line1 || '',
            city: shippingDetails.address?.city || '',
            state_code: shippingDetails.address?.state || '',
            country_code: shippingDetails.address?.country || 'US',
            zip: shippingDetails.address?.postal_code || '',
            email: customerEmail || '',
          },
          items: items.map((item: { variantId: number; quantity: number; imageUrl?: string }) => ({
            variant_id: item.variantId,
            quantity: item.quantity,
            files: item.imageUrl ? [{ url: item.imageUrl }] : [],
          })),
        });

        console.log('Printful order created:', printfulOrder);

        // TODO: Save order to Supabase with printful order ID
      } catch (error) {
        console.error('Failed to create Printful order:', error);
        // Order paid but Printful failed - need manual intervention
        // TODO: Send alert notification
      }
    }
  }

  return NextResponse.json({ received: true });
}
