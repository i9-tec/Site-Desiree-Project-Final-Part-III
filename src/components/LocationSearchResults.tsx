import React from 'react';
import { X, MapPin, Bed, Bath, Car, Square } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface LocationSearchResultsProps {
  location: string;
  onClose: () => void;
  onSelectProperty: (property: any) => void;
}

export default function LocationSearchResults({ location, onClose, onSelectProperty }: LocationSearchResultsProps) {
  const [properties, setProperties] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    fetchPropertiesByLocation();
  }, [location]);

  const fetchPropertiesByLocation = async () => {
    if (!location) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const locationParts = location.split('-').map(part => part.trim());
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

      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .or(conditions.join(','));

      if (error) throw error;
      
      if (data && data.length > 0) {
        setProperties(data);
      } else {
        // If no properties found, close the popup
        onClose();
      }
    } catch (err: any) {
      console.error('Error fetching properties by location:', err);
      setError('Erro ao buscar imóveis. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // If there are no additional properties, don't show the popup
  if (properties.length <= 1) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-20 right-20 bg-white dark:bg-gray-800 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 z-50 p-2 rounded-full shadow-lg"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Imóveis em {location}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {properties.length} imóveis encontrados nesta localização
          </p>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando imóveis...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 p-4 rounded-lg">
              {error}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {properties.map((property) => (
                <div 
                  key={property.id}
                  className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => onSelectProperty(property)}
                >
                  <div className="flex flex-col sm:flex-row">
                    <div className="sm:w-1/3">
                      <img
                        src={property.images?.[0] ? 
                          (property.images[0].startsWith('http') ? property.images[0] : 
                          `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/properties/${property.images[0]}`)
                          : "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80"
                        }
                        alt={property.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="sm:w-2/3 p-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{property.title}</h3>
                      <div className="mt-1 flex items-center text-gray-600 dark:text-gray-400 text-sm">
                        <MapPin className="w-4 h-4 mr-1" />
                        {property.location}
                        {property.city && (
                          <span className="ml-1">
                            - {property.city}
                            {property.region && `, ${property.region}`}
                          </span>
                        )}
                      </div>
                      <div className="mt-2 text-rose-600 dark:text-rose-400 font-semibold">
                        R$ {Number(property.price).toLocaleString('pt-BR')}
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-2 text-gray-600 dark:text-gray-400 text-sm">
                        <div className="flex items-center">
                          <Bed className="w-3 h-3 mr-1" />
                          {property.bedrooms} Dorm ({property.suites} suítes)
                        </div>
                        <div className="flex items-center">
                          <Bath className="w-3 h-3 mr-1" />
                          {property.bathrooms} Banheiros
                        </div>
                        <div className="flex items-center">
                          <Car className="w-3 h-3 mr-1" />
                          {property.parking_spots} Vagas
                        </div>
                        <div className="flex items-center">
                          <Square className="w-3 h-3 mr-1" />
                          {property.area}m²
                        </div>
                      </div>
                      <div className="mt-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          property.status === 'launch' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                          property.status === 'new' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {property.display_status || (
                            property.status === 'launch' ? 'Lançamento' :
                            property.status === 'new' ? 'Novo' : 'Usado'
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}