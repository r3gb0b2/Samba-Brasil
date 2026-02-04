
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import PhotoCarousel from '../components/PhotoCarousel';
import { dbService } from '../services/db';
import { SiteSettings } from '../types';
import { 
  CheckCircle, 
  AlertCircle, 
  Calendar, 
  MapPin, 
  Ticket, 
  Instagram, 
  Facebook, 
  Youtube 
} from 'lucide-react';

declare global {
  interface Window {
    fbq: any;
    _fbq: any;
  }
}

const LandingPage: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', cpf: '' });
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      const s = await dbService.getSettings();
      setSettings(s);
      
      // INJEÇÃO ROBUSTA E IMEDIATA DO META PIXEL
      if (s.facebookPixelId && s.facebookPixelId.trim() !== '') {
        (function(f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
          if (f.fbq) return; n = f.fbq = function() {
            n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments)
          };
          if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0';
          n.queue = []; t = b.createElement(e); t.async = !0;
          t.src = v; s = b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t, s)
        })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

        // Inicializa mesmo que o script ainda esteja baixando (o snippet cuida da fila)
        window.fbq('init', s.facebookPixelId);
        window.fbq('track', 'PageView');
        console.log("📊 Meta Pixel Ativo:", s.facebookPixelId);
      }
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

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 11) value = value.slice(0, 11);
    
    let masked = value;
    if (value.length > 3) {
      masked = value.substring(0, 3) + "." + value.substring(3);
      if (value.length > 6) {
        masked = masked.substring(0, 7) + "." + value.substring(6);
        if (value.length > 9) {
          masked = masked.substring(0, 11) + "-" + value.substring(9);
        }
      }
    }
    setFormData({ ...formData, cpf: masked });
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

    if (formData.cpf.replace(/\D/g, "").length < 11) {
      setStatus({ type: 'error', message: 'CPF inválido.' });
      setLoading(false);
      return;
    }

    try {
      const result = await dbService.addLead(formData);
      if (result.success) {
        setStatus({ type: 'success', message: result.message });
        
        // RASTREAMENTO DE CONVERSÃO (LEAD)
        if (window.fbq) {
          window.fbq('track', 'Lead', {
            content_name: 'Inscrição Samba Brasil 20 Anos',
            value: 0,
            currency: 'BRL'
          });
        }

        setFormData({ name: '', email: '', phone: '', cpf: '' });
      } else {
        setStatus({ type: 'error', message: result.message });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Erro ao cadastrar. Tente novamente.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen">
      <Header />
      
      {/* Seção Hero - Otimizada para Mobile */}
      <section className="relative pt-28 md:pt-44 pb-8 overflow-hidden">
        <div className="container mx-auto px-6 md:px-12 flex flex-col items-center text-center">
          <div className="w-full max-w-6xl relative">
             <div className="flex justify-center mb-10">
               <div className="text-center relative flex flex-col items-center">
                 <div className="max-w-[220px] md:max-w-[450px] mb-4">
                    {settings?.logoUrl ? (
                      <img src={settings.logoUrl} alt="Logo" className="w-full h-auto drop-shadow-2xl" />
                    ) : (
                      <h2 className="text-5xl md:text-8xl font-black text-[#269f78] italic uppercase leading-none tracking-tighter">
                        SAMBA <span className="text-[#f37f3a]">BRASIL</span>
                      </h2>
                    )}
                 </div>
                 <div className="inline-block bg-[#f6c83e] text-[#269f78] px-6 py-2 md:px-8 md:py-3 rounded-full font-black text-xl md:text-4xl mt-2 rotate-[-3deg] shadow-xl border-2 border-white">
                   20 ANOS
                 </div>
               </div>
             </div>

             {/* Banner com Proporção Vertical no Mobile (4/5) e Horizontal no Desktop (2.4/1) */}
             <div className="w-full aspect-[4/5] md:aspect-[2.4/1] overflow-hidden rounded-[2rem] md:rounded-[4rem] shadow-2xl border-4 md:border-8 border-white mb-20 transform rotate-[0.5deg]">
               {settings?.heroBannerUrl ? (
                 <img src={settings.heroBannerUrl} className="w-full h-full object-cover object-center" alt="Evento" />
               ) : (
                 <div className="w-full h-full bg-[#f37f3a]/10 animate-pulse flex items-center justify-center">
                    <span className="text-[#f37f3a] font-black uppercase text-xs">Carregando Banner...</span>
                 </div>
               )}
             </div>

             <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center w-full px-6">
               <div className="bg-[#7db5d9] text-white px-8 py-2 md:py-3 rounded-full font-black text-xs md:text-xl shadow-lg border-2 border-white uppercase mb-[-12px] z-10">
                 DATA DO EVENTO
               </div>
               <div className="bg-[#f37f3a] text-white px-10 md:px-20 py-6 md:py-10 rounded-3xl md:rounded-[4rem] font-black text-4xl md:text-8xl shadow-2xl border-4 border-white transform rotate-[-2deg] tracking-tight whitespace-nowrap">
                 {settings?.eventDayBanner || '08'}.{settings?.eventMonthBanner || 'AGOSTO'}
               </div>
             </div>
          </div>
        </div>
      </section>

      {/* Formulário de Leads */}
      <section className="pt-24 pb-16 px-6">
        <div className="container mx-auto flex justify-center max-w-7xl">
          <div className="w-full max-w-md">
            <div className="bg-white p-8 md:p-14 rounded-[3rem] md:rounded-[5rem] shadow-[0_30px_0_rgba(38,159,120,0.1)] border-4 border-[#269f78] relative overflow-hidden">
              <h4 className="text-3xl font-black text-[#269f78] mb-2 uppercase tracking-tighter italic leading-none text-center">Lista Prioritária</h4>
              <p className="text-gray-400 font-bold text-[10px] md:text-xs mb-10 uppercase tracking-widest text-center">Pré-venda exclusiva liberada em breve.</p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <input 
                  type="text" 
                  required
                  placeholder="Nome Completo"
                  className="w-full bg-[#f4f1e1] px-7 py-4 rounded-2xl border-2 border-transparent focus:border-[#f37f3a] outline-none font-bold text-gray-700 transition-all text-sm"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
                <input 
                  type="email" 
                  required
                  placeholder="Seu melhor e-mail"
                  className="w-full bg-[#f4f1e1] px-7 py-4 rounded-2xl border-2 border-transparent focus:border-[#f37f3a] outline-none font-bold text-gray-700 transition-all text-sm"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input 
                    type="tel" 
                    required
                    placeholder="WhatsApp"
                    className="w-full bg-[#f4f1e1] px-7 py-4 rounded-2xl border-2 border-transparent focus:border-[#f37f3a] outline-none font-bold text-gray-700 transition-all text-sm"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                  />
                  <input 
                    type="text" 
                    required
                    placeholder="CPF"
                    className="w-full bg-[#f4f1e1] px-7 py-4 rounded-2xl border-2 border-transparent focus:border-[#f37f3a] outline-none font-bold text-gray-700 transition-all text-sm"
                    value={formData.cpf}
                    onChange={handleCpfChange}
                  />
                </div>
                <button 
                  disabled={loading}
                  className="w-full bg-[#f37f3a] hover:bg-[#d86b2b] text-white font-black py-6 rounded-2xl shadow-xl shadow-orange-500/20 transform active:scale-95 transition-all uppercase tracking-widest mt-4 border-b-8 border-orange-800 text-sm"
                >
                  {loading ? 'ENVIANDO...' : 'GARANTIR ACESSO'}
                </button>
              </form>

              {status.type && (
                <div className={`mt-6 p-5 rounded-2xl flex items-center gap-3 animate-bounce ${status.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {status.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                  <p className="text-[10px] font-black uppercase tracking-widest leading-tight">{status.message}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Descrição - CORREÇÃO DE ESPAÇAMENTO COM WHITESPACE-PRE-LINE */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col gap-10 items-start">
            <div className="inline-flex items-center gap-3 bg-[#269f78] text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">
              <MapPin size={14} /> Marina Park • Fortaleza
            </div>
            <h3 className="text-5xl md:text-8xl font-black text-[#269f78] leading-[0.8] uppercase italic tracking-tighter">
              A CAPITAL <br/> <span className="text-[#f37f3a]">DO SAMBA!</span>
            </h3>
            
            {/* whitespace-pre-line garante que os espaços e enters do admin apareçam aqui */}
            <p className="text-gray-600 font-bold text-lg md:text-2xl leading-relaxed max-w-4xl whitespace-pre-line">
              {settings?.eventDescription || 'Carregando informações do evento...'}
            </p>
          </div>
        </div>
      </section>

      <PhotoCarousel />

      <footer className="bg-[#269f78] text-white py-24 px-6 mt-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="text-center md:text-left h-24">
             {settings?.logoUrl ? (
               <img src={settings.logoUrl} alt="Footer Logo" className="h-full object-contain brightness-0 invert opacity-50" />
             ) : (
               <h2 className="text-4xl font-black italic uppercase text-white/50">SAMBA BRASIL</h2>
             )}
          </div>
          <div className="flex gap-6">
            <a href={settings?.instagramUrl} target="_blank" className="bg-white/10 p-4 rounded-full hover:bg-[#f37f3a] transition-all"><Instagram /></a>
            <a href={settings?.facebookUrl} target="_blank" className="bg-white/10 p-4 rounded-full hover:bg-[#f37f3a] transition-all"><Facebook /></a>
            <a href={settings?.tiktokUrl} target="_blank" className="bg-white/10 p-4 rounded-full hover:bg-[#f37f3a] transition-all"><Youtube /></a>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-white/5 text-center md:text-left">
          <p className="text-white/30 text-[9px] font-black uppercase tracking-widest">D&E MUSIC • CNPJ: 19.602.886/0001-71</p>
        </div>
      </footer>
    </main>
  );
};

export default LandingPage;
