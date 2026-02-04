
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
        <h2 className="text-3xl md:text-4xl font-black text-[#269f78] text-center uppercase italic tracking-tighter">
          Momentos <span className="text-[#f37f3a]">Memoráveis</span>
        </h2>
        <div className="w-16 h-1.5 bg-[#f6c83e] mx-auto mt-4 rounded-full"></div>
      </div>

      <div className="relative">
        <div className="flex animate-scroll gap-4 md:gap-8 px-4">
          {displayPhotos.map((photo, index) => (
            <div 
              key={`${photo.id}-${index}`} 
              className="min-w-[200px] md:min-w-[320px] h-[280px] md:h-[420px] rounded-3xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-500 border-2 border-[#f4f1e1]"
            >
              <img 
                src={photo.url} 
                alt={photo.title} 
                className="w-full h-full object-cover object-center"
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
