import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export default function AboutMeForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    id: '',
    profile_image: '',
    my_story: ''
  });

  useEffect(() => {
    loadAboutMeData();
  }, []);

  const loadAboutMeData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('about_me')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setFormData({
          id: data.id,
          profile_image: data.profile_image,
          my_story: data.my_story
        });
      }
    } catch (err: any) {
      console.error('Error loading about me data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    
    try {
      // Validate form
      if (!formData.profile_image || !formData.my_story) {
        throw new Error('Preencha todos os campos obrigatórios');
      }
      
      // Check if URL is valid
      try {
        new URL(formData.profile_image);
      } catch (e) {
        throw new Error('URL da imagem de perfil inválida');
      }
      
      let result;
      
      if (formData.id) {
        // Update existing record
        result = await supabase
          .from('about_me')
          .update({
            profile_image: formData.profile_image,
            my_story: formData.my_story
          })
          .eq('id', formData.id);
      } else {
        // Insert new record
        result = await supabase
          .from('about_me')
          .insert({
            profile_image: formData.profile_image,
            my_story: formData.my_story
          });
      }
      
      if (result.error) throw result.error;
      
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
      
    } catch (err: any) {
      console.error('Error saving about me data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Carregando...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Sobre Mim</h2>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg mb-6">
          Informações salvas com sucesso!
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow-sm rounded-lg p-6">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Foto de Perfil (URL)*
            </label>
            <input
              type="text"
              name="profile_image"
              value={formData.profile_image}
              onChange={handleChange}
              placeholder="https://exemplo.com/minha-foto.jpg"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              Insira a URL completa da imagem (deve começar com http:// ou https://)
            </p>
          </div>

          {formData.profile_image && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Pré-visualização:</p>
              <div className="w-40 h-40 rounded-lg overflow-hidden">
                <img 
                  src={formData.profile_image} 
                  alt="Pré-visualização" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Erro+na+imagem';
                    setError('Não foi possível carregar a imagem. Verifique a URL.');
                  }}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Minha História*
            </label>
            <textarea
              name="my_story"
              value={formData.my_story}
              onChange={handleChange}
              rows={8}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
            ></textarea>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Salvar Informações'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}