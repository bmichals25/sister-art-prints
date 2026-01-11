const PRINTFUL_API_URL = 'https://api.printful.com';

interface PrintfulRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: Record<string, unknown>;
}

export async function printfulRequest<T>(
  endpoint: string,
  options: PrintfulRequestOptions = {}
): Promise<T> {
  const { method = 'GET', body } = options;

  const response = await fetch(`${PRINTFUL_API_URL}${endpoint}`, {
    method,
    headers: {
      'Authorization': `Bearer ${process.env.PRINTFUL_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.result || 'Printful API error');
  }

  const data = await response.json();
  return data.result;
}

// Get available products for art prints
export async function getArtPrintProducts() {
  // Product IDs for art-related items:
  // 1 - Poster, 171 - Canvas, 394 - Framed poster, 639 - Metal print
  const artProductIds = [1, 171, 394, 639];

  const products = await Promise.all(
    artProductIds.map(id =>
      printfulRequest<{ product: unknown; variants: unknown[] }>(`/products/${id}`)
    )
  );

  return products;
}

// Calculate shipping rates
export async function calculateShipping(recipient: {
  address1: string;
  city: string;
  state_code: string;
  country_code: string;
  zip: string;
}, items: { variant_id: number; quantity: number }[]) {
  return printfulRequest('/shipping/rates', {
    method: 'POST',
    body: { recipient, items },
  });
}

// Create an order
export async function createOrder(order: {
  recipient: {
    name: string;
    address1: string;
    city: string;
    state_code: string;
    country_code: string;
    zip: string;
    email: string;
  };
  items: {
    variant_id: number;
    quantity: number;
    files: { url: string }[];
  }[];
}) {
  return printfulRequest('/orders', {
    method: 'POST',
    body: order,
  });
}

// Get order status
export async function getOrder(orderId: string) {
  return printfulRequest(`/orders/${orderId}`);
}
