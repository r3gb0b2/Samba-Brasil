
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="absolute top-0 left-0 w-full z-50 py-6 px-4 sm:px-8 bg-gradient-to-b from-black/50 to-transparent">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-blue-900 font-bold text-xl">S</span>
          </div>
          <h1 className="text-white font-extrabold text-lg sm:text-2xl tracking-tighter uppercase leading-none">
            Samba <span className="text-yellow-400">Brasil</span>
            <span className="block text-[10px] sm:text-xs font-normal tracking-widest text-white/80">Fortaleza 2026</span>
          </h1>
        </div>
        
        <nav className="hidden md:flex gap-8 text-white font-semibold items-center">
          <a href="#" className="hover:text-yellow-400 transition-colors">Início</a>
          <a href="#galeria" className="hover:text-yellow-400 transition-colors">Galeria</a>
          <a href="#admin" onClick={(e) => { e.preventDefault(); window.location.hash = '/admin'; }} className="bg-yellow-400 text-blue-900 px-4 py-1 rounded-full text-sm hover:bg-yellow-500 transition-all">Admin</a>
        </nav>
      </div>
    </header>
  );
};

export default Header;
