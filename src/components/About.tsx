import React, { useState, useEffect } from 'react';
import { Award, Star, Users, Heart } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function About() {
  const [aboutData, setAboutData] = useState({
    profile_image: "foto do perfil Desiree Lucchesi - via link/url",
    my_story: "Com mais de 8 anos de experiência no mercado imobiliário, construí minha carreira com base na confiança e no atendimento personalizado. Minha paixão por imóveis começou cedo, quando acompanhava meu pai, também corretor, em suas visitas a empreendimentos.\n\nHoje, sou especialista em imóveis de lançamentos exclusivos, com foco em proporcionar uma experiência única para cada cliente, entendendo suas necessidades e encontrando o imóvel perfeito para realizar seus sonhos."
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAboutData();
  }, []);

  const fetchAboutData = async () => {
    try {
      const { data, error } = await supabase
        .from('about_me')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching about data:', error);
        return;
      }

      if (data) {
        setAboutData({
          profile_image: data.profile_image,
          my_story: data.my_story
        });
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Split the story into paragraphs
  const storyParagraphs = aboutData.my_story.split('\n\n');

  return (
    <div className="py-24 bg-white dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Sobre Desireé Lucchesi</h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Especialista em imóveis, com mais de 5 anos de experiência no mercado imobiliário
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <img 
              src={aboutData.profile_image} 
              alt="Desireé Lucchesi" 
              className="rounded-lg shadow-xl w-full h-auto object-cover aspect-[4/5]"
            />
          </div>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Minha História</h3>
              {storyParagraphs.map((paragraph, index) => (
                <p key={index} className={index > 0 ? "mt-4 text-gray-600 dark:text-gray-400" : "text-gray-600 dark:text-gray-400"}>
                  {paragraph}
                </p>
              ))}
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-rose-50 dark:bg-rose-900/20 p-4 rounded-lg">
                <Award className="w-8 h-8 text-rose-600 mb-2" />
                <h4 className="text-lg font-medium text-gray-900 dark:text-white">Premiada</h4>
                <p className="text-gray-600 dark:text-gray-400">Reconhecida entre os melhores corretores de São Paulo</p>
              </div>
              
              <div className="bg-rose-50 dark:bg-rose-900/20 p-4 rounded-lg">
                <Star className="w-8 h-8 text-rose-600 mb-2" />
                <h4 className="text-lg font-medium text-gray-900 dark:text-white">Especialista</h4>
                <p className="text-gray-600 dark:text-gray-400">Foco em lançamentos de empreendimento</p>
              </div>
              
              <div className="bg-rose-50 dark:bg-rose-900/20 p-4 rounded-lg">
                <Users className="w-8 h-8 text-rose-600 mb-2" />
                <h4 className="text-lg font-medium text-gray-900 dark:text-white">Rede</h4>
                <p className="text-gray-600 dark:text-gray-400">Ampla rede de contatos e parcerias com construtoras</p>
              </div>
              
              <div className="bg-rose-50 dark:bg-rose-900/20 p-4 rounded-lg">
                <Heart className="w-8 h-8 text-rose-600 mb-2" />
                <h4 className="text-lg font-medium text-gray-900 dark:text-white">Dedicação</h4>
                <p className="text-gray-600 dark:text-gray-400">Atendimento personalizado e acompanhamento completo</p>
              </div>
            </div>
            
            <div className="pt-4">
              <blockquote className="italic text-gray-700 dark:text-gray-300 border-l-4 border-rose-500 pl-4">
                "Meu compromisso é transformar o sonho da casa própria em realidade, com atenção aos detalhes e dedicação total a cada cliente."
              </blockquote>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}