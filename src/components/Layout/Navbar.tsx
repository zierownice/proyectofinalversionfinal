import { ShoppingCart, Menu, X, Store, LogOut, User as UserIcon, Shield, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect, memo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useCartContext } from '../../contexts/CartContext';
import { CartDropdown } from '../Cart/CartDropdown';
import { useAdminCheck } from '../../hooks/useAdminCheck';

interface NavbarProps {
  onNavigate: (page: string, section?: string) => void;
  currentPage: string;
  onOpenAuth: () => void;
  onOpenCheckout: () => void;
}

export const Navbar = memo(function Navbar({ onNavigate, currentPage, onOpenAuth, onOpenCheckout }: NavbarProps) {
  const { user, signOut } = useAuth();
  const { cartCount } = useCartContext();
  const { isAdmin } = useAdminCheck();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartDropdownOpen, setCartDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const cartButtonRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cartButtonRef.current && !cartButtonRef.current.contains(event.target as Node)) {
        setCartDropdownOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    if (cartDropdownOpen || userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [cartDropdownOpen, userMenuOpen]);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50 transition-smooth">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div
            className="flex items-center cursor-pointer transform hover:scale-105 transition-transform duration-200"
            onClick={() => onNavigate('home')}
          >
            <Store className="w-8 h-8 text-teal-600" />
            <span className="ml-2 text-2xl font-bold text-gray-800">
              CaribeSupply
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => onNavigate('home', 'home')}
              className={`font-medium transition-colors duration-150 ${currentPage === 'home' ? 'text-teal-600' : 'text-gray-700 hover:text-teal-600'}`}
            >
              Inicio
            </button>
            <button
              onClick={() => onNavigate('home', 'catalog')}
              className={`font-medium transition-colors duration-150 ${currentPage === 'home' ? 'text-gray-700 hover:text-teal-600' : 'text-gray-700 hover:text-teal-600'}`}
            >
              Catálogo
            </button>
            <button
              onClick={() => onNavigate('tools')}
              className={`font-medium transition-colors duration-150 ${currentPage === 'tools' ? 'text-teal-600' : 'text-gray-700 hover:text-teal-600'}`}
            >
              Herramientas
            </button>
            <button
              onClick={() => onNavigate('home', 'about')}
              className={`font-medium transition-colors duration-150 ${currentPage === 'home' ? 'text-gray-700 hover:text-teal-600' : 'text-gray-700 hover:text-teal-600'}`}
            >
              Nosotros
            </button>
            <button
              onClick={() => onNavigate('home', 'contact')}
              className={`font-medium transition-colors duration-150 ${currentPage === 'home' ? 'text-gray-700 hover:text-teal-600' : 'text-gray-700 hover:text-teal-600'}`}
            >
              Contacto
            </button>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <div ref={cartButtonRef} className="relative">
              <button
                onClick={() => setCartDropdownOpen(!cartDropdownOpen)}
                className="relative p-2 text-gray-700 hover:text-teal-600 transition-all duration-200 hover:scale-110"
                aria-label="Carrito de compras"
              >
                <ShoppingCart className="w-6 h-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-teal-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-scaleIn">
                    {cartCount}
                  </span>
                )}
              </button>
              <CartDropdown
                isOpen={cartDropdownOpen}
                onClose={() => setCartDropdownOpen(false)}
                onCheckout={onOpenCheckout}
              />
            </div>

            {user ? (
              <div ref={userMenuRef} className="relative animate-fadeIn">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-lg transition-all duration-200 hover:bg-gray-200 cursor-pointer"
                >
                  <UserIcon className="w-5 h-5 text-teal-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {user.email?.split('@')[0]}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 max-w-xs bg-white rounded-lg shadow-lg border border-gray-200 animate-fadeIn z-20">
                    <div className="py-2">
                      <div className="px-4 py-3 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-900 break-words">{user.email}</p>
                      </div>
                      {isAdmin && (
                        <>
                          <button
                            onClick={() => {
                              onNavigate('admin');
                              setUserMenuOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm flex items-center space-x-2 transition-colors duration-150 ${currentPage === 'admin' ? 'bg-teal-50 text-teal-600' : 'text-gray-700 hover:bg-gray-100'}`}
                          >
                            <Shield className="w-4 h-4" />
                            <span>Panel de Admin</span>
                          </button>
                          <div className="border-t border-gray-200"></div>
                        </>
                      )}
                      <button
                        onClick={() => {
                          signOut();
                          setUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2 transition-colors duration-150"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Salir</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="bg-teal-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-teal-700 transition-all duration-200 hover:scale-105 hover:shadow-lg"
              >
                Iniciar Sesión
              </button>
            )}
          </div>

          <button
            className="md:hidden p-2 text-gray-700"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 animate-slideDown">
          <div className="px-4 py-4 space-y-3">
            <button
              onClick={() => {
                onNavigate('home', 'home');
                setMobileMenuOpen(false);
              }}
              className={`block w-full text-left font-medium py-2 transition-all duration-200 hover:translate-x-2 ${currentPage === 'home' ? 'text-teal-600' : 'text-gray-700 hover:text-teal-600'}`}
            >
              Inicio
            </button>
            <button
              onClick={() => {
                onNavigate('home', 'catalog');
                setMobileMenuOpen(false);
              }}
              className={`block w-full text-left font-medium py-2 transition-all duration-200 hover:translate-x-2 text-gray-700 hover:text-teal-600`}
            >
              Catálogo
            </button>
            <button
              onClick={() => {
                onNavigate('tools');
                setMobileMenuOpen(false);
              }}
              className={`block w-full text-left font-medium py-2 transition-all duration-200 hover:translate-x-2 ${currentPage === 'tools' ? 'text-teal-600' : 'text-gray-700 hover:text-teal-600'}`}
            >
              Herramientas
            </button>
            <button
              onClick={() => {
                onNavigate('home', 'about');
                setMobileMenuOpen(false);
              }}
              className={`block w-full text-left font-medium py-2 transition-all duration-200 hover:translate-x-2 text-gray-700 hover:text-teal-600`}
            >
              Nosotros
            </button>
            <button
              onClick={() => {
                onNavigate('home', 'contact');
                setMobileMenuOpen(false);
              }}
              className={`block w-full text-left font-medium py-2 transition-all duration-200 hover:translate-x-2 text-gray-700 hover:text-teal-600`}
            >
              Contacto
            </button>
            <div className="pt-3 border-t border-gray-200">
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 bg-gray-100 px-4 py-3 rounded-lg">
                    <UserIcon className="w-5 h-5 text-teal-600" />
                    <span className="text-sm font-medium text-gray-700">
                      {user.email?.split('@')[0]}
                    </span>
                  </div>
                  {isAdmin && (
                    <button
                      onClick={() => {
                        onNavigate('admin');
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full text-left font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center space-x-2 ${currentPage === 'admin' ? 'bg-teal-100 text-teal-600' : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                      <Shield className="w-4 h-4" />
                      <span>Panel de Admin</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      signOut();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition-all flex items-center justify-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Salir</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    onOpenAuth();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full bg-teal-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-teal-700 transition-all"
                >
                  Iniciar Sesión
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
});
