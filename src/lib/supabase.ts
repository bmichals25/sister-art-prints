import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database
export interface Artwork {
  id: string;
  title: string;
  description: string;
  artist_name: string;
  image_url: string;
  thumbnail_url: string;
  price_base: number; // base price for smallest print
  created_at: string;
  featured: boolean;
  tags: string[];
}

export interface PrintOption {
  id: string;
  artwork_id: string;
  printful_variant_id: number;
  product_type: 'poster' | 'canvas' | 'framed' | 'metal';
  size: string;
  price: number;
}

export interface Order {
  id: string;
  stripe_session_id: string;
  printful_order_id: string | null;
  customer_email: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  total_amount: number;
  created_at: string;
}

// Database functions
export async function getArtworks(featured?: boolean) {
  let query = supabase.from('artworks').select('*').order('created_at', { ascending: false });

  if (featured !== undefined) {
    query = query.eq('featured', featured);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Artwork[];
}

export async function getArtwork(id: string) {
  const { data, error } = await supabase
    .from('artworks')
    .select('*, print_options(*)')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Artwork & { print_options: PrintOption[] };
}

export async function createOrder(order: Omit<Order, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('orders')
    .insert(order)
    .select()
    .single();

  if (error) throw error;
  return data as Order;
}
