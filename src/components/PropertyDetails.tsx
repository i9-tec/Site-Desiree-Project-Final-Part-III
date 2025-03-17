import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, MapPin, Bed, Bath, Car, Square, Play, Maximize2, Minimize2 } from 'lucide-react';

interface PropertyDetailsProps {
  property: any;
  onClose: () => void;
}

export default function PropertyDetails({ property, onClose }: PropertyDetailsProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showGallery, setShowGallery] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState('');
  const [playingVideoIndex, setPlayingVideoIndex] = useState<number | null>(null);
  const [expandedVideoIndex, setExpandedVideoIndex] = useState<number | null>(null);
  const videoRefs = useRef<(HTMLIFrameElement | null)[]>([]);

  const images = property.images?.map((image: string) => 
    image.startsWith('http') ? image : 
    `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/properties/${image}`
  ) || [];

  const hasMultipleImages = images.length > 1;
  const hasVideos = property.video_links && property.video_links.length > 0;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (expandedVideoIndex !== null) {
          setExpandedVideoIndex(null);
        } else if (showVideo) {
          setShowVideo(false);
        } else if (showGallery) {
          setShowGallery(false);
        } else {
          onClose();
        }
      } else if (e.key === 'ArrowLeft') {
        setCurrentImageIndex(prev => 
          prev === 0 ? images.length - 1 : prev - 1
        );
      } else if (e.key === 'ArrowRight') {
        setCurrentImageIndex(prev => 
          prev === images.length - 1 ? 0 : prev + 1
        );
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showGallery, showVideo, images.length, onClose, expandedVideoIndex]);

  const openVideo = (url: string) => {
    setCurrentVideoUrl(url);
    setShowVideo(true);
  };

  const toggleVideoPlay = (index: number) => {
    if (playingVideoIndex === index) {
      setPlayingVideoIndex(null);
    } else {
      setPlayingVideoIndex(index);
    }
  };

  const toggleVideoExpand = (index: number) => {
    if (expandedVideoIndex === index) {
      setExpandedVideoIndex(null);
    } else {
      setExpandedVideoIndex(index);
    }
  };

  // Helper function to get YouTube embed URL
  const getEmbedUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      let videoId;
      
      if (urlObj.hostname.includes('youtube.com')) {
        videoId = urlObj.searchParams.get('v');
      } else if (urlObj.hostname.includes('youtu.be')) {
        videoId = urlObj.pathname.substring(1);
      }
      
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
      }
      
      // Handle Vimeo URLs
      if (urlObj.hostname.includes('vimeo.com')) {
        const vimeoId = urlObj.pathname.split('/').pop();
        if (vimeoId) {
          return `https://player.vimeo.com/video/${vimeoId}?autoplay=1`;
        }
      }
      
      // Return original URL if we can't parse it
      return url;
    } catch (e) {
      return url;
    }
  };

  // Helper function to get YouTube video ID
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

  const VideoPlayer = () => (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      <button
        onClick={() => setShowVideo(false)}
        className="absolute top-6 right-6 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors duration-200 z-50"
      >
        <X className="w-8 h-8" />
      </button>
      
      <div className="w-full max-w-4xl aspect-video">
        <iframe
          src={getEmbedUrl(currentVideoUrl)}
          className="w-full h-full"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    </div>
  );

  const ImageGallery = () => (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      {/* Top close button */}
      <button
        onClick={() => setShowGallery(false)}
        className="absolute top-20 right-20 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors duration-200 z-50"
      >
        <X className="w-8 h-8" />
      </button>

      <button
        onClick={() => setCurrentImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1)}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 p-2 rounded-full text-white transition-colors duration-200"
      >
        <ChevronLeft className="w-8 h-8" />
      </button>

      <button
        onClick={() => setCurrentImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1)}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 p-2 rounded-full text-white transition-colors duration-200"
      >
        <ChevronRight className="w-8 h-8" />
      </button>

      <div className="relative max-w-6xl max-h-[80vh] mx-auto">
        <img
          src={images[currentImageIndex]}
          alt={`${property.title} - Imagem ${currentImageIndex + 1}`}
          className="max-w-full max-h-[80vh] object-contain"
        />

        {/* Image counter */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full">
          {currentImageIndex + 1} / {images.length}
        </div>

        {/* Thumbnail navigation */}
        <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 flex space-x-2 overflow-x-auto max-w-full p-2">
          {images.map((image: string, index: number) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-16 h-16 flex-shrink-0 rounded-md overflow-hidden border-2 transition-all ${
                index === currentImageIndex ? 'border-white' : 'border-transparent opacity-50'
              }`}
            >
              <img
                src={image}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const ExpandedVideo = ({ videoUrl, index }: { videoUrl: string, index: number }) => (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <button
        onClick={() => setExpandedVideoIndex(null)}
        className="absolute top-20 right-20 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors duration-200 z-50"
      >
        <X className="w-8 h-8" />
      </button>
      
      <div className="w-full max-w-5xl aspect-video">
        <iframe
          src={getEmbedUrl(videoUrl)}
          className="w-full h-full"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          ref={el => videoRefs.current[index] = el}
        ></iframe>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto relative">
        {/* Top close button - Repositioned to be more visible */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 bg-white dark:bg-gray-800 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 z-50 p-2 rounded-full shadow-lg"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{property.title}</h2>
          
          {/* Main image */}
          <div className="relative aspect-video mb-6 rounded-lg overflow-hidden">
            <img
              src={images[currentImageIndex]}
              alt={`${property.title} - Imagem principal`}
              className="w-full h-full object-cover cursor-pointer"
              onClick={() => setShowGallery(true)}
            />
            
            {hasMultipleImages && (
              <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                {currentImageIndex + 1} / {images.length}
              </div>
            )}
          </div>

          {/* Thumbnail strip - Limited to 10 visible thumbnails */}
          {hasMultipleImages && (
            <div className="grid grid-cols-10 gap-2 pb-4 mb-6">
              {images.slice(0, 10).map((image: string, index: number) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`aspect-square rounded-md overflow-hidden border-2 transition-all ${
                    index === currentImageIndex ? 'border-rose-500' : 'border-transparent opacity-50'
                  } hover:opacity-100`}
                >
                  <img
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Videos section */}
          {hasVideos && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Vídeos</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {property.video_links.map((videoUrl: string, index: number) => {
                  // Try to get YouTube video ID for thumbnail
                  let thumbnailUrl = '';
                  const youtubeId = getYouTubeVideoId(videoUrl);
                  if (youtubeId) {
                    thumbnailUrl = `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`;
                  }

                  const isPlaying = playingVideoIndex === index;
                  const isExpanded = expandedVideoIndex === index;

                  return (
                    <div 
                      key={index}
                      className="relative aspect-video rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 group"
                    >
                      {isPlaying ? (
                        <div className="w-full h-full">
                          <iframe
                            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
                            className="w-full h-full"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            ref={el => videoRefs.current[index] = el}
                          ></iframe>
                          <div className="absolute top-2 right-2 flex space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleVideoExpand(index);
                              }}
                              className="bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full transition-colors"
                            >
                              <Maximize2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleVideoPlay(index);
                              }}
                              className="bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {thumbnailUrl ? (
                            <img 
                              src={thumbnailUrl} 
                              alt={`Video ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                              <span className="text-gray-500 dark:text-gray-400">Vídeo {index + 1}</span>
                            </div>
                          )}
                          <div 
                            className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-all flex items-center justify-center cursor-pointer"
                            onClick={() => toggleVideoPlay(index)}
                          >
                            <div className="w-16 h-16 rounded-full bg-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                              <Play className="w-8 h-8 text-white fill-white" />
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Property details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center text-gray-600 dark:text-gray-400 mb-4">
                <MapPin className="w-5 h-5 mr-2" />
                <span>{property.location}</span>
                {property.city && (
                  <span className="ml-1 text-gray-500">
                    - {property.city}
                    {property.region && `, ${property.region}`}
                  </span>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <Bed className="w-5 h-5 mr-2" />
                  {property.bedrooms} Dormitórios ({property.suites} suítes)
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <Bath className="w-5 h-5 mr-2" />
                  {property.bathrooms} Banheiros
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <Car className="w-5 h-5 mr-2" />
                  {property.parking_spots} Vagas
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <Square className="w-5 h-5 mr-2" />
                  {property.area}m²
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Valor</h3>
                <p className="text-2xl font-bold text-rose-600">
                  R$ {Number(property.price).toLocaleString('pt-BR')}
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Status</h3>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  property.status === 'launch' ? 'bg-blue-100 text-blue-800' :
                  property.status === 'new' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {property.display_status || (
                    property.status === 'launch' ? 'Lançamento' :
                    property.status === 'new' ? 'Novo' : 'Usado'
                  )}
                </span>
              </div>
            </div>

            <div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Descrição</h3>
                <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line">
                  {property.description}
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Diferenciais</h3>
                <div className="flex flex-wrap gap-2">
                  {property.amenities?.map((amenity: string, index: number) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  const contactSection = document.getElementById('contact');
                  if (contactSection) {
                    onClose();
                    contactSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="w-full bg-rose-600 text-white py-3 rounded-md hover:bg-rose-700 transition-colors duration-200"
              >
                Agendar Visita
              </button>
            </div>
          </div>
        </div>
      </div>

      {showGallery && <ImageGallery />}
      {showVideo && <VideoPlayer />}
      {expandedVideoIndex !== null && (
        <ExpandedVideo 
          videoUrl={property.video_links[expandedVideoIndex]} 
          index={expandedVideoIndex} 
        />
      )}
    </div>
  );
}