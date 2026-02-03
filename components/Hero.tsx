import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const SLIDES = [
  {
    id: 1,
    image: "/images/samuel-regan-asante-J63ln0EZgtg-unsplash.jpg",
    title: "EVENT SERVICE",
    subtitle: "Audio, Video & Lighting Solutions"
  },
  {
    id: 2,
    image: "/images/austris-augusts-O-NvxOYwvHc-unsplash.jpg",
    title: "BRANDING & DESIGN",
    subtitle: "Identità visiva per il tuo business"
  },
  {
    id: 3,
    image: "/images/nick-gordon-G5oehOudyJ4-unsplash.jpg",
    title: "WEB DEVELOPMENT",
    subtitle: "Siti web e piattaforme performanti"
  },
  {
    id: 4,
    image: "/images/jose-g-ortega-castro-cn302rFpTVs-unsplash.jpg",
    title: "SOCIAL MEDIA",
    subtitle: "Gestione contenuti e crescita"
  }
];

const Hero: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-advance
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);

  return (
    <div id="home" className="relative h-screen w-full overflow-hidden bg-black group">
      {SLIDES.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
          
          <img 
            src={slide.image} 
            alt={slide.title} 
            className="w-full h-full object-cover transform scale-105 animate-[pulse-slow_10s_ease-in-out_infinite]"
          />

          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4">
            <h2 className="font-display italic font-black text-6xl md:text-9xl tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 outlined-text outlined-text-fill cursor-default select-none mb-4">
              {slide.title}
            </h2>
            <p className="text-white text-xl md:text-2xl font-light tracking-widest uppercase">
              {slide.subtitle}
            </p>
            <button className="mt-8 px-8 py-3 bg-neon hover:bg-white text-black font-black uppercase tracking-wider transform hover:scale-105 transition-all skew-x-[-10deg]">
              <span className="skew-x-[10deg] block">Scopri i Pacchetti</span>
            </button>
          </div>
        </div>
      ))}

      {/* Controls */}
      <button 
        onClick={prevSlide}
        className="absolute left-4 top-[62%] sm:top-1/2 -translate-y-1/2 -mt-1 sm:mt-0 z-30 text-white/50 hover:text-neon transition-colors p-2 bg-black/30 backdrop-blur rounded-full"
      >
        <ChevronLeft size={40} />
      </button>
      <button 
        onClick={nextSlide}
        className="absolute right-4 top-[62%] sm:top-1/2 -translate-y-1/2 -mt-1 sm:mt-0 z-30 text-white/50 hover:text-neon transition-colors p-2 bg-black/30 backdrop-blur rounded-full"
      >
        <ChevronRight size={40} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex space-x-3">
        {SLIDES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              idx === currentSlide ? 'bg-neon w-8' : 'bg-white/30 hover:bg-white'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default Hero;
