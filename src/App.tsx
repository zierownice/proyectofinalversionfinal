import { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import { Navbar } from './components/Layout/Navbar';
import { Footer } from './components/Layout/Footer';
import { Hero } from './components/Home/Hero';
import { AuthModal } from './components/Auth/AuthModal';
import { ChatWidget } from './components/Chat/ChatWidget';
import { useAuth } from './contexts/AuthContext';
import { useAdminCheck } from './hooks/useAdminCheck';

const Features = lazy(() => import('./components/Home/Features').then(m => ({ default: m.Features })));
const About = lazy(() => import('./components/Home/About').then(m => ({ default: m.About })));
const Contact = lazy(() => import('./components/Home/Contact').then(m => ({ default: m.Contact })));
const Catalog = lazy(() => import('./components/Catalog/Catalog').then(m => ({ default: m.Catalog })));
const Tools = lazy(() => import('./components/Tools/Tools').then(m => ({ default: m.Tools })));
const Checkout = lazy(() => import('./components/Checkout/Checkout').then(m => ({ default: m.Checkout })));
const AdminChat = lazy(() => import('./components/Admin/AdminChat').then(m => ({ default: m.AdminChat })));

function App() {
  const { user } = useAuth();
  const { isAdmin } = useAdminCheck();
  const [currentPage, setCurrentPage] = useState('home');
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const scrollToSection = useCallback((sectionId: string) => {
    requestAnimationFrame(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        const offset = 80;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        });
      }
    });
  }, []);

  useEffect(() => {
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
    });
  }, [currentPage]);

  const handleNavigate = useCallback((page: string, section?: string) => {
    if (page === 'home' && section) {
      if (currentPage === 'home') {
        scrollToSection(section);
      } else {
        setCurrentPage('home');
        setTimeout(() => scrollToSection(section), 50);
      }
    } else {
      setCurrentPage(page);
    }
  }, [currentPage, scrollToSection]);

  return (
    <div className="min-h-screen bg-white">
      <Navbar
        onNavigate={handleNavigate}
        currentPage={currentPage}
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenCheckout={() => setCurrentPage('checkout')}
      />

      <main className="will-change-contents">
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-xl text-gray-600">Cargando...</div>
          </div>
        }>
          {currentPage === 'home' && (
            <div key="home">
              <Hero onNavigate={handleNavigate} />
              <Features />
              <Catalog />
              <About />
              <Contact />
            </div>
          )}
          {currentPage === 'tools' && (
            <div key="tools">
              <Tools />
            </div>
          )}
          {currentPage === 'checkout' && (
            <div key="checkout">
              <Checkout onBack={() => setCurrentPage('home')} />
            </div>
          )}
          {currentPage === 'admin' && isAdmin && (
            <div key="admin">
              <AdminChat />
            </div>
          )}
        </Suspense>
      </main>

      <Footer onNavigate={handleNavigate} />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      <ChatWidget />
    </div>
  );
}

export default App;
