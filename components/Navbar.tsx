import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, User as UserIcon, LogOut } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { User } from '../types';

interface NavbarProps {
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogin, onLogout }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const location = useLocation();
  const servicesRef = useRef<HTMLDivElement | null>(null);
  const servicesHoverTimeout = useRef<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Prodotti', path: '/prodotti' },
    { name: 'Pacchetti', path: '/pacchetti' },
    { name: 'Power By KW', path: '/power-by' },
    { name: 'Contatti', path: '/contatti' },
  ];

  const serviceLinks = [
    {
      name: 'Digitali',
      path: '/digitale',
      description: 'Branding, web, social e contenuti.'
    },
    {
      name: 'Strumentazione',
      path: '/servizi',
      description: 'Noleggio e soluzioni per eventi.'
    }
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  const isServicesActive =
    location.pathname.startsWith('/digitale') || location.pathname.startsWith('/servizi');

  useEffect(() => {
    setServicesOpen(false);
    setMobileServicesOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!servicesOpen) return;
    const handleClick = (event: MouseEvent) => {
      if (!servicesRef.current) return;
      if (servicesRef.current.contains(event.target as Node)) return;
      setServicesOpen(false);
    };
    window.addEventListener('mousedown', handleClick);
    return () => window.removeEventListener('mousedown', handleClick);
  }, [servicesOpen]);

  const openServices = () => {
    if (servicesHoverTimeout.current) {
      window.clearTimeout(servicesHoverTimeout.current);
      servicesHoverTimeout.current = null;
    }
    setServicesOpen(true);
  };

  const scheduleCloseServices = () => {
    if (servicesHoverTimeout.current) {
      window.clearTimeout(servicesHoverTimeout.current);
    }
    servicesHoverTimeout.current = window.setTimeout(() => {
      setServicesOpen(false);
      servicesHoverTimeout.current = null;
    }, 180);
  };

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled || location.pathname !== '/' ? 'bg-black/90 backdrop-blur-md border-b border-gray-800 py-2' : 'bg-transparent py-4'}`}>
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center cursor-pointer group">
           <span className="font-display text-2xl md:text-3xl italic font-black text-white tracking-tighter group-hover:text-gray-200 transition-colors">
             KILOWATT<span className="text-neon">.srv</span>
           </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
          {navLinks.slice(0, 1).map((link) => {
            const isPower = link.name === 'Power By KW';
            const powerLabel = (
              <span>
                <span className="text-white">Power</span>{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-neon to-purple-400">
                  By KW
                </span>
              </span>
            );
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`text-xs lg:text-sm font-bold uppercase tracking-widest transition-colors relative
                  ${
                    isPower
                      ? 'hover:text-neon'
                      : isActive(link.path)
                        ? 'text-neon'
                        : 'text-white hover:text-neon'
                  }
                `}
              >
                {isPower ? powerLabel : link.name}
                {isActive(link.path) && (
                  <span className="absolute -bottom-4 left-0 w-full h-0.5 bg-neon shadow-[0_0_10px_#a3e635]" />
                )}
              </Link>
            );
          })}

          <div
            className="relative"
            ref={servicesRef}
            onMouseEnter={openServices}
            onMouseLeave={scheduleCloseServices}
          >
            <button
              onClick={() => setServicesOpen((prev) => !prev)}
              onFocus={openServices}
              className={`text-xs lg:text-sm font-bold uppercase tracking-widest transition-colors relative ${
                servicesOpen || isServicesActive ? 'text-neon' : 'text-white hover:text-neon'
              }`}
              aria-expanded={servicesOpen}
              aria-haspopup="true"
            >
              Servizi
              {isServicesActive && (
                <span className="absolute -bottom-4 left-0 w-full h-0.5 bg-neon shadow-[0_0_10px_#a3e635]" />
              )}
            </button>

            {servicesOpen && (
              <div
                className="absolute left-1/2 -translate-x-1/2 mt-4 w-[300px] bg-black/95 border border-gray-800 rounded-lg shadow-[0_10px_30px_rgba(0,0,0,0.45)]"
                onMouseEnter={openServices}
                onMouseLeave={scheduleCloseServices}
              >
                <div className="divide-y divide-gray-800">
                  {serviceLinks.map((item) => (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => setServicesOpen(false)}
                      className="group flex items-start justify-between gap-3 px-4 py-3 hover:bg-gray-900/60 transition-colors"
                    >
                      <div>
                        <div className="text-xs font-bold uppercase tracking-widest text-white group-hover:text-neon transition-colors">
                          {item.name}
                        </div>
                        <div className="text-[10px] text-gray-500 mt-1">{item.description}</div>
                      </div>
                      <div className="text-[10px] uppercase tracking-widest text-gray-500 group-hover:text-neon transition-colors">
                        →
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {navLinks.slice(1).map((link) => {
            const isPower = link.name === 'Power By KW';
            const powerLabel = (
              <span>
                <span className="text-white">Power</span>{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-neon to-purple-400">
                  By KW
                </span>
              </span>
            );
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`text-xs lg:text-sm font-bold uppercase tracking-widest transition-colors relative
                  ${
                    isPower
                      ? 'hover:text-neon'
                      : isActive(link.path)
                        ? 'text-neon'
                        : 'text-white hover:text-neon'
                  }
                `}
              >
                {isPower ? powerLabel : link.name}
                {isActive(link.path) && (
                  <span className="absolute -bottom-4 left-0 w-full h-0.5 bg-neon shadow-[0_0_10px_#a3e635]" />
                )}
              </Link>
            );
          })}
          
          {user ? (
            <div className="flex items-center gap-4 pl-4 border-l border-white/20">
              <span className="text-xs text-neon font-bold truncate max-w-[100px]">Ciao, {user.name.split(' ')[0]}</span>
              <button onClick={onLogout} className="text-white hover:text-red-500 transition-colors" title="Logout">
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <button 
              onClick={onLogin}
              className="flex items-center gap-2 bg-neon text-black px-4 py-2 rounded font-bold uppercase text-xs hover:bg-white transition-colors"
            >
              <UserIcon size={16} />
              Accedi
            </button>
          )}
        </div>

        {/* Mobile Toggle */}
        <div className="md:hidden">
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-neon">
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-black border-t border-neon/30 absolute w-full left-0 top-full p-4 flex flex-col space-y-4 shadow-2xl h-screen z-50">
          {navLinks.slice(0, 1).map((link) => {
            const isPower = link.name === 'Power By KW';
            const powerLabel = (
              <span>
                <span className="text-white">Power</span>{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-neon to-purple-400">
                  By KW
                </span>
              </span>
            );
            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`text-left text-lg font-bold uppercase tracking-widest ${
                  isPower ? '' : isActive(link.path) ? 'text-neon' : 'text-white'
                }`}
              >
                {isPower ? powerLabel : link.name}
              </Link>
            );
          })}

          <div className="flex flex-col">
            <button
              onClick={() => setMobileServicesOpen((prev) => !prev)}
              className="text-left text-lg font-bold uppercase tracking-widest text-white flex items-center justify-between"
            >
              Servizi
              <span className={`text-neon transition-transform ${mobileServicesOpen ? 'rotate-180' : ''}`}>v</span>
            </button>
            {mobileServicesOpen && (
              <div className="mt-3 ml-3 border-l border-gray-800 pl-4 flex flex-col gap-3">
                {serviceLinks.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-left text-sm font-bold uppercase tracking-widest text-gray-300 hover:text-neon transition-colors"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {navLinks.slice(1).map((link) => {
            const isPower = link.name === 'Power By KW';
            const powerLabel = (
              <span>
                <span className="text-white">Power</span>{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-neon to-purple-400">
                  By KW
                </span>
              </span>
            );
            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`text-left text-lg font-bold uppercase tracking-widest ${
                  isPower ? '' : isActive(link.path) ? 'text-neon' : 'text-white'
                }`}
              >
                {isPower ? powerLabel : link.name}
              </Link>
            );
          })}
           <div className="pt-4 border-t border-gray-800 mt-4">
             {user ? (
               <div className="flex flex-col gap-4">
                   <span className="text-neon font-bold">Ciao, {user.name}</span>
                   <button onClick={onLogout} className="w-full text-left text-red-400 font-bold uppercase flex gap-2 items-center"><LogOut size={16} /> Logout</button>
               </div>
             ) : (
               <button onClick={() => { onLogin(); setMobileMenuOpen(false); }} className="w-full text-left text-neon font-bold uppercase text-lg border border-neon p-4 rounded text-center bg-neon/10">
                   Accedi / Registrati
               </button>
             )}
           </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
