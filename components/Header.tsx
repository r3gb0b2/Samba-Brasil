
import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="absolute top-0 left-0 w-full z-50 py-6 px-4 md:px-12">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="bg-[#7db5d9] p-2 rounded-xl rotate-[-3deg] shadow-lg border-2 border-white">
             <span className="text-white font-black text-2xl px-1">SB</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-[#269f78] font-black text-xl leading-none tracking-tighter uppercase italic">
              Samba Brasil
            </h1>
            <span className="text-[#f37f3a] text-[10px] font-bold uppercase tracking-widest">20 Anos • Fortaleza</span>
          </div>
        </div>
        
        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-4">
          <a 
            href="#admin" 
            onClick={(e) => { e.preventDefault(); window.location.hash = '/admin'; }} 
            className="bg-[#269f78] hover:bg-[#1e7e5f] text-white px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all shadow-[0_4px_0_rgba(0,0,0,0.1)] active:translate-y-1"
          >
            Painel Admin
          </a>
        </nav>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden bg-[#269f78] text-white p-2 rounded-xl shadow-lg border-2 border-white"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Content */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-[#f4f1e1] border-b-4 border-[#269f78] p-6 shadow-2xl animate-in slide-in-from-top duration-300">
           <nav className="flex flex-col gap-4">
             <a 
              href="#admin" 
              onClick={(e) => { e.preventDefault(); setIsMenuOpen(false); window.location.hash = '/admin'; }} 
              className="bg-[#269f78] text-white px-6 py-4 rounded-2xl font-black text-center uppercase tracking-widest"
            >
              Acessar Painel Admin
            </a>
            <button 
              onClick={() => setIsMenuOpen(false)}
              className="text-[#269f78] font-black text-xs uppercase tracking-widest py-2"
            >
              Fechar Menu
            </button>
           </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
