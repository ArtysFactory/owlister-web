
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, PenTool, User as UserIcon, LogOut, Globe } from 'lucide-react';
import { User, UserRole, Language } from '../types';
import { checkAuthState, logoutUser } from '../services/storage';

interface NavProps {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const Nav: React.FC<NavProps> = ({ language, setLanguage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Use checkAuthState for real-time auth updates and proper role detection
  useEffect(() => {
    const unsubscribe = checkAuthState((u: User | null) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    setUserMenuOpen(false);
    navigate('/');
  };

  const canAccessAdmin = user && (user.role === UserRole.ADMIN || user.role === UserRole.EDITOR);

  const flags = {
    fr: '🇫🇷',
    en: '🇺🇸',
    es: '🇪🇸'
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-card-bg/95 backdrop-blur-md border-b border-neon-green">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-gradient-to-br from-neon-purple to-blue-600 rounded-full flex items-center justify-center group-hover:animate-pulse-slow">
                <span className="text-white font-anton text-lg">O</span>
              </div>
              <div className="flex flex-col">
                <span className="font-anton text-2xl tracking-wider text-white group-hover:text-neon-purple transition-colors">OWLISTER</span>
                <span className="text-[10px] text-gray-400 uppercase tracking-[0.2em] -mt-1 hidden sm:block">See beyond. Be Singular.</span>
              </div>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-gray-300 hover:text-neon-green px-3 py-2 rounded-md text-sm font-medium transition-colors font-roboto uppercase tracking-wide">Feed</Link>
            <Link to="/?filter=ARTICLE" className="text-gray-300 hover:text-neon-purple px-3 py-2 rounded-md text-sm font-medium transition-colors font-roboto uppercase tracking-wide">Stories</Link>
            <Link to="/?filter=COMIC" className="text-gray-300 hover:text-neon-purple px-3 py-2 rounded-md text-sm font-medium transition-colors font-roboto uppercase tracking-wide">Comics</Link>
            
            {/* Language Switcher */}
            <div className="flex items-center gap-2 bg-black/40 rounded-full px-2 py-1 border border-white/10">
              {(['fr', 'en', 'es'] as Language[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`w-6 h-6 flex items-center justify-center rounded-full text-xs transition-all ${language === lang ? 'bg-neon-purple scale-110 shadow-lg' : 'opacity-50 hover:opacity-100'}`}
                  title={lang.toUpperCase()}
                >
                  {flags[lang]}
                </button>
              ))}
            </div>

            {canAccessAdmin && (
               <Link to="/admin" className="flex items-center gap-2 px-4 py-1 rounded-full border border-gray-700 text-gray-400 hover:border-neon-purple hover:text-neon-purple transition-all text-xs font-bold uppercase tracking-wider">
                  <PenTool size={14} />
                  Admin
               </Link>
            )}

            {/* User Menu */}
            <div className="relative">
              {user ? (
                <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-2">
                  <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full border border-neon-green" />
                </button>
              ) : (
                 <Link to="/login" className="text-sm font-bold uppercase text-neon-green hover:text-white transition-colors">Login</Link>
              )}

              {userMenuOpen && user && (
                <div className="absolute right-0 mt-2 w-48 bg-card-bg border border-white/10 rounded-lg shadow-xl py-2">
                   <div className="px-4 py-2 border-b border-white/10">
                     <p className="text-white text-sm font-bold">{user.name}</p>
                     <p className="text-gray-500 text-xs">{user.role}</p>
                   </div>
                   <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/5 flex items-center gap-2">
                     <LogOut size={14} /> Logout
                   </button>
                </div>
              )}
            </div>
          </div>

          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="bg-gray-900 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-card-bg border-b border-neon-green">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <div className="flex gap-4 px-3 py-2 justify-center">
               {(['fr', 'en', 'es'] as Language[]).map((lang) => (
                <button key={lang} onClick={() => setLanguage(lang)} className={`text-xl ${language === lang ? 'opacity-100' : 'opacity-50'}`}>
                  {flags[lang]}
                </button>
              ))}
            </div>
            <Link to="/" onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium font-roboto uppercase">Feed</Link>
            <Link to="/?filter=ARTICLE" onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-neon-purple block px-3 py-2 rounded-md text-base font-medium font-roboto uppercase">Stories</Link>
            <Link to="/?filter=COMIC" onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-neon-purple block px-3 py-2 rounded-md text-base font-medium font-roboto uppercase">Comics</Link>
            {canAccessAdmin && (
              <Link to="/admin" onClick={() => setIsOpen(false)} className="text-neon-purple block px-3 py-2 rounded-md text-base font-medium font-roboto uppercase">Admin</Link>
            )}
            {user ? (
              <button onClick={handleLogout} className="text-red-400 block w-full text-left px-3 py-2 rounded-md text-base font-medium font-roboto uppercase">Logout</button>
            ) : (
              <Link to="/login" onClick={() => setIsOpen(false)} className="text-neon-green block px-3 py-2 rounded-md text-base font-medium font-roboto uppercase">Login</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Nav;
