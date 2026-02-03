import React, { useState, useEffect } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import ServiceDetailPage from './pages/ServiceDetailPage';
import ProductDetailPage from './pages/ProductDetailPage';
import DigitalServicesPage from './pages/DigitalServicesPage';
import DigitalServiceDetailPage from './pages/DigitalServiceDetailPage';
import PowerBy from './components/PowerBy';
import Services from './components/Services'; // Used for the /servizi page list if needed stand-alone
import Products from './components/Products'; // Used for the /prodotti page list if needed stand-alone
import Pricing from './components/Pricing';
import Contact from './components/Contact';
import SeoManager from './components/SeoManager';
import AuthModal from './components/AuthModal';
import { apiService } from './services/api';
import { User } from './types';
import { supabase } from './lib/supabaseClient';

// Layout wrapper to include Nav and static elements
const Layout = ({ children, user, onLogin, onLogout }: any) => (
  <>
    <Navbar user={user} onLogin={onLogin} onLogout={onLogout} />
    <main>{children}</main>
    <AuthModal 
        isOpen={false} // Managed in App
        onClose={() => {}} 
        onLoginSuccess={() => {}} 
    />
  </>
);

// Wrapper to scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    apiService.getCurrentUser().then(setUser);
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser({
           id: session.user.id,
           email: session.user.email || '',
           name: session.user.user_metadata.full_name || session.user.email || 'User',
           avatarUrl: session.user.user_metadata.avatar_url
        });
      } else {
        setUser(null);
      }
    });
    return () => { authListener.subscription.unsubscribe(); };
  }, []);

  const handleLoginClick = () => setIsAuthModalOpen(true);
  const handleLoginSuccess = (newUser: User) => setUser(newUser);
  const handleLogout = async () => { await apiService.logout(); setUser(null); };

  return (
    <HelmetProvider>
      <Router>
        <ScrollToTop />
        <SeoManager />
        <div className="min-h-screen bg-black text-white overflow-x-hidden">
          <Navbar user={user} onLogin={handleLoginClick} onLogout={handleLogout} />
          
          <Routes>
            <Route path="/" element={<HomePage />} />
            
            {/* Dedicated Pages */}
            <Route path="/servizi" element={<div className="pt-20"><Services /><Contact/></div>} />
            <Route path="/servizi/:id" element={<><ServiceDetailPage /><Contact/></>} />

            <Route path="/digitale" element={<><DigitalServicesPage /><Contact/></>} />
            <Route path="/digitale/:slug" element={<><DigitalServiceDetailPage /><Contact/></>} />
            
            <Route path="/prodotti" element={<div className="pt-20"><Products /><Contact/></div>} />
            <Route path="/prodotti/:id" element={<><ProductDetailPage /><Contact/></>} />
            
            <Route path="/pacchetti" element={<div className="pt-20"><Pricing /><Contact/></div>} />
            
            <Route path="/power-by" element={<><PowerBy user={user} onLogin={handleLoginClick} /><Contact/></>} />
            
            <Route path="/contatti" element={<div className="pt-20 min-h-screen bg-black"><Contact/></div>} />
          </Routes>

          <AuthModal 
              isOpen={isAuthModalOpen} 
              onClose={() => setIsAuthModalOpen(false)}
              onLoginSuccess={handleLoginSuccess}
          />
        </div>
      </Router>
    </HelmetProvider>
  );
}

export default App;
