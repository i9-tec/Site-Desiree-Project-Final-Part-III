import React from 'react';
import { Building2, Home, Building, Warehouse } from 'lucide-react';

export default function Categories() {
  const categories = [
    {
      icon: Building2,
      title: 'Lançamentos',
      description: 'Novos empreendimentos e pré-lançamentos exclusivos'
    },
    {
      icon: Home,
      title: 'Residencial',
      description: 'Casas e apartamentos para todos os estilos de vida'
    },
    {
      icon: Building,
      title: 'Alto Padrão',
      description: 'Imóveis de luxo em localizações privilegiadas'
    },
    {
      icon: Warehouse,
      title: 'Comercial',
      description: 'Salas comerciais e escritórios'
    }
  ];

  return (
    <div className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Especialidades</h2>
          <p className="mt-4 text-lg text-gray-600">
            Encontre o imóvel ideal para você em nossa seleção exclusiva
          </p>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
            >
              <div className="w-12 h-12 bg-rose-100 rounded-lg flex items-center justify-center mb-4">
                <category.icon className="w-6 h-6 text-rose-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">{category.title}</h3>
              <p className="mt-2 text-gray-600">{category.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}