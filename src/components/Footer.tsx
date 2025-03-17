import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface DeveloperInfo {
  logotipo: string;
  nome: string;
  url: string;
}

interface PoliticasTermos {
  politicas_priv_cookies: string;
  termos_condicoes: string;
}

interface SiteMedia {
  logotipo_img_rodape: string;
}

export default function Footer() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [developerInfo, setDeveloperInfo] = useState<DeveloperInfo | null>(null);
  const [politicasTermos, setPoliticasTermos] = useState<PoliticasTermos | null>(null);
  const [siteMedia, setSiteMedia] = useState<SiteMedia | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    fetchDeveloperInfo();
    fetchPoliticasTermos();
    fetchSiteMedia();

    return () => clearInterval(timer);
  }, []);

  const fetchSiteMedia = async () => {
    try {
      const { data, error } = await supabase
        .from('midias_site')
        .select('logotipo_img_rodape')
        .single();

      if (error) throw error;
      if (data) {
        setSiteMedia(data);
      }
    } catch (err) {
      console.error('Error fetching site media:', err);
    }
  };

  const fetchDeveloperInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('developer_i9')
        .select('logotipo, nome, url')
        .single();

      if (error) throw error;
      if (data) {
        setDeveloperInfo(data);
      }
    } catch (err) {
      console.error('Error fetching developer info:', err);
    }
  };

  const fetchPoliticasTermos = async () => {
    try {
      const { data, error } = await supabase
        .from('politicas_termos')
        .select('politicas_priv_cookies, termos_condicoes')
        .single();

      if (error) throw error;
      if (data) {
        setPoliticasTermos(data);
      }
    } catch (err) {
      console.error('Error fetching privacy and terms info:', err);
    }
  };

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center">
              {siteMedia?.logotipo_img_rodape && (
                <img 
                  src={siteMedia.logotipo_img_rodape} 
                  alt="Logo"
                  className="h-8 w-auto"
                />
              )}
              <span className="ml-2 text-xl font-semibold">Desireé Lucchesi</span>
            </div>
            <p className="mt-4 text-gray-400">
              Especialista em imóveis lançamentos exclusivos.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Navegação</h3>
            <ul className="space-y-2">
              <li><a href="#home" className="text-gray-400 hover:text-white">Início</a></li>
              <li><a href="#launches" className="text-gray-400 hover:text-white">Lançamentos</a></li>
              <li><a href="#properties" className="text-gray-400 hover:text-white">Imóveis</a></li>
              <li><a href="#contact" className="text-gray-400 hover:text-white">Contato</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Imóveis</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white">Apartamentos</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Casas</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Comercial</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Lançamentos</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">CRECI</h3>
            <p className="text-gray-400">CRECI-SP 220957</p>
            <div className="mt-4 text-gray-400">
              <p>São Paulo - SP</p>
              <p className="mt-2 font-mono">{formatDateTime(currentTime)}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4">
              <p className="text-gray-400 text-center md:text-left">
                © {currentTime.getFullYear()} Desireé Lucchesi. Todos os direitos reservados
              </p>
              <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4">
                {politicasTermos && (
                  <>
                    <a 
                      href={politicasTermos.politicas_priv_cookies}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-white transition-colors duration-200 text-center md:text-left"
                    >
                      Políticas de Privacidade e Uso de Cookies
                    </a>
                    <span className="hidden md:inline text-gray-600">|</span>
                    <a 
                      href={politicasTermos.termos_condicoes}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-white transition-colors duration-200 text-center md:text-left"
                    >
                      Termos de Uso e Condições
                    </a>
                  </>
                )}
              </div>
            </div>
            
            {developerInfo && (
              <a 
                href={developerInfo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors duration-200"
              >
                <span>Desenvolvido por:</span>
                <img 
                  src={developerInfo.logotipo} 
                  alt={developerInfo.nome}
                  className="h-6 object-contain"
                />
                <span>{developerInfo.nome}</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}