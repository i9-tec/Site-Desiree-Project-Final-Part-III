import React, { useEffect, useState, useRef } from 'react';
import { MapPin, Bed, Bath, Square, Car, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import PropertyDetails from './PropertyDetails';

export default function FeaturedListings() {
  const [listings, setListings] = useState([]);
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
    loadFeaturedListings();

    // Listen for search results
    const handleSearch = (event: CustomEvent) => {
      if (event.detail && event.detail.results) {
        setListings(event.detail.results);
        setCurrentSlide(0); // Reset to first slide when new results come in
      }
    };

    window.addEventListener('propertySearch', handleSearch as EventListener);

    return () => {
      window.removeEventListener('propertySearch', handleSearch as EventListener);
    };
  }, []);

  const loadFeaturedListings = async () => {
    try {
      // First try to load featured properties
      const { data: featuredData, error: featuredError } = await supabase
        .from('featured_properties')
        .select(`
          position,
          property:properties (
            id,
            title,
            description,
            location,
            price,
            status,
            display_status,
            bedrooms,
            suites,
            bathrooms,
            parking_spots,
            area,
            amenities,
            images,
            city,
            region
          )
        `)
        .eq('active', true)
        .order('position');

      if (featuredError) throw featuredError;

      // If no featured properties, load most recent ones
      if (!featuredData || featuredData.length === 0) {
        const { data: recentData, error: recentError } = await supabase
          .from('properties')
          .select('*')
          .limit(6)
          .order('created_at', { ascending: false });

        if (recentError) throw recentError;
        setListings(recentData || []);
      } else {
        // Map featured properties data
        const activeListings = featuredData
          .filter(item => item.property)
          .map(item => item.property)
          .filter(Boolean);

        setListings(activeListings);
      }
    } catch (err) {
      console.error('Error loading featured listings:', err);
      setError('Não foi possível carregar os imóveis. Por favor, tente novamente mais tarde.');
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
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Imóveis em Destaque</h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">Carregando...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="properties" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            {listings.length > 0 ? 'Imóveis em Destaque' : 'Nenhum imóvel encontrado'}
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            {listings.length > 0 
              ? 'Conheça nossa seleção de propriedades exclusivas'
              : 'Tente ajustar os filtros de busca para encontrar mais opções'
            }
          </p>
          {error && (
            <div className="mt-4 text-red-600 dark:text-red-400">
              {error}
            </div>
          )}
        </div>

        {listings.length > 0 && (
          <div className="mt-20 relative">
            {listings.length > itemsPerSlide && (
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
                {listings.map((listing: any) => (
                  <div 
                    key={listing.id} 
                    className="w-[calc(100vw-2rem)] sm:w-[calc(50vw-2rem)] lg:w-[calc(33.333vw-2rem)] max-w-[400px] flex-shrink-0 scroll-snap-align-start"
                  >
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                      <div className="relative h-64">
                        <img
                          src={listing.images?.[0] ? 
                            (listing.images[0].startsWith('http') ? listing.images[0] : 
                            `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/properties/${listing.images[0]}`)
                            : "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80"
                          }
                          alt={listing.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-4 right-4 bg-rose-600 text-white px-3 py-1 rounded-full">
                          R$ {Number(listing.price).toLocaleString('pt-BR')}
                        </div>
                        <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full">
                          {listing.display_status || (
                            listing.status === 'launch' ? 'Lançamento' :
                            listing.status === 'new' ? 'Novo' :
                            listing.status === 'used' ? 'Usado' :
                            listing.status
                          )}
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{listing.title}</h3>
                        <div className="mt-2 flex items-center text-gray-600 dark:text-gray-400">
                          <MapPin className="w-4 h-4 mr-1" />
                          {listing.location}
                          {listing.city && (
                            <span className="ml-1">
                              - {listing.city}
                              {listing.region && `, ${listing.region}`}
                            </span>
                          )}
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-4 text-gray-600 dark:text-gray-400">
                          <div className="flex items-center">
                            <Bed className="w-4 h-4 mr-1" />
                            {listing.bedrooms} Dormitórios ({listing.suites} suítes)
                          </div>
                          <div className="flex items-center">
                            <Bath className="w-4 h-4 mr-1" />
                            {listing.bathrooms} Banheiros
                          </div>
                          <div className="flex items-center">
                            <Car className="w-4 h-4 mr-1" />
                            {listing.parking_spots} Vagas
                          </div>
                          <div className="flex items-center">
                            <Square className="w-4 h-4 mr-1" />
                            {listing.area}m²
                          </div>
                        </div>
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Diferenciais:</h4>
                          <div className="flex flex-wrap gap-2">
                            {listing.amenities?.map((amenity: string, i: number) => (
                              <span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200">
                                {amenity}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="mt-6 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                          <button 
                            onClick={() => setSelectedProperty(listing)}
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
        )}
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