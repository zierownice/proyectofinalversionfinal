import { useState, useEffect, useCallback } from 'react';
import { cartService, CartItem } from '../services/cartService';
import { useAuth } from '../contexts/AuthContext';

export function useCart() {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCart = useCallback(async () => {
    if (!user) {
      setCart([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const items = await cartService.getCartItems();
      setCart(items);
    } catch (err) {
      setError('Error al cargar el carrito');
      console.error('Error loading cart:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const addToCart = async (productId: string, quantity: number = 1) => {
    if (!user) {
      setError('Debes iniciar sesión para agregar productos');
      return;
    }

    try {
      setError(null);
      await cartService.addToCart(productId, quantity);
      await loadCart();
    } catch (err) {
      setError('Error al agregar al carrito');
      console.error('Error adding to cart:', err);
    }
  };

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    try {
      setError(null);
      await cartService.updateQuantity(cartItemId, quantity);
      await loadCart();
    } catch (err) {
      setError('Error al actualizar cantidad');
      console.error('Error updating quantity:', err);
    }
  };

  const removeFromCart = async (cartItemId: string) => {
    try {
      setError(null);
      await cartService.removeFromCart(cartItemId);
      await loadCart();
    } catch (err) {
      setError('Error al eliminar del carrito');
      console.error('Error removing from cart:', err);
    }
  };

  const clearCart = async () => {
    try {
      setError(null);
      await cartService.clearCart();
      await loadCart();
    } catch (err) {
      setError('Error al vaciar el carrito');
      console.error('Error clearing cart:', err);
    }
  };

  const cartTotal = cart.reduce(
    (total, item) => total + (item.product?.price_dop || 0) * item.quantity,
    0
  );

  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  return {
    cart,
    loading,
    error,
    cartTotal,
    cartCount,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    refreshCart: loadCart,
  };
}
