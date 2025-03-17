import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { X, Plus, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface PropertyFormProps {
  onSuccess: () => void;
}

export default function PropertyForm({ onSuccess }: PropertyFormProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    city: '',
    region: '',
    type: 'apartment',
    status: 'new',
    display_status: '',
    bedrooms: '',
    suites: '',
    bathrooms: '',
    parking_spots: '',
    area: '',
    amenities: [] as string[],
    images: [] as string[],
    video_links: [] as string[]
  });

  const [newAmenity, setNewAmenity] = useState('');
  const [newVideoLink, setNewVideoLink] = useState('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);

  useEffect(() => {
    if (isEditing) {
      loadProperty();
    }
  }, [id]);

  const loadProperty = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      if (data) {
        setFormData({
          ...data,
          price: data.price.toString(),
          bedrooms: data.bedrooms?.toString() || '',
          suites: data.suites?.toString() || '',
          bathrooms: data.bathrooms?.toString() || '',
          parking_spots: data.parking_spots?.toString() || '',
          area: data.area?.toString() || '',
          amenities: data.amenities || [],
          images: data.images || [],
          video_links: data.video_links || []
        });

        // Load preview images
        if (data.images && data.images.length > 0) {
          const previews = data.images.map((image: string) => 
            image.startsWith('http') ? image : 
            `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/properties/${image}`
          );
          setPreviewImages(previews);
        }
      }
    } catch (err: any) {
      console.error('Error loading property:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddAmenity = () => {
    if (newAmenity.trim()) {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, newAmenity.trim()]
      }));
      setNewAmenity('');
    }
  };

  const handleRemoveAmenity = (index: number) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.filter((_, i) => i !== index)
    }));
  };

  const handleAddVideoLink = () => {
    if (newVideoLink.trim()) {
      try {
        // Validate URL
        new URL(newVideoLink.trim());
        
        setFormData(prev => ({
          ...prev,
          video_links: [...prev.video_links, newVideoLink.trim()]
        }));
        setNewVideoLink('');
      } catch (e) {
        setError('URL do vídeo inválida. Por favor, insira uma URL completa (começando com http:// ou https://)');
      }
    }
  };

  const handleRemoveVideoLink = (index: number) => {
    setFormData(prev => ({
      ...prev,
      video_links: prev.video_links.filter((_, i) => i !== index)
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      
      // Check if adding these files would exceed the 10 image limit
      if (previewImages.length + files.length > 10) {
        setError('Máximo de 10 imagens permitido');
        return;
      }
      
      setError('');
      setImageFiles(prev => [...prev, ...files]);
      
      // Create preview URLs
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setPreviewImages(prev => [...prev, ...newPreviews]);
    }
  };

  const handleRemoveImage = (index: number) => {
    // If it's a new image (from imageFiles)
    if (index < imageFiles.length) {
      URL.revokeObjectURL(previewImages[index]);
      setImageFiles(prev => prev.filter((_, i) => i !== index));
      setPreviewImages(prev => prev.filter((_, i) => i !== index));
    } 
    // If it's an existing image (from formData.images)
    else {
      const existingImageIndex = index - imageFiles.length;
      setFormData(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== existingImageIndex)
      }));
      setPreviewImages(prev => prev.filter((_, i) => i !== index));
    }
  };

  const uploadImages = async (): Promise<string[]> => {
    if (imageFiles.length === 0) return formData.images;

    setIsUploading(true);
    const uploadedImagePaths: string[] = [];
    
    try {
      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('properties')
          .upload(filePath, file);
        
        if (uploadError) throw uploadError;
        
        uploadedImagePaths.push(filePath);
        setUploadProgress(Math.round(((i + 1) / imageFiles.length) * 100));
      }
      
      return [...formData.images, ...uploadedImagePaths];
    } catch (err: any) {
      console.error('Error uploading images:', err);
      setError(`Erro ao fazer upload das imagens: ${err.message}`);
      return formData.images;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    
    try {
      // Validate form
      if (!formData.title || !formData.location || !formData.price) {
        throw new Error('Preencha todos os campos obrigatórios');
      }
      
      // Upload images first
      const imagePaths = await uploadImages();
      
      // Prepare data for submission
      const propertyData = {
        ...formData,
        price: parseFloat(formData.price),
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
        suites: formData.suites ? parseInt(formData.suites) : null,
        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
        parking_spots: formData.parking_spots ? parseInt(formData.parking_spots) : null,
        area: formData.area ? parseFloat(formData.area) : null,
        images: imagePaths,
        display_status: formData.display_status || null
      };
      
      let result;
      
      if (isEditing) {
        // Update existing property
        result = await supabase
          .from('properties')
          .update(propertyData)
          .eq('id', id);
      } else {
        // Insert new property
        result = await supabase
          .from('properties')
          .insert(propertyData);
      }
      
      if (result.error) throw result.error;
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/admin/properties');
        onSuccess();
      }, 1500);
      
    } catch (err: any) {
      console.error('Error saving property:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !isUploading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Carregando...</p>
      </div>
    );
  }

  // Helper function to extract video ID from YouTube URL
  const getYouTubeVideoId = (url: string) => {
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname.includes('youtube.com')) {
        return urlObj.searchParams.get('v');
      } else if (urlObj.hostname.includes('youtu.be')) {
        return urlObj.pathname.substring(1);
      }
    } catch (e) {
      return null;
    }
    return null;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Editar Imóvel' : 'Novo Imóvel'}
        </h2>
        <button
          onClick={() => navigate('/admin/properties')}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <X className="w-4 h-4 mr-2" />
          Cancelar
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg mb-6">
          Imóvel salvo com sucesso!
        </div>
      )}

      {isUploading && (
        <div className="mb-6">
          <div className="bg-gray-100 rounded-full h-4 mb-2">
            <div 
              className="bg-rose-500 h-4 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600">Fazendo upload das imagens: {uploadProgress}%</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow-sm rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título*
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Preço (R$)*
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Localização (Bairro)*
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cidade
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <input
              type="text"
              name="region"
              value={formData.region}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Imóvel
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
            >
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
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
            >
              <option value="launch">Lançamento</option>
              <option value="new">Novo</option>
              <option value="used">Usado</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status Personalizado (opcional)
            </label>
            <input
              type="text"
              name="display_status"
              value={formData.display_status}
              onChange={handleChange}
              placeholder="Ex: Pronto para morar"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dormitórios
            </label>
            <input
              type="number"
              name="bedrooms"
              value={formData.bedrooms}
              onChange={handleChange}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Suítes
            </label>
            <input
              type="number"
              name="suites"
              value={formData.suites}
              onChange={handleChange}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Banheiros
            </label>
            <input
              type="number"
              name="bathrooms"
              value={formData.bathrooms}
              onChange={handleChange}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vagas de Garagem
            </label>
            <input
              type="number"
              name="parking_spots"
              value={formData.parking_spots}
              onChange={handleChange}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Área (m²)
            </label>
            <input
              type="number"
              name="area"
              value={formData.area}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Diferenciais
            </label>
            <div className="flex space-x-2 mb-2">
              <input
                type="text"
                value={newAmenity}
                onChange={(e) => setNewAmenity(e.target.value)}
                placeholder="Ex: Piscina, Academia, etc."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
              />
              <button
                type="button"
                onClick={handleAddAmenity}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-rose-600 hover:bg-rose-700"
              >
                <Plus className="w-4 h-4 mr-1" />
                Adicionar
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.amenities.map((amenity, index) => (
                <div
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-rose-100 text-rose-800"
                >
                  {amenity}
                  <button
                    type="button"
                    onClick={() => handleRemoveAmenity(index)}
                    className="ml-1 text-rose-600 hover:text-rose-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Links de Vídeos (YouTube, Vimeo, etc.)
            </label>
            <div className="flex space-x-2 mb-2">
              <input
                type="text"
                value={newVideoLink}
                onChange={(e) => setNewVideoLink(e.target.value)}
                placeholder="Ex: https://www.youtube.com/watch?v=..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
              />
              <button
                type="button"
                onClick={handleAddVideoLink}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-rose-600 hover:bg-rose-700"
              >
                <Plus className="w-4 h-4 mr-1" />
                Adicionar
              </button>
            </div>
            
            {formData.video_links.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                {formData.video_links.map((link, index) => {
                  const youtubeId = getYouTubeVideoId(link);
                  return (
                    <div key={index} className="relative group border border-gray-200 rounded-lg overflow-hidden">
                      {youtubeId ? (
                        <div className="aspect-video">
                          <img 
                            src={`https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`}
                            alt={`Video thumbnail ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center">
                              <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[16px] border-l-white border-b-[8px] border-b-transparent ml-1"></div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="aspect-video bg-gray-100 flex items-center justify-center">
                          <span className="text-gray-500 text-sm px-4 text-center">
                            {link}
                          </span>
                        </div>
                      )}
                      <div className="p-2 bg-white flex justify-between items-center">
                        <span className="text-sm text-gray-600 truncate flex-1">{link}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveVideoLink(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Imagens (máximo 10)
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
              disabled={previewImages.length >= 10}
            />
            <p className="text-sm text-gray-500 mt-1">
              {previewImages.length}/10 imagens
            </p>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mt-4">
              {previewImages.map((src, index) => (
                <div key={index} className="relative group">
                  <img
                    src={src}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            type="submit"
            disabled={loading || isUploading}
            className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 disabled:opacity-50"
          >
            {loading ? 'Salvando...' : isEditing ? 'Atualizar Imóvel' : 'Cadastrar Imóvel'}
          </button>
        </div>
      </form>
    </div>
  );
}