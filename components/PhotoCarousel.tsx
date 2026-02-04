
import React, { useEffect, useState } from 'react';
import { dbService } from '../services/db';
import { Photo } from '../types';

const PhotoCarousel: React.FC = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);

  useEffect(() => {
    const loadPhotos = async () => {
      const allPhotos = await dbService.getPhotos();
      setPhotos(allPhotos.filter(p => p.active));
    };
    loadPhotos();
  }, []);

  if (photos.length === 0) return null;

  // Duplicar array para efeito infinito
  const displayPhotos = [...photos, ...photos, ...photos];

  return (
    <section id="galeria" className="py-20 bg-white overflow-hidden">
      <div className="container mx-auto px-4 mb-12">
        <h2 className="text-3xl md:text-4xl font-black text-blue-900 text-center uppercase">
          Momentos <span className="text-yellow-500">Memoráveis</span>
        </h2>
        <div className="w-24 h-1 bg-yellow-400 mx-auto mt-4 rounded-full"></div>
      </div>

      <div className="relative">
        <div className="flex animate-scroll gap-4 md:gap-6 px-4">
          {displayPhotos.map((photo, index) => (
            <div 
              key={`${photo.id}-${index}`} 
              className="min-w-[240px] md:min-w-[300px] h-[320px] md:h-[400px] rounded-2xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-500"
            >
              <img 
                src={photo.url} 
                alt={photo.title} 
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PhotoCarousel;
