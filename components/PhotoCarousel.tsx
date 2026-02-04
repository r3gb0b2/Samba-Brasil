
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

  // Multiplicar array para manter o loop infinito sem buracos
  const displayPhotos = [...photos, ...photos, ...photos, ...photos];

  return (
    <section id="galeria" className="py-20 bg-white overflow-hidden">
      <div className="container mx-auto px-4 mb-10 text-center">
        <h2 className="text-3xl md:text-5xl font-black text-[#269f78] uppercase italic tracking-tighter">
          Nossa <span className="text-[#f37f3a]">História</span>
        </h2>
      </div>

      <div className="relative mt-10">
        <div className="flex animate-scroll gap-4 md:gap-8 px-4">
          {displayPhotos.map((photo, index) => (
            <div 
              key={`${photo.id}-${index}`} 
              className="min-w-[200px] md:min-w-[320px] h-[280px] md:h-[420px] rounded-[2rem] overflow-hidden shadow-xl border-2 border-[#f4f1e1] flex-shrink-0 transform transition-transform hover:scale-105 duration-500"
            >
              <img 
                src={photo.url} 
                alt={photo.title} 
                className="w-full h-full object-cover object-center"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&q=80&w=800';
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PhotoCarousel;
