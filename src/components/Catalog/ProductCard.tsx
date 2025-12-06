import { ShoppingCart, Star, Loader2 } from 'lucide-react';
import { memo } from 'react';
import { OptimizedImage } from '../Common/OptimizedImage';

interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  price_dop: number;
  image: string;
  rating: number;
  category: string;
  onAddToCart: () => void;
  isAdding?: boolean;
}

export const ProductCard = memo(function ProductCard({
  name,
  description,
  price_dop,
  image,
  rating,
  category,
  onAddToCart,
  isAdding = false,
}: ProductCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-200 group">
      <div className="relative overflow-hidden h-64">
        <OptimizedImage
          src={image}
          alt={name}
          className="group-hover:scale-110 transition-transform duration-300"
          width={600}
          height={400}
        />
        <div className="absolute top-4 left-4 z-10">
          <span className="bg-teal-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
            {category}
          </span>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center mb-2">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < rating
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          ))}
          <span className="ml-2 text-sm text-gray-600">({rating}.0)</span>
        </div>

        <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-1">
          {name}
        </h3>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2 h-10">
          {description}
        </p>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-teal-600">
              RD${price_dop.toFixed(2)}
            </span>
            <span className="text-sm text-gray-500 ml-1">DOP</span>
          </div>

          <button
            onClick={onAddToCart}
            disabled={isAdding}
            className="bg-teal-600 text-white px-3 py-2 rounded-lg hover:bg-teal-700 transition-colors flex items-center space-x-1 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 text-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isAdding ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="font-semibold">Agregando...</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                <span className="font-semibold">Agregar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
});
