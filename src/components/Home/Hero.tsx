import { ArrowRight } from 'lucide-react';
import { memo } from 'react';

interface HeroProps {
  onNavigate: (page: string, section?: string) => void;
}

export const Hero = memo(function Hero({ onNavigate }: HeroProps) {
  const handleCatalogClick = () => {
    onNavigate('home', 'catalog');
  };

  const handleAboutClick = () => {
    onNavigate('home', 'about');
  };

  return (
    <section id="home" className="relative bg-gradient-to-br from-teal-600 to-teal-800 text-white">
      <div className="absolute inset-0 bg-black opacity-10"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <div className="max-w-3xl">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight animate-fadeIn">
            Conectando el Talento Dominicano con el Mundo
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-teal-100 animate-fadeIn" style={{ animationDelay: '0.1s' }}>
            Descubre productos auténticos de artesanos, productores locales y
            microempresas de República Dominicana.
          </p>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
            <button
              onClick={handleCatalogClick}
              className="inline-flex items-center justify-center bg-white text-teal-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-all duration-150 shadow-lg hover:shadow-xl hover:scale-105"
            >
              Explorar Catálogo
              <ArrowRight className="ml-2 w-5 h-5" />
            </button>
            <button
              onClick={handleAboutClick}
              className="inline-flex items-center justify-center bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white hover:text-teal-600 transition-all duration-150 hover:scale-105"
            >
              Conoce Más
            </button>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto"
        >
          <path
            d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z"
            fill="white"
          />
        </svg>
      </div>
    </section>
  );
});
