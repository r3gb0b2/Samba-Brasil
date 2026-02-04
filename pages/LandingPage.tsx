
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import PhotoCarousel from '../components/PhotoCarousel';
import { dbService } from '../services/db';
import { SiteSettings } from '../types';
import { Users, Mail, Phone, CheckCircle, AlertCircle, Calendar, MapPin, Ticket, Instagram, Facebook, Youtube } from 'lucide-react';

const LandingPage: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      const s = await dbService.getSettings();
      setSettings(s);
      
      // Injeção de Scripts de Marketing
      if (s.facebookPixelId) {
        const script = document.createElement('script');
        script.innerHTML = `
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${s.facebookPixelId}');
          fbq('track', 'PageView');
        `;
        document.head.appendChild(script);
      }

      if (s.customHeadScript) {
        const div = document.createElement('div');
        div.innerHTML = s.customHeadScript;
        const scripts = div.querySelectorAll('script');
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
        
        // Disparar evento de conversão do Meta se o Pixel estiver configurado
        // Fix: Cast window to any to access fbq which is added dynamically by the pixel script
        if ((window as any).fbq) {
          (window as any).fbq('track', 'Lead', {
            content_name: 'Inscrição Pré-venda Samba Brasil',
            status: 'Success'
          });
        }
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
      <section className="relative pt-32 md:pt-40 pb-12 overflow-hidden">
        <div className="container mx-auto px-6 md:px-12 lg:px-16 flex flex-col items-center text-center">
          <div className="w-full max-w-6xl relative">
             <div className="flex justify-center mb-8">
               <div className="text-center relative">
                 <h2 className="text-4xl md:text-7xl font-black text-[#269f78] italic uppercase leading-none tracking-tighter">
                   SAMBA <span className="text-[#f37f3a]">BRASIL</span>
                 </h2>
                 <div className="inline-block bg-[#f6c83e] text-[#269f78] px-6 py-2 rounded-full font-black text-xl md:text-3xl mt-4 rotate-[-2deg] shadow-lg border-2 border-white">
                   20 ANOS
                 </div>
                 <div className="text-[#7db5d9] font-black text-2xl italic mt-3">Fortaleza</div>
               </div>
             </div>

             <div className="w-full aspect-[21/9] md:aspect-[2.5/1] overflow-hidden rounded-[2.5rem] md:rounded-[4rem] shadow-2xl border-4 md:border-8 border-white mb-16 transform rotate-[1deg]">
               {settings?.heroBannerUrl ? (
                 <img src={settings.heroBannerUrl} className="w-full h-full object-cover" alt="Samba Brasil 20 Anos" />
               ) : (
                 <div className="w-full h-full bg-[#f37f3a]/20 animate-pulse flex items-center justify-center">
                    <span className="text-[#f37f3a] font-bold">Banner Principal</span>
                 </div>
               )}
             </div>

             <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center">
               <div className="bg-[#7db5d9] text-white px-10 py-3 rounded-full font-black text-xl shadow-lg border-2 border-white uppercase mb-[-12px] z-10 scale-90 md:scale-110">
                 PRÉ-VENDA
               </div>
               <div className="bg-[#f37f3a] text-white px-10 md:px-16 py-6 md:py-8 rounded-3xl md:rounded-[3rem] font-black text-4xl md:text-7xl shadow-2xl border-4 border-white transform rotate-[-2deg] tracking-tight">
                 {settings?.eventDayBanner || '18'}.{settings?.eventMonthBanner || 'AGOSTO'}
               </div>
             </div>
          </div>
        </div>
      </section>

      {/* Seção de Formulário */}
      <section className="pt-16 pb-12 px-6">
        <div className="container mx-auto flex justify-center max-w-7xl">
          <div className="w-full max-w-md">
            <div className="bg-white p-8 md:p-12 rounded-[4rem] shadow-[0_32px_0_rgba(38,159,120,0.1)] border-4 border-[#269f78] relative overflow-hidden">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-40 h-8 bg-white/40 backdrop-blur-sm border border-white/50 rotate-[-2deg]"></div>
              
              <h4 className="text-3xl font-black text-[#269f78] mb-2 uppercase tracking-tighter italic leading-none text-center">Lista Prioritária</h4>
              <p className="text-gray-500 font-bold text-xs mb-10 uppercase tracking-widest text-center">Acesso exclusivo 1h antes da abertura oficial.</p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-[#269f78] uppercase tracking-widest ml-3">Seu Nome</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Nome e Sobrenome"
                    className="w-full bg-[#f4f1e1] px-7 py-5 rounded-3xl border-2 border-transparent focus:border-[#f37f3a] outline-none font-bold text-gray-700 transition-all"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-[#269f78] uppercase tracking-widest ml-3">E-mail</label>
                  <input 
                    type="email" 
                    required
                    placeholder="email@exemplo.com"
                    className="w-full bg-[#f4f1e1] px-7 py-5 rounded-3xl border-2 border-transparent focus:border-[#f37f3a] outline-none font-bold text-gray-700 transition-all"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-[#269f78] uppercase tracking-widest ml-3">WhatsApp</label>
                  <input 
                    type="tel" 
                    required
                    placeholder="(85) 9999-9999"
                    className="w-full bg-[#f4f1e1] px-7 py-5 rounded-3xl border-2 border-transparent focus:border-[#f37f3a] outline-none font-bold text-gray-700 transition-all"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                  />
                </div>

                <button 
                  disabled={loading}
                  className="w-full bg-[#f37f3a] hover:bg-[#d86b2b] text-white font-black py-6 rounded-3xl shadow-xl shadow-orange-500/30 transform active:scale-95 transition-all uppercase tracking-widest mt-6 border-b-8 border-orange-800"
                >
                  {loading ? 'AGUARDE...' : 'Participar da pré-venda'}
                </button>
              </form>

              {status.type && (
                <div className={`mt-8 p-5 rounded-[2rem] flex items-center gap-4 animate-bounce ${status.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {status.type === 'success' ? <CheckCircle className="w-6 h-6 shrink-0" /> : <AlertCircle className="w-6 h-6 shrink-0" />}
                  <p className="text-xs font-black uppercase tracking-widest">{status.message}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="pt-12 pb-32 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col lg:flex-row gap-16 items-start">
            <div className="flex-1 space-y-10">
              <div className="inline-flex items-center gap-2 bg-[#269f78] text-white px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest">
                <MapPin className="w-4 h-4" /> Marina Park • Fortaleza
              </div>
              <h3 className="text-5xl md:text-7xl font-black text-[#269f78] leading-[0.85] uppercase italic tracking-tighter">
                A CAPITAL DO SAMBA <br/> <span className="text-[#f37f3a]">EM FESTA!</span>
              </h3>
              <p className="text-gray-600 font-bold text-xl leading-relaxed max-w-2xl">
                {settings?.eventDescription || 'Há duas décadas escrevendo a história do samba no Ceará. Prepare-se para a maior edição de todos os tempos.'}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border-2 border-[#f4f1e1]">
                   <Calendar className="text-[#f37f3a] w-10 h-10 mb-4" />
                   <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest">Quando</p>
                   <p className="font-black text-[#269f78] text-2xl uppercase italic">{settings?.eventDateDisplay || '18 de Agosto'}</p>
                 </div>
                 <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border-2 border-[#f4f1e1]">
                   <Ticket className="text-[#7db5d9] w-10 h-10 mb-4" />
                   <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest">Onde Comprar</p>
                   <p className="font-black text-[#269f78] text-2xl">stingressos.com.br</p>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <PhotoCarousel />

      {/* Rodapé com Dados da Empresa */}
      <footer className="bg-[#269f78] text-white py-24 px-6 relative overflow-hidden">
        <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-[#f6c83e] rounded-full opacity-20 blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12 mb-16">
            <div className="text-center md:text-left">
              <h2 className="text-5xl font-black italic tracking-tighter uppercase leading-none mb-2">
                SAMBA <br/><span className="text-[#f6c83e]">BRASIL</span>
              </h2>
              <p className="text-white/80 font-bold uppercase tracking-widest text-[10px]">20 Anos • Desde 2006 em Fortaleza</p>
            </div>
            
            <div className="flex flex-col items-center md:items-end gap-6">
              <div className="flex gap-8">
                <a href={settings?.instagramUrl} target="_blank" rel="noreferrer" className="bg-white/10 p-3 rounded-full hover:bg-white/20 transition-all">
                  <Instagram size={24} />
                </a>
                <a href={settings?.facebookUrl} target="_blank" rel="noreferrer" className="bg-white/10 p-3 rounded-full hover:bg-white/20 transition-all">
                  <Facebook size={24} />
                </a>
                <a href={settings?.tiktokUrl} target="_blank" rel="noreferrer" className="bg-white/10 p-3 rounded-full hover:bg-white/20 transition-all">
                  <Youtube size={24} />
                </a>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
             <div className="space-y-1">
               <p className="text-white/40 text-[9px] font-black uppercase tracking-[0.2em]">D&E MUSIC • Todos os direitos reservados</p>
               <p className="text-white/30 text-[8px] uppercase tracking-widest font-bold">
                 Divertindo e Emocionando Producao de Eventos LTDA - 19.602.886/0001-71
               </p>
             </div>
             <p className="text-white/20 text-[8px] font-bold uppercase">Fortaleza - Ceará</p>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default LandingPage;
