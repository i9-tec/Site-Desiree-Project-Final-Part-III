import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface CookieSettings {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

export default function CookieConsent() {
  const [showModal, setShowModal] = useState(false);
  const [cookieSettings, setCookieSettings] = useState<CookieSettings>({
    necessary: true, // Always required
    analytics: true,
    marketing: true
  });
  const [cookieScript, setCookieScript] = useState('');

  useEffect(() => {
    // Check if user has already accepted cookies
    const hasAcceptedCookies = localStorage.getItem('cookieConsent');
    if (!hasAcceptedCookies) {
      setShowModal(true);
    }
    
    // Load cookie tracking script
    loadCookieScript();
  }, []);

  const loadCookieScript = async () => {
    try {
      const { data, error } = await supabase
        .from('cookie_tracking')
        .select('script')
        .limit(1);

      if (error) throw error;
      if (data && data.length > 0 && data[0].script) {
        setCookieScript(data[0].script);
      }
    } catch (err) {
      // Silently handle the error since cookie script is optional
      console.debug('No cookie tracking script found');
    }
  };

  const handleAcceptAll = () => {
    setCookieSettings({
      necessary: true,
      analytics: true,
      marketing: true
    });
    saveCookiePreferences({
      necessary: true,
      analytics: true,
      marketing: true
    });
  };

  const handleAcceptNecessary = () => {
    setCookieSettings({
      necessary: true,
      analytics: false,
      marketing: false
    });
    saveCookiePreferences({
      necessary: true,
      analytics: false,
      marketing: false
    });
  };

  const saveCookiePreferences = (settings: CookieSettings) => {
    localStorage.setItem('cookieConsent', 'true');
    localStorage.setItem('cookieSettings', JSON.stringify(settings));
    
    // If there's a cookie script and marketing cookies are accepted, execute it
    if (cookieScript && settings.marketing) {
      try {
        // Create a new script element
        const scriptElement = document.createElement('script');
        scriptElement.type = 'text/javascript';
        scriptElement.text = cookieScript;
        document.body.appendChild(scriptElement);
      } catch (err) {
        console.error('Error executing cookie script:', err);
      }
    }
    
    setShowModal(false);
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Política de Cookies
            </h2>
            <button
              onClick={handleAcceptNecessary}
              className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="prose dark:prose-invert max-w-none mb-6">
            <p className="text-gray-600 dark:text-gray-300">
              Utilizamos cookies para melhorar sua experiência em nosso site. 
              Alguns cookies são essenciais para o funcionamento do site, 
              enquanto outros nos ajudam a entender como você o utiliza e 
              a melhorar nossos serviços.
            </p>
            
            <div className="mt-4 space-y-4">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    checked={cookieSettings.necessary}
                    disabled
                    className="w-4 h-4 border-gray-300 rounded text-rose-600 focus:ring-rose-500 cursor-not-allowed"
                  />
                </div>
                <div className="ml-3">
                  <label className="font-medium text-gray-900 dark:text-white">
                    Cookies Necessários
                  </label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Essenciais para o funcionamento básico do site. O site não pode funcionar adequadamente sem estes cookies.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    checked={cookieSettings.analytics}
                    onChange={(e) => setCookieSettings({...cookieSettings, analytics: e.target.checked})}
                    className="w-4 h-4 border-gray-300 rounded text-rose-600 focus:ring-rose-500"
                  />
                </div>
                <div className="ml-3">
                  <label className="font-medium text-gray-900 dark:text-white">
                    Cookies Analíticos
                  </label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Nos ajudam a entender como os visitantes interagem com o site, permitindo melhorar a experiência.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    checked={cookieSettings.marketing}
                    onChange={(e) => setCookieSettings({...cookieSettings, marketing: e.target.checked})}
                    className="w-4 h-4 border-gray-300 rounded text-rose-600 focus:ring-rose-500"
                  />
                </div>
                <div className="ml-3">
                  <label className="font-medium text-gray-900 dark:text-white">
                    Cookies de Marketing
                  </label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Utilizados para exibir anúncios relevantes e campanhas de marketing personalizadas.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
            <button
              onClick={handleAcceptNecessary}
              className="inline-flex justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
            >
              Aceitar Apenas Necessários
            </button>
            <button
              onClick={handleAcceptAll}
              className="inline-flex justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
            >
              Aceitar Todos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}