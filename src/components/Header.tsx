import React, { useState, useEffect } from 'react';
import { Menu, X, Moon, Sun } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface SiteMedia {
  logotipo_img: string;
  nome_site: string;
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [siteMedia, setSiteMedia] = useState<SiteMedia | null>(null);

  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
    fetchSiteMedia();
  }, []);

  const fetchSiteMedia = async () => {
    try {
      const { data, error } = await supabase
        .from('midias_site')
        .select('logotipo_img, nome_site')
        .single();

      if (error) throw error;
      if (data) {
        setSiteMedia(data);
      }
    } catch (err) {
      console.error('Error fetching site media:', err);
    }
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', String(newDarkMode));
    document.documentElement.classList.toggle('dark');
  };

  return (
    <header className="fixed w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            {siteMedia?.logotipo_img && (
              <img 
                src={siteMedia.logotipo_img} 
                alt="Logo"
                className="h-8 w-auto"
              />
            )}
            <span className="ml-2 text-xl font-semibold dark:text-white">
              {siteMedia?.nome_site || "Desireé Lucchesi"}
            </span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <nav className="flex space-x-8">
              <a href="#home" className="text-gray-700 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-500">Início</a>
              <a href="#launches" className="text-gray-700 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-500">Lançamentos</a>
              <a href="#properties" className="text-gray-700 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-500">Imóveis</a>
              <a href="#contact" className="text-gray-700 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-500">Contato</a>
            </nav>
            
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
              aria-label="Alternar modo escuro"
            >
              {darkMode ? (
                <Sun className="h-5 w-5 text-yellow-500" />
              ) : (
                <Moon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              )}
            </button>
          </div>

          <div className="md:hidden flex items-center space-x-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
              aria-label="Alternar modo escuro"
            >
              {darkMode ? (
                <Sun className="h-5 w-5 text-yellow-500" />
              ) : (
                <Moon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              )}
            </button>
            
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 dark:text-gray-300"
            >
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <a href="#home" className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-500">Início</a>
            <a href="#launches" className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-500">Lançamentos</a>
            <a href="#properties" className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-500">Imóveis</a>
            <a href="#contact" className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-500">Contato</a>
          </div>
        </div>
      )}
    </header>
  );
}