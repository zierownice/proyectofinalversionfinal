import { Store, Mail, Phone, MapPin } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string, section?: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <Store className="w-8 h-8 text-teal-400" />
              <span className="ml-2 text-2xl font-bold">CaribeSupply</span>
            </div>
            <p className="text-gray-400 mb-4">
              Conectamos artesanos, productores locales y microempresas
              dominicanas con clientes nacionales e internacionales.
            </p>
            <div className="space-y-2 text-gray-400">
              <div className="flex items-center transition-all duration-200 hover:text-teal-400">
                <MapPin className="w-5 h-5 mr-2" />
                <span>República Dominicana</span>
              </div>
              <div className="flex items-center transition-all duration-200 hover:text-teal-400">
                <Phone className="w-5 h-5 mr-2" />
                <span>+1 (809) 555-0123</span>
              </div>
              <div className="flex items-center transition-all duration-200 hover:text-teal-400">
                <Mail className="w-5 h-5 mr-2" />
                <span>contacto@caribesupply.com</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <button
                  onClick={() => onNavigate('home', 'home')}
                  className="hover:text-white transition-all duration-200 hover:translate-x-1"
                >
                  Inicio
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('home', 'catalog')}
                  className="hover:text-white transition-all duration-200 hover:translate-x-1"
                >
                  Catálogo
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('home', 'about')}
                  className="hover:text-white transition-all duration-200 hover:translate-x-1"
                >
                  Nosotros
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('home', 'contact')}
                  className="hover:text-white transition-all duration-200 hover:translate-x-1"
                >
                  Contacto
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Información</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Términos y Condiciones
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Política de Privacidad
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Política de Envíos
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Preguntas Frecuentes
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 CaribeSupply S.A.S. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
