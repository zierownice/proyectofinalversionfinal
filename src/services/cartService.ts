import { supabase } from '../lib/supabase';

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    description: string;
    price_dop: number;
    image: string;
    rating: number;
    category: string;
  };
}

export const cartService = {
  async getCartItems(): Promise<CartItem[]> {
    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        id,
        user_id,
        product_id,
        quantity,
        product:products(
          id,
          name,
          description,
          price_dop,
          image,
          rating,
          category
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as CartItem[];
  },

  async addToCart(productId: string, quantity: number = 1): Promise<void> {
    const { data: existingItem } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('product_id', productId)
      .maybeSingle();

    if (existingItem) {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: existingItem.quantity + quantity })
        .eq('id', existingItem.id);

      if (error) throw error;
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { error } = await supabase
        .from('cart_items')
        .insert({
          user_id: user.id,
          product_id: productId,
          quantity,
        });

      if (error) throw error;
    }
  },

  async updateQuantity(cartItemId: string, quantity: number): Promise<void> {
    if (quantity <= 0) {
      await this.removeFromCart(cartItemId);
      return;
    }

    const { error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', cartItemId);

    if (error) throw error;
  },

  async removeFromCart(cartItemId: string): Promise<void> {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', cartItemId);

    if (error) throw error;
  },

  async clearCart(): Promise<void> {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (error) throw error;
  },

  async getCartCount(): Promise<number> {
    const { count, error } = await supabase
      .from('cart_items')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;
    return count || 0;
  },
};
