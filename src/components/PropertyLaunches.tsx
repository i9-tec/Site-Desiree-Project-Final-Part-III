import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Bed, Bath, Square, Car, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import PropertyDetails from './PropertyDetails';

export default function PropertyLaunches() {
  const [launches, setLaunches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const itemsPerSlide = 3;
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  useEffect(() => {
    loadLaunches();
  }, []);

  const loadLaunches = async () => {
    try {
      const { data, error } = await supabase
        .from('property_launch')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLaunches(data || []);
    } catch (err) {
      console.error('Error loading launches:', err);
      setError('Não foi possível carregar os lançamentos. Por favor, tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => {
    if (sliderRef.current) {
      const scrollWidth = sliderRef.current.scrollWidth;
      const containerWidth = sliderRef.current.clientWidth;
      const maxScroll = scrollWidth - containerWidth;
      const newScrollLeft = Math.min(sliderRef.current.scrollLeft + containerWidth, maxScroll);
      
      sliderRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  const prevSlide = () => {
    if (sliderRef.current) {
      const containerWidth = sliderRef.current.clientWidth;
      const newScrollLeft = Math.max(sliderRef.current.scrollLeft - containerWidth, 0);
      
      sliderRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  // Touch and mouse event handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - (sliderRef.current?.offsetLeft || 0));
    setScrollLeft(sliderRef.current?.scrollLeft || 0);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].pageX - (sliderRef.current?.offsetLeft || 0));
    setScrollLeft(sliderRef.current?.scrollLeft || 0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    if (!sliderRef.current) return;
    
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    sliderRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    if (!sliderRef.current) return;
    
    const x = e.touches[0].pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    sliderRef.current.scrollLeft = scrollLeft - walk;
  };

  const stopDragging = () => {
    setIsDragging(false);
  };

  if (loading) {
    return (
      <div className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Lançamentos</h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">Carregando...</p>
          </div>
        </div>
      </div>
    );
  }

  if (launches.length === 0) {
    return null;
  }

  return (
    <div id="launches" className="py-24 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Lançamentos</h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Conheça os novos empreendimentos e garanta sua unidade na planta
          </p>
          {error && (
            <div className="mt-4 text-red-600 dark:text-red-400">
              {error}
            </div>
          )}
        </div>

        <div className="mt-20 relative">
          {launches.length > itemsPerSlide && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 p-2 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 md:-translate-x-12 translate-x-0"
              >
                <ChevronLeft className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 p-2 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 md:translate-x-12 translate-x-0"
              >
                <ChevronRight className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              </button>
            </>
          )}

          <div 
            ref={sliderRef}
            className="overflow-x-auto hide-scrollbar"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={stopDragging}
            onMouseLeave={stopDragging}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={stopDragging}
            style={{
              cursor: isDragging ? 'grabbing' : 'grab',
              WebkitOverflowScrolling: 'touch',
              scrollSnapType: 'x mandatory'
            }}
          >
            <div className="flex gap-8 min-w-max px-4">
              {launches.map((launch: any) => (
                <div 
                  key={launch.id} 
                  className="w-[calc(100vw-2rem)] sm:w-[calc(50vw-2rem)] lg:w-[calc(33.333vw-2rem)] max-w-[400px] flex-shrink-0 scroll-snap-align-start"
                >
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                    <div className="relative h-64">
                      <img
                        src={launch.images?.[0] ? 
                          (launch.images[0].startsWith('http') ? launch.images[0] : 
                          `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/properties/${launch.images[0]}`)
                          : "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80"
                        }
                        alt={launch.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-4 right-4 bg-rose-600 text-white px-3 py-1 rounded-full">
                        R$ {Number(launch.price).toLocaleString('pt-BR')}
                      </div>
                      <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full">
                        {launch.display_status || 'Lançamento'}
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{launch.title}</h3>
                      <div className="mt-2 flex items-center text-gray-600 dark:text-gray-400">
                        <MapPin className="w-4 h-4 mr-1" />
                        {launch.location}
                        {launch.city && (
                          <span className="ml-1">
                            - {launch.city}
                            {launch.region && `, ${launch.region}`}
                          </span>
                        )}
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-4 text-gray-600 dark:text-gray-400">
                        <div className="flex items-center">
                          <Bed className="w-4 h-4 mr-1" />
                          {launch.bedrooms} Dormitórios ({launch.suites} suítes)
                        </div>
                        <div className="flex items-center">
                          <Bath className="w-4 h-4 mr-1" />
                          {launch.bathrooms} Banheiros
                        </div>
                        <div className="flex items-center">
                          <Car className="w-4 h-4 mr-1" />
                          {launch.parking_spots} Vagas
                        </div>
                        <div className="flex items-center">
                          <Square className="w-4 h-4 mr-1" />
                          {launch.area}m²
                        </div>
                      </div>
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Diferenciais:</h4>
                        <div className="flex flex-wrap gap-2">
                          {launch.amenities?.map((amenity: string, i: number) => (
                            <span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200">
                              {amenity}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="mt-6 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                        <button 
                          onClick={() => setSelectedProperty(launch)}
                          className="flex-1 bg-rose-600 text-white py-2 rounded-md hover:bg-rose-700 transition-colors duration-200"
                        >
                          Mais Detalhes
                        </button>
                        <button 
                          onClick={() => {
                            const contactSection = document.getElementById('contact');
                            if (contactSection) {
                              contactSection.scrollIntoView({ behavior: 'smooth' });
                            }
                          }}
                          className="flex-1 border border-rose-600 text-rose-600 dark:text-rose-400 py-2 rounded-md hover:bg-rose-50 dark:hover:bg-rose-900 transition-colors duration-200"
                        >
                          Agendar Visita
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {selectedProperty && (
        <PropertyDetails
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
        />
      )}
    </div>
  );
}