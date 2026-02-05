
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { dbService } from '../services/db';
import { Photo } from '../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const PhotoCarousel: React.FC = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  // Fix: Replaced NodeJS.Timeout with any to avoid 'Cannot find namespace NodeJS' error in browser environment.
  const timerRef = useRef<any>(null);

  useEffect(() => {
    const loadPhotos = async () => {
      const allPhotos = await dbService.getPhotos();
      setPhotos(allPhotos.filter(p => p.active));
    };
    loadPhotos();
  }, []);

  const next = useCallback(() => {
    if (photos.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  }, [photos.length]);

  const prev = useCallback(() => {
    if (photos.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  }, [photos.length]);

  // Efeito para o Autoplay
  useEffect(() => {
    if (photos.length > 0 && !isPaused) {
      timerRef.current = setInterval(() => {
        next();
      }, 5000); // Muda a cada 5 segundos
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [next, photos.length, isPaused]);

  if (photos.length === 0) return null;

  return (
    <section id="galeria" className="py-20 bg-white overflow-hidden">
      <div className="container mx-auto px-4 mb-12">
        <h2 className="text-3xl md:text-4xl font-black text-[#269f78] text-center uppercase italic tracking-tighter">
          Momentos <span className="text-[#f37f3a]">Memoráveis</span>
        </h2>
        <div className="w-16 h-1.5 bg-[#f6c83e] mx-auto mt-4 rounded-full"></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-4">
        {/* Container do Slider com pausa no hover */}
        <div 
          className="relative overflow-hidden rounded-[2.5rem] md:rounded-[4rem] shadow-2xl border-4 md:border-8 border-[#f4f1e1] group"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div 
            className="flex transition-transform duration-700 ease-in-out" 
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {photos.map((photo) => (
              <div 
                key={photo.id} 
                className="w-full flex-shrink-0 aspect-[4/5] md:aspect-[16/9]"
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

          {/* Overlay de Gradiente */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none"></div>
          
          {/* Título da Foto */}
          {photos[currentIndex].title && (
            <div className="absolute bottom-8 left-8 right-8 text-white z-10 transition-opacity duration-300">
              <p className="font-black text-xl md:text-2xl uppercase italic drop-shadow-lg">
                {photos[currentIndex].title}
              </p>
            </div>
          )}

          {/* Botões Invisíveis para Mobile Swipe (Opcional, mas os botões abaixo já ajudam) */}
        </div>

        {/* Botões de Navegação */}
        <div className="flex justify-center items-center gap-6 mt-10">
          <button 
            onClick={() => { prev(); setIsPaused(true); }}
            className="bg-[#269f78] text-white p-4 rounded-full hover:bg-[#1e7e5f] transition-all shadow-xl active:scale-95 border-2 border-white"
            aria-label="Foto Anterior"
          >
            <ChevronLeft size={24} />
          </button>
          
          <div className="flex gap-2">
            {photos.map((_, idx) => (
              <button
                key={idx}
                onClick={() => { setCurrentIndex(idx); setIsPaused(true); }}
                className={`h-3 rounded-full transition-all duration-300 ${currentIndex === idx ? 'w-8 bg-[#f37f3a]' : 'w-3 bg-gray-200'}`}
              />
            ))}
          </div>

          <button 
            onClick={() => { next(); setIsPaused(true); }}
            className="bg-[#269f78] text-white p-4 rounded-full hover:bg-[#1e7e5f] transition-all shadow-xl active:scale-95 border-2 border-white"
            aria-label="Próxima Foto"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default PhotoCarousel;
