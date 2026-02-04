
import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { dbService } from '../services/db';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');

  useEffect(() => {
    dbService.getSettings().then(s => setLogoUrl(s.logoUrl));
  }, []);

  return (
    <header className="absolute top-0 left-0 w-full z-50 py-8 px-6 md:px-16">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-6">
          <div className="h-14 md:h-20 flex items-center">
             {logoUrl ? (
               <img src={logoUrl} alt="Logo Samba Brasil" className="h-full w-auto object-contain max-w-[180px] md:max-w-[280px]" />
             ) : (
               <div className="bg-[#7db5d9] p-3 rounded-2xl rotate-[-3deg] shadow-xl border-2 border-white">
                 <span className="text-white font-black text-2xl px-2">SB</span>
               </div>
             )}
          </div>
          <div className="hidden lg:flex flex-col">
            <span className="text-[#f37f3a] text-[11px] font-black uppercase tracking-[0.3em] leading-none">20 Anos • Fortaleza</span>
            <div className="w-full h-0.5 bg-[#269f78] mt-2 opacity-20"></div>
          </div>
        </div>
        
        {/* Mobile Toggle */}
        <button 
          className="md:hidden bg-[#269f78] text-white p-3 rounded-[1.2rem] shadow-xl border-2 border-white transform active:scale-90 transition-transform"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Desktop Nav Placeholder */}
        <div className="hidden md:block">
           <button className="bg-[#269f78] text-white px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest border-b-4 border-green-900 shadow-lg hover:bg-[#1e7e5f] transition-all">
             Área Vip
           </button>
        </div>
      </div>

      {/* Mobile Menu Content */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-[100px] mx-6 bg-[#f4f1e1] border-4 border-[#269f78] p-10 rounded-[3rem] shadow-2xl animate-in zoom-in duration-300 z-[100]">
           <nav className="flex flex-col gap-6 text-center">
            <p className="text-[#269f78] font-black text-xl uppercase italic tracking-tighter mb-4">Samba Brasil 20 Anos</p>
            <button 
              onClick={() => setIsMenuOpen(false)}
              className="bg-[#269f78] text-white px-8 py-5 rounded-[2rem] font-black uppercase tracking-widest shadow-xl"
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
