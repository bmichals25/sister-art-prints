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

// Printful product IDs for art prints
export const PRINTFUL_PRODUCTS = {
  poster: 1,        // Enhanced Matte Paper Poster
  canvas: 171,      // Canvas Print
  framed: 394,      // Framed Poster
  metal: 639,       // Metal Print (if available)
};

// Get mockup templates for a product
export async function getMockupTemplates(productId: number) {
  return printfulRequest<{
    product_id: number;
    available_placements: string[];
    templates: Array<{
      template_id: number;
      title: string;
      image_url: string;
      placement: string;
    }>;
  }>(`/mockup-generator/templates/${productId}`);
}

// Create a mockup generation task
export async function createMockupTask(
  productId: number,
  variantIds: number[],
  imageUrl: string,
  options?: {
    format?: 'jpg' | 'png';
    option_groups?: string[];
    options?: string[];
  }
) {
  return printfulRequest<{
    task_key: string;
    status: string;
  }>('/mockup-generator/create-task/' + productId, {
    method: 'POST',
    body: {
      variant_ids: variantIds,
      files: [
        {
          placement: 'default',
          image_url: imageUrl,
          position: {
            area_width: 1800,
            area_height: 2400,
            width: 1800,
            height: 2400,
            top: 0,
            left: 0,
          },
        },
      ],
      format: options?.format || 'jpg',
      option_groups: options?.option_groups,
      options: options?.options,
    },
  });
}

// Get mockup task result
export async function getMockupTaskResult(taskKey: string) {
  return printfulRequest<{
    status: string;
    mockups?: Array<{
      placement: string;
      variant_ids: number[];
      mockup_url: string;
      extra: Array<{
        title: string;
        url: string;
      }>;
    }>;
    error?: string;
  }>(`/mockup-generator/task?task_key=${taskKey}`);
}

// Get product variants
export async function getProductVariants(productId: number) {
  return printfulRequest<{
    product: {
      id: number;
      title: string;
    };
    variants: Array<{
      id: number;
      product_id: number;
      name: string;
      size: string;
      price: string;
    }>;
  }>(`/products/${productId}`);
}
