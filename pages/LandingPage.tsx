
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import PhotoCarousel from '../components/PhotoCarousel';
import { dbService } from '../services/db';
import { SiteSettings } from '../types';
import { Users, Mail, Phone, CheckCircle, AlertCircle, Calendar, MapPin, Ticket } from 'lucide-react';

const LandingPage: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      const s = await dbService.getSettings();
      setSettings(s);
    };
    loadSettings();
  }, []);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 11) value = value.slice(0, 11);
    let masked = "";
    if (value.length > 0) {
      masked = "(" + value.substring(0, 2);
      if (value.length > 2) {
        masked += ") " + value.substring(2, 6);
        if (value.length > 6) {
          masked += "-" + value.substring(6, 11);
        }
      }
    }
    setFormData({ ...formData, phone: masked });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: null, message: '' });

    const nameParts = formData.name.trim().split(/\s+/);
    if (nameParts.length < 2) {
      setStatus({ type: 'error', message: 'Por favor, insira nome e sobrenome.' });
      setLoading(false);
      return;
    }

    try {
      const result = await dbService.addLead(formData);
      if (result.success) {
        setStatus({ type: 'success', message: result.message });
        setFormData({ name: '', email: '', phone: '' });
      } else {
        setStatus({ type: 'error', message: result.message });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Erro no servidor. Tente novamente.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen">
      <Header />
      
      {/* Hero Cartaz Section */}
      <section className="relative pt-24 pb-12 overflow-hidden">
        {/* Banner principal adaptado */}
        <div className="container mx-auto px-4 flex flex-col items-center">
          
          <div className="w-full max-w-4xl relative">
             {/* Logo 20 Anos (Simulado via Banner ou CSS) */}
             <div className="flex justify-center mb-8">
               <div className="text-center relative">
                 <h2 className="text-4xl md:text-6xl font-black text-[#269f78] italic uppercase leading-none tracking-tighter">
                   SAMBA <span className="text-[#f37f3a]">BRASIL</span>
                 </h2>
                 <div className="inline-block bg-[#f6c83e] text-[#269f78] px-4 py-1 rounded-full font-black text-lg md:text-2xl mt-2 rotate-[-2deg] shadow-lg border-2 border-white">
                   20 ANOS
                 </div>
                 <div className="text-[#7db5d9] font-black text-xl italic mt-2">Fortaleza</div>
               </div>
             </div>

             {/* Banner Imagem (configurado no Admin) */}
             <div className="w-full aspect-[21/9] md:aspect-[3/1] overflow-hidden rounded-[2rem] shadow-2xl border-4 border-white mb-12 transform rotate-[1deg]">
               {settings?.heroBannerUrl ? (
                 <img src={settings.heroBannerUrl} className="w-full h-full object-cover" alt="Samba Brasil 20 Anos" />
               ) : (
                 <div className="w-full h-full bg-[#f37f3a]/20 animate-pulse flex items-center justify-center">
                    <span className="text-[#f37f3a] font-bold">Banner Principal</span>
                 </div>
               )}
             </div>

             {/* Pré-venda Tag (Destaque do Cartaz) */}
             <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center">
               <div className="bg-[#7db5d9] text-white px-8 py-2 rounded-full font-black text-lg shadow-lg border-2 border-white uppercase mb-[-10px] z-10 scale-90 md:scale-100">
                 PRÉ-VENDA
               </div>
               <div className="bg-[#f37f3a] text-white px-8 md:px-12 py-4 md:py-6 rounded-2xl md:rounded-3xl font-black text-3xl md:text-6xl shadow-2xl border-4 border-white transform rotate-[-2deg] tracking-tight">
                 12.FEVEREIRO
               </div>
             </div>
          </div>
        </div>
      </section>

      {/* Info & Form Section */}
      <section className="pt-20 pb-32 px-4">
        <div className="container mx-auto flex flex-col lg:flex-row gap-16 items-center">
          
          <div className="flex-1 space-y-8">
            <div className="inline-flex items-center gap-2 bg-[#269f78] text-white px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest">
              <MapPin className="w-3 h-3" /> Marina Park • Fortaleza
            </div>
            <h3 className="text-4xl md:text-6xl font-black text-[#269f78] leading-[0.9] uppercase italic tracking-tighter">
              A CAPITAL DO SAMBA <br/> <span className="text-[#f37f3a]">EM FESTA!</span>
            </h3>
            <p className="text-gray-600 font-bold text-lg leading-relaxed max-w-xl">
              Há duas décadas escrevendo a história do samba no Ceará. Prepare-se para a maior edição de todos os tempos.
            </p>
            
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-white p-6 rounded-3xl shadow-sm border-2 border-[#f4f1e1]">
                 <Calendar className="text-[#f37f3a] w-8 h-8 mb-2" />
                 <p className="text-[10px] uppercase font-black text-gray-400">Quando</p>
                 <p className="font-black text-[#269f78]">12 de Outubro</p>
               </div>
               <div className="bg-white p-6 rounded-3xl shadow-sm border-2 border-[#f4f1e1]">
                 <Ticket className="text-[#7db5d9] w-8 h-8 mb-2" />
                 <p className="text-[10px] uppercase font-black text-gray-400">Onde Comprar</p>
                 <p className="font-black text-[#269f78]">stingressos.com.br</p>
               </div>
            </div>
          </div>

          {/* Form com Estilo de Colagem */}
          <div className="w-full max-w-md">
            <div className="bg-white p-8 md:p-10 rounded-[3rem] shadow-[0_32px_0_rgba(38,159,120,0.1)] border-4 border-[#269f78] relative overflow-hidden">
              {/* Detalhe visual de fita adesiva */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-32 h-8 bg-white/40 backdrop-blur-sm border border-white/50 rotate-[-2deg]"></div>
              
              <h4 className="text-2xl font-black text-[#269f78] mb-2 uppercase tracking-tighter italic">Lista Prioritária</h4>
              <p className="text-gray-500 font-bold text-xs mb-8 uppercase tracking-widest">Ganhe 1h de acesso antes da abertura oficial da pré-venda.</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-[#269f78] uppercase tracking-widest ml-2">Quem é você?</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Nome e Sobrenome"
                    className="w-full bg-[#f4f1e1] px-6 py-4 rounded-2xl border-2 border-transparent focus:border-[#f37f3a] outline-none font-bold text-gray-700 transition-all"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-[#269f78] uppercase tracking-widest ml-2">E-mail para o convite</label>
                  <input 
                    type="email" 
                    required
                    placeholder="email@exemplo.com"
                    className="w-full bg-[#f4f1e1] px-6 py-4 rounded-2xl border-2 border-transparent focus:border-[#f37f3a] outline-none font-bold text-gray-700 transition-all"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-[#269f78] uppercase tracking-widest ml-2">WhatsApp</label>
                  <input 
                    type="tel" 
                    required
                    placeholder="(85) 9999-9999"
                    className="w-full bg-[#f4f1e1] px-6 py-4 rounded-2xl border-2 border-transparent focus:border-[#f37f3a] outline-none font-bold text-gray-700 transition-all"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                  />
                </div>

                <button 
                  disabled={loading}
                  className="w-full bg-[#f37f3a] hover:bg-[#d86b2b] text-white font-black py-5 rounded-2xl shadow-xl shadow-orange-500/30 transform active:scale-95 transition-all uppercase tracking-widest mt-4 border-b-4 border-orange-800"
                >
                  {loading ? 'PROCESSANDO...' : 'QUERO MINHA VAGA NA LISTA'}
                </button>
              </form>

              {status.type && (
                <div className={`mt-6 p-4 rounded-2xl flex items-center gap-3 animate-bounce ${status.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {status.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                  <p className="text-[10px] font-black uppercase tracking-widest">{status.message}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <PhotoCarousel />

      {/* Footer Visual */}
      <footer className="bg-[#269f78] text-white py-20 px-4 relative overflow-hidden">
        {/* Grafismo de fundo (Tampinha de garrafa simulada) */}
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#f6c83e] rounded-full opacity-20 blur-2xl"></div>
        
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12 relative z-10">
          <div className="text-center md:text-left">
            <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-none">
              SAMBA <br/><span className="text-[#f6c83e]">BRASIL</span>
            </h2>
            <p className="text-white/80 mt-2 font-bold uppercase tracking-widest text-xs">20 Anos • Desde 2006 em Fortaleza</p>
          </div>
          
          <div className="flex flex-col items-center md:items-end gap-4">
            <div className="flex gap-6">
              {['Instagram', 'Facebook', 'TikTok'].map(social => (
                <a key={social} href="#" className="font-black uppercase tracking-widest text-[10px] hover:text-[#f6c83e] transition-colors">{social}</a>
              ))}
            </div>
            <p className="text-white/40 text-[9px] font-bold uppercase tracking-widest">D&O Music • Todos os direitos reservados</p>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default LandingPage;
