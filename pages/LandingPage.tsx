
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
      
      // INJEÇÃO ROBUSTA DO META PIXEL
      if (s.facebookPixelId) {
        // 1. Injetar o script base do FB se não existir
        if (!window.fbq) {
          (function(f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
            if (f.fbq) return; n = f.fbq = function() {
              n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments)
            };
            if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0';
            n.queue = []; t = b.createElement(e); t.async = !0;
            t.src = v; s = b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t, s)
          })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
        }

        // 2. Inicializar e Rastrear PageView
        if (window.fbq) {
          window.fbq('init', s.facebookPixelId);
          window.fbq('track', 'PageView');
          console.log(`🚀 Meta Pixel ${s.facebookPixelId} injetado e rastreando.`);
        }

        // 3. Adicionar NoScript para fallbacks (SEO/Segurança)
        const noscriptId = 'fb-pixel-noscript';
        if (!document.getElementById(noscriptId)) {
          const noscript = document.createElement('noscript');
          noscript.id = noscriptId;
          const img = document.createElement('img');
          img.height = 1;
          img.width = 1;
          img.style.display = 'none';
          img.src = `https://www.facebook.com/tr?id=${s.facebookPixelId}&ev=PageView&noscript=1`;
          noscript.appendChild(img);
          document.body.appendChild(noscript);
        }
      }

      // Scripts Customizados (Injeção de Script GTM/Head)
      if (s.customHeadScript) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = s.customHeadScript;
        const scripts = tempDiv.querySelectorAll('script');
        scripts.forEach(oldScript => {
          const newScript = document.createElement('script');
          Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
          newScript.appendChild(document.createTextNode(oldScript.innerHTML));
          document.head.appendChild(newScript);
        });
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
        
        // DISPARO DE LEAD NO META PIXEL
        if (typeof window.fbq === 'function') {
          window.fbq('track', 'Lead', {
            content_name: 'Inscrição Pré-venda Samba Brasil 20 Anos',
            value: 0,
            currency: 'BRL'
          });
          console.log("🎯 Evento Lead capturado pelo Meta Pixel.");
        }

        setFormData({ name: '', email: '', phone: '', cpf: '' });
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
      
      {/* Hero Section */}
      <section className="relative pt-32 md:pt-44 pb-12 overflow-hidden">
        <div className="container mx-auto px-6 md:px-12 lg:px-16 flex flex-col items-center text-center">
          <div className="w-full max-w-6xl relative">
             <div className="flex justify-center mb-10">
               <div className="text-center relative flex flex-col items-center">
                 <div className="max-w-[240px] md:max-w-[450px] mb-4">
                    {settings?.logoUrl ? (
                      <img src={settings.logoUrl} alt="Samba Brasil" className="w-full h-auto drop-shadow-2xl" />
                    ) : (
                      <h2 className="text-5xl md:text-8xl font-black text-[#269f78] italic uppercase leading-none tracking-tighter">
                        SAMBA <span className="text-[#f37f3a]">BRASIL</span>
                      </h2>
                    )}
                 </div>
                 
                 <div className="inline-block bg-[#f6c83e] text-[#269f78] px-8 py-3 rounded-full font-black text-2xl md:text-4xl mt-4 rotate-[-3deg] shadow-xl border-2 border-white">
                   20 ANOS
                 </div>
                 <div className="text-[#7db5d9] font-black text-2xl md:text-3xl italic mt-4">Fortaleza</div>
               </div>
             </div>

             {/* Banner Responsivo Corrigido */}
             <div className="w-full aspect-[4/5] md:aspect-[2.4/1] overflow-hidden rounded-[2rem] md:rounded-[4rem] shadow-2xl border-4 md:border-8 border-white mb-20 transform rotate-[0.5deg]">
               {settings?.heroBannerUrl ? (
                 <img src={settings.heroBannerUrl} className="w-full h-full object-cover" alt="Banner Samba Brasil" />
               ) : (
                 <div className="w-full h-full bg-[#f37f3a]/10 animate-pulse flex items-center justify-center">
                    <span className="text-[#f37f3a] font-black uppercase text-xs opacity-50">Carregando Banner...</span>
                 </div>
               )}
             </div>

             {/* Data Badge */}
             <div className="absolute -bottom-14 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center">
               <div className="bg-[#7db5d9] text-white px-8 md:px-12 py-3 rounded-full font-black text-sm md:text-xl shadow-lg border-2 border-white uppercase mb-[-14px] z-10 scale-90 md:scale-110">
                 DATA DO EVENTO
               </div>
               <div className="bg-[#f37f3a] text-white px-10 md:px-20 py-8 md:py-10 rounded-3xl md:rounded-[4rem] font-black text-4xl md:text-8xl shadow-2xl border-4 border-white transform rotate-[-2deg] tracking-tight whitespace-nowrap">
                 {settings?.eventDayBanner || '08'}.{settings?.eventMonthBanner || 'AGOSTO'}
               </div>
             </div>
          </div>
        </div>
      </section>

      {/* Cadastro Section */}
      <section className="pt-24 pb-16 px-6">
        <div className="container mx-auto flex justify-center max-w-7xl">
          <div className="w-full max-w-md">
            <div className="bg-white p-8 md:p-14 rounded-[3.5rem] md:rounded-[5rem] shadow-[0_40px_0_rgba(38,159,120,0.15)] border-4 border-[#269f78] relative overflow-hidden">
              <h4 className="text-3xl font-black text-[#269f78] mb-2 uppercase tracking-tighter italic leading-none text-center">Lista Prioritária</h4>
              <p className="text-gray-400 font-bold text-[10px] md:text-xs mb-10 uppercase tracking-widest text-center">Acesso VIP 1h antes da abertura oficial.</p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-[#269f78] uppercase tracking-widest ml-4">Nome Completo</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Seu nome aqui"
                    className="w-full bg-[#f4f1e1] px-8 py-5 rounded-[2rem] border-2 border-transparent focus:border-[#f37f3a] outline-none font-bold text-gray-700 transition-all"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-[#269f78] uppercase tracking-widest ml-4">E-mail</label>
                  <input 
                    type="email" 
                    required
                    placeholder="contato@exemplo.com"
                    className="w-full bg-[#f4f1e1] px-8 py-5 rounded-[2rem] border-2 border-transparent focus:border-[#f37f3a] outline-none font-bold text-gray-700 transition-all"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-[#269f78] uppercase tracking-widest ml-4">WhatsApp</label>
                    <input 
                      type="tel" 
                      required
                      placeholder="(85) 99999-9999"
                      className="w-full bg-[#f4f1e1] px-8 py-5 rounded-[2rem] border-2 border-transparent focus:border-[#f37f3a] outline-none font-bold text-gray-700 transition-all"
                      value={formData.phone}
                      onChange={handlePhoneChange}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-[#269f78] uppercase tracking-widest ml-4">CPF</label>
                    <input 
                      type="text" 
                      required
                      placeholder="000.000.000-00"
                      className="w-full bg-[#f4f1e1] px-8 py-5 rounded-[2rem] border-2 border-transparent focus:border-[#f37f3a] outline-none font-bold text-gray-700 transition-all"
                      value={formData.cpf}
                      onChange={handleCpfChange}
                    />
                  </div>
                </div>

                <button 
                  disabled={loading}
                  className="w-full bg-[#f37f3a] hover:bg-[#d86b2b] text-white font-black py-7 rounded-[2rem] shadow-2xl shadow-orange-500/40 transform active:scale-95 transition-all uppercase tracking-widest mt-8 border-b-[10px] border-orange-800 text-sm"
                >
                  {loading ? 'PROCESSANDO...' : 'Quero meu ingresso antecipado'}
                </button>
              </form>

              {status.type && (
                <div className={`mt-8 p-6 rounded-[2.5rem] flex items-center gap-4 animate-in zoom-in duration-500 ${status.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {status.type === 'success' ? <CheckCircle className="w-7 h-7 shrink-0" /> : <AlertCircle className="w-7 h-7 shrink-0" />}
                  <p className="text-[11px] font-black uppercase tracking-widest leading-tight">{status.message}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Descrição do Evento - CORREÇÃO DEFINITIVA DE ESPAÇAMENTO */}
      <section className="pt-16 pb-32 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col lg:flex-row gap-20 items-start">
            <div className="flex-1 space-y-12">
              <div className="inline-flex items-center gap-3 bg-[#269f78] text-white px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest shadow-lg">
                <MapPin className="w-4 h-4" /> Marina Park • Fortaleza
              </div>
              <h3 className="text-6xl md:text-8xl font-black text-[#269f78] leading-[0.8] uppercase italic tracking-tighter">
                O MAIOR SAMBA <br/> <span className="text-[#f37f3a]">DO MUNDO!</span>
              </h3>
              
              {/* O USO DE whitespace-pre-line É CRUCIAL AQUI */}
              <p className="text-gray-600 font-bold text-xl md:text-2xl leading-relaxed max-w-3xl whitespace-pre-line">
                {settings?.eventDescription || 'Carregando detalhes do evento...'}
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                 <div className="bg-white p-10 rounded-[3rem] shadow-xl border-4 border-[#f4f1e1] transform transition-transform hover:-translate-y-2">
                   <Calendar className="text-[#f37f3a] w-12 h-12 mb-6" />
                   <p className="text-[11px] uppercase font-black text-gray-300 tracking-[0.2em] mb-1">Quando acontece</p>
                   <p className="font-black text-[#269f78] text-3xl uppercase italic">{settings?.eventDateDisplay || 'Em Breve'}</p>
                 </div>
                 <div className="bg-white p-10 rounded-[3rem] shadow-xl border-4 border-[#f4f1e1] transform transition-transform hover:-translate-y-2">
                   <Ticket className="text-[#7db5d9] w-12 h-12 mb-6" />
                   <p className="text-[11px] uppercase font-black text-gray-300 tracking-[0.2em] mb-1">Vendas Oficiais</p>
                   <p className="font-black text-[#269f78] text-3xl">efolia.com.br</p>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PhotoCarousel />

      <footer className="bg-[#269f78] text-white py-32 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-48 -mt-48 blur-3xl"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-16 mb-24">
            <div className="text-center md:text-left h-24 md:h-40">
               {settings?.logoUrl ? (
                 <img src={settings.logoUrl} alt="Samba Brasil Footer" className="h-full object-contain brightness-0 invert opacity-90" />
               ) : (
                 <h2 className="text-6xl font-black italic tracking-tighter uppercase leading-none text-white">
                  SAMBA <br/><span className="text-[#f6c83e]">BRASIL</span>
                </h2>
               )}
            </div>
            <div className="flex flex-col items-center md:items-end gap-10">
              <p className="text-white/60 font-black uppercase text-xs tracking-widest italic">Siga nossa folia</p>
              <div className="flex gap-10">
                <a href={settings?.instagramUrl} target="_blank" rel="noreferrer" className="bg-white/10 p-5 rounded-full hover:bg-[#f37f3a] hover:scale-110 transition-all duration-300"><Instagram size={28} /></a>
                <a href={settings?.facebookUrl} target="_blank" rel="noreferrer" className="bg-white/10 p-5 rounded-full hover:bg-[#f37f3a] hover:scale-110 transition-all duration-300"><Facebook size={28} /></a>
                <a href={settings?.tiktokUrl} target="_blank" rel="noreferrer" className="bg-white/10 p-5 rounded-full hover:bg-[#f37f3a] hover:scale-110 transition-all duration-300"><Youtube size={28} /></a>
              </div>
            </div>
          </div>
          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
             <div className="space-y-2">
               <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">D&E MUSIC • PRODUÇÃO DE EVENTOS</p>
               <p className="text-white/20 text-[9px] uppercase tracking-widest font-bold max-w-md">Divertindo e Emocionando Producao de Eventos LTDA - CNPJ: 19.602.886/0001-71</p>
             </div>
             <p className="text-white/10 text-[10px] font-black uppercase tracking-widest">Fortaleza • CE</p>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default LandingPage;
