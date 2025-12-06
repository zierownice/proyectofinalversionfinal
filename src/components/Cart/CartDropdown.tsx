import { ShoppingCart, Trash2, Plus, Minus } from 'lucide-react';
import { useCartContext } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { OptimizedImage } from '../Common/OptimizedImage';

interface CartDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export function CartDropdown({ isOpen, onClose, onCheckout }: CartDropdownProps) {
  const { user } = useAuth();
  const { cart, cartTotal, updateQuantity, removeFromCart } = useCartContext();

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-[80vh] overflow-hidden flex flex-col animate-slideDown">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-bold text-gray-800 flex items-center">
            <ShoppingCart className="w-5 h-5 mr-2 text-teal-600" />
            Mi Carrito
          </h3>
        </div>

        {!user ? (
          <div className="p-6 text-center">
            <p className="text-gray-600">Inicia sesión para ver tu carrito</p>
          </div>
        ) : cart.length === 0 ? (
          <div className="p-6 text-center">
            <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600">Tu carrito está vacío</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start space-x-3 bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-all duration-200 hover:shadow-md"
                >
                  <OptimizedImage
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-16 h-16 rounded-lg flex-shrink-0"
                    width={64}
                    height={64}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm truncate">
                      {item.product.name}
                    </p>
                    <p className="text-xs text-gray-600 mb-2">
                      RD${item.product.price_dop.toFixed(2)}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center bg-white border border-gray-300 rounded hover:bg-gray-200 transition-all duration-200 hover:scale-110"
                          aria-label="Disminuir cantidad"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm font-semibold w-6 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center bg-white border border-gray-300 rounded hover:bg-gray-200 transition-all duration-200 hover:scale-110"
                          aria-label="Aumentar cantidad"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-600 hover:text-red-800 transition-all duration-200 hover:scale-110"
                        aria-label="Eliminar producto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-teal-600">
                      RD${(item.product.price_dop * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 p-4 bg-gray-50">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-bold text-gray-800">Total:</span>
                <span className="text-2xl font-bold text-teal-600">
                  RD${cartTotal.toFixed(2)}
                </span>
              </div>
              <button
                onClick={() => {
                  onCheckout();
                  onClose();
                }}
                className="w-full bg-teal-600 text-white py-3 rounded-lg hover:bg-teal-700 transition-all duration-200 font-semibold hover:scale-105 hover:shadow-lg"
              >
                Proceder al Pago
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
