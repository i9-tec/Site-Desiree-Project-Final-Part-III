import React, { useState, useEffect } from 'react';
import { Search, X, AlertCircle, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';
import LocationSearchResults from './LocationSearchResults';
import PropertyDetails from './PropertyDetails';

interface SiteMedia {
  principal_img_site: string;
}

export default function Hero() {
  const [searchParams, setSearchParams] = useState({
    location: '',
    propertyType: '',
    priceRange: '',
    bedrooms: '',
    suites: '',
    parkingSpots: '',
    propertyStatus: ''
  });

  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [locationStats, setLocationStats] = useState<any>(null);
  const [searchError, setSearchError] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showLocationResults, setShowLocationResults] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [siteMedia, setSiteMedia] = useState<SiteMedia | null>(null);

  useEffect(() => {
    fetchSiteMedia();
  }, []);

  const fetchSiteMedia = async () => {
    try {
      const { data, error } = await supabase
        .from('midias_site')
        .select('principal_img_site')
        .single();

      if (error) throw error;
      if (data) {
        setSiteMedia(data);
      }
    } catch (err) {
      console.error('Error fetching site media:', err);
    }
  };

  useEffect(() => {
    if (searchParams.location.length >= 3) {
      fetchLocationStats();
    } else {
      setLocationStats(null);
    }
  }, [searchParams.location]);

  const fetchLocationStats = async () => {
    try {
      const searchTerm = searchParams.location.trim().toLowerCase();
      
      // First try exact match
      let { data: exactMatch, error: exactError } = await supabase
        .from('location_stats')
        .select('*')
        .or(`location.ilike.${searchTerm},city.ilike.${searchTerm},region.ilike.${searchTerm}`)
        .order('property_count', { ascending: false });

      if (exactError) throw exactError;

      // If no exact match, try partial match
      if (!exactMatch || exactMatch.length === 0) {
        const { data: partialMatch, error: partialError } = await supabase
          .from('location_stats')
          .select('*')
          .or(`location.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%,region.ilike.%${searchTerm}%`)
          .order('property_count', { ascending: false });

        if (partialError) throw partialError;
        exactMatch = partialMatch;
      }

      if (exactMatch && exactMatch.length > 0) {
        const stats = exactMatch.reduce((acc: any, curr: any) => {
          const key = [curr.location, curr.city, curr.region].filter(Boolean).join(' - ');
          acc[key] = {
            count: curr.property_count,
            location: curr.location,
            city: curr.city,
            region: curr.region
          };
          return acc;
        }, {});
        setLocationStats(stats);
      } else {
        setLocationStats(null);
      }
    } catch (err) {
      console.error('Error fetching location stats:', err);
      setLocationStats(null);
    }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    setSearchError('');
    setSearchResults([]);
    setIsSearching(true);
    
    try {
      let query = supabase
        .from('properties')
        .select('*');

      // Build the search query for location
      if (searchParams.location) {
        const locationParts = searchParams.location.split('-').map(part => part.trim());
        const conditions = [];

        for (const part of locationParts) {
          if (part) {
            conditions.push(
              `location.ilike.%${part}%`,
              `city.ilike.%${part}%`,
              `region.ilike.%${part}%`
            );
          }
        }

        if (conditions.length > 0) {
          query = query.or(conditions.join(','));
        }
      }

      if (searchParams.propertyType) {
        query = query.eq('type', searchParams.propertyType);
      }

      if (searchParams.propertyStatus) {
        query = query.eq('status', searchParams.propertyStatus);
      }

      if (searchParams.bedrooms) {
        query = query.gte('bedrooms', parseInt(searchParams.bedrooms));
      }

      if (searchParams.suites) {
        query = query.gte('suites', parseInt(searchParams.suites));
      }

      if (searchParams.parkingSpots) {
        query = query.gte('parking_spots', parseInt(searchParams.parkingSpots));
      }

      if (searchParams.priceRange) {
        const [min, max] = searchParams.priceRange.split('-').map(v => v ? parseInt(v) : null);
        if (min) query = query.gte('price', min);
        if (max) query = query.lte('price', max);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      if (!data || data.length === 0) {
        setSearchError(`Nenhum imóvel encontrado${searchParams.location ? ` em "${searchParams.location}"` : ''} com os critérios especificados.`);
        // Dispatch empty results
        const searchEvent = new CustomEvent('propertySearch', { 
          detail: {
            results: [],
            searchParams: searchParams
          }
        });
        window.dispatchEvent(searchEvent);
        return;
      }

      setSearchResults(data);

      // Save search to history
      await supabase.from('property_search').insert({
        location: searchParams.location,
        property_type: searchParams.propertyType,
        status: searchParams.propertyStatus,
        price_range_min: searchParams.priceRange ? parseInt(searchParams.priceRange.split('-')[0]) : null,
        price_range_max: searchParams.priceRange ? parseInt(searchParams.priceRange.split('-')[1]) : null,
        bedrooms: searchParams.bedrooms ? parseInt(searchParams.bedrooms) : null,
        suites: searchParams.suites ? parseInt(searchParams.suites) : null,
        parking_spots: searchParams.parkingSpots ? parseInt(searchParams.parkingSpots) : null
      });

      // Dispatch search results event
      const searchEvent = new CustomEvent('propertySearch', { 
        detail: {
          results: data,
          searchParams: searchParams
        }
      });
      window.dispatchEvent(searchEvent);

      // Scroll to properties section
      const propertiesSection = document.getElementById('properties');
      if (propertiesSection) {
        propertiesSection.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (error) {
      console.error('Error searching properties:', error);
      setSearchError('Ocorreu um erro ao buscar imóveis. Por favor, tente novamente.');
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchParams({
      location: '',
      propertyType: '',
      priceRange: '',
      bedrooms: '',
      suites: '',
      parkingSpots: '',
      propertyStatus: ''
    });
    setLocationStats(null);
    setSearchError('');
    setSearchResults([]);
  };

  const handleLocationClick = async (location: string) => {
    setSearchParams(prev => ({
      ...prev,
      location: location
    }));
    setLocationStats(null);
    
    // Trigger the search immediately after selecting a location
    await handleSearch();
    setShowLocationResults(true);
  };

  return (
    <div id="home" className="relative pt-16">
      <div className="absolute inset-0">
        <img
          className="w-full h-[600px] object-cover"
          src={siteMedia?.principal_img_site || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2075&q=80"}
          alt="Luxury home exterior"
        />
        <div className="absolute inset-0 bg-gray-900/60 mix-blend-multiply" />
      </div>

      <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl">
          Encontre o Imóvel dos Seus Sonhos
        </h1>
        <p className="mt-6 max-w-3xl text-xl text-gray-100">
          Especialista em imóveis, lançamentos e empreendimentos exclusivos.
        </p>

        <div className="mt-10">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl">
            <form onSubmit={handleSearch}>
              <div className="flex flex-col space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Localização
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={searchParams.location}
                        onChange={(e) => setSearchParams({...searchParams, location: e.target.value})}
                        placeholder="Bairro, cidade ou região"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
                      />
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                    {locationStats && Object.keys(locationStats).length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {Object.entries(locationStats).map(([key, value]: [string, any]) => (
                          <div
                            key={key}
                            className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
                            onClick={() => handleLocationClick(key)}
                          >
                            <div className="font-medium">{key}</div>
                            <div className="text-sm text-gray-500">
                              {value.count} imóvel(is) disponível(is)
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Imóvel
                    </label>
                    <select
                      value={searchParams.propertyType}
                      onChange={(e) => setSearchParams({...searchParams, propertyType: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
                    >
                      <option value="">Todos os tipos</option>
                      <option value="apartment">Apartamento</option>
                      <option value="house">Casa</option>
                      <option value="commercial">Comercial</option>
                      <option value="land">Terreno</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={searchParams.propertyStatus}
                      onChange={(e) => setSearchParams({...searchParams, propertyStatus: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
                    >
                      <option value="">Todos</option>
                      <option value="launch">Lançamento</option>
                      <option value="new">Novo</option>
                      <option value="used">Usado</option>
                    </select>
                  </div>
                </div>

                {showAdvancedSearch && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Faixa de Preço
                      </label>
                      <select
                        value={searchParams.priceRange}
                        onChange={(e) => setSearchParams({...searchParams, priceRange: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
                      >
                        <option value="">Qualquer valor</option>
                        <option value="0-500000">Até R$ 500.000</option>
                        <option value="500000-1000000">R$ 500.000 - R$ 1.000.000</option>
                        <option value="1000000-2000000">R$ 1.000.000 - R$ 2.000.000</option>
                        <option value="2000000-5000000">R$ 2.000.000 - R$ 5.000.000</option>
                        <option value="5000000-">Acima de R$ 5.000.000</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Dormitórios
                      </label>
                      <select
                        value={searchParams.bedrooms}
                        onChange={(e) => setSearchParams({...searchParams, bedrooms: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
                      >
                        <option value="">Qualquer</option>
                        <option value="1">1+</option>
                        <option value="2">2+</option>
                        <option value="3">3+</option>
                        <option value="4">4+</option>
                        <option value="5">5+</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Suítes
                      </label>
                      <select
                        value={searchParams.suites}
                        onChange={(e) => setSearchParams({...searchParams, suites: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
                      >
                        <option value="">Qualquer</option>
                        <option value="1">1+</option>
                        <option value="2">2+</option>
                        <option value="3">3+</option>
                        <option value="4">4+</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Vagas
                      </label>
                      <select
                        value={searchParams.parkingSpots}
                        onChange={(e) => setSearchParams({...searchParams, parkingSpots: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
                      >
                        <option value="">Qualquer</option>
                        <option value="1">1+</option>
                        <option value="2">2+</option>
                        <option value="3">3+</option>
                        <option value="4">4+</option>
                      </select>
                    </div>
                  </div>
                )}

                {searchError && (
                  <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-md">
                    <AlertCircle className="w-5 h-5" />
                    <span>{searchError}</span>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                    className="text-rose-600 hover:text-rose-700 text-sm font-medium"
                  >
                    {showAdvancedSearch ? 'Busca Simples' : 'Busca Avançada'}
                  </button>
                  
                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Limpar
                    </button>
                    <button
                      type="submit"
                      disabled={isSearching}
                      className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 disabled:opacity-50"
                    >
                      <Search className="w-4 h-4 mr-2" />
                      {isSearching ? 'Buscando...' : 'Buscar Imóveis'}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {showLocationResults && (
        <LocationSearchResults 
          location={searchParams.location}
          onClose={() => setShowLocationResults(false)}
          onSelectProperty={(property) => {
            setSelectedProperty(property);
            setShowLocationResults(false);
          }}
        />
      )}

      {selectedProperty && (
        <PropertyDetails
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
        />
      )}
    </div>
  );
}