
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import PhotoCarousel from '../components/PhotoCarousel';
import { dbService } from '../services/db';
import { SiteSettings } from '../types';
import { Users, Mail, Phone, CheckCircle, AlertCircle } from 'lucide-react';

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
    
    // Máscara: (85) 99999-9999 ou (85) 9999-9999
    let masked = "";
    if (value.length > 0) {
      masked = "(" + value.substring(0, 2);
      if (value.length > 2) {
        masked += ") " + value.substring(2, 7);
        if (value.length > 7) {
          masked += "-" + value.substring(7, 11);
        }
      }
    }
    setFormData({ ...formData, phone: masked });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: null, message: '' });

    // Validação de Nome Completo (Pelo menos 2 palavras)
    const nameParts = formData.name.trim().split(/\s+/);
    if (nameParts.length < 2) {
      setStatus({ type: 'error', message: 'Por favor, insira seu nome completo (nome e sobrenome).' });
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
      setStatus({ type: 'error', message: 'Ocorreu um erro ao processar seu cadastro.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Banner Section */}
      <section className="relative flex flex-col pt-0">
        {/* Banner Horizontal Adaptável */}
        <div className="w-full h-[30vh] md:h-[50vh] overflow-hidden relative">
          {settings?.heroBannerUrl ? (
            <img 
              src={settings.heroBannerUrl} 
              alt="Samba Brasil Fortaleza 2026" 
              className="w-full h-full object-cover object-center"
            />
          ) : (
            <div className="w-full h-full bg-blue-900 animate-pulse" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-blue-950/80 via-transparent to-black/20"></div>
        </div>

        <div className="container mx-auto px-4 z-10 flex flex-col lg:flex-row items-start gap-12 -mt-20 md:-mt-32 pb-20">
          {/* Informative Text */}
          <div className="flex-1 text-white text-center lg:text-left pt-10">
            <span className="inline-block bg-yellow-400 text-blue-900 px-4 py-1 rounded-full text-xs sm:text-sm font-bold uppercase tracking-widest mb-4 animate-bounce">
              O Maior Festival do Mundo
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight uppercase tracking-tighter drop-shadow-lg">
              Samba <span className="text-yellow-400">Brasil</span> <br className="hidden md:block"/> Fortaleza 2026
            </h1>
            <p className="text-lg md:text-xl text-gray-200 mb-8 font-light max-w-2xl leading-relaxed drop-shadow-md">
              Prepare seu coração. A capital cearense vai tremer com o ritmo, a cor e a energia inigualável do samba verdadeiro.
            </p>
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-xl px-6 py-3 rounded-2xl border border-white/20 shadow-xl">
                <span className="text-yellow-400 font-bold text-xl">14-16</span>
                <span className="text-sm font-semibold uppercase tracking-wider">Outubro</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-xl px-6 py-3 rounded-2xl border border-white/20 shadow-xl">
                <span className="text-yellow-400 font-bold text-xl">FORTAL</span>
                <span className="text-sm font-semibold uppercase tracking-wider">Arena Castelão</span>
              </div>
            </div>
          </div>

          {/* Registration Form Overlay */}
          <div className="w-full max-w-md mx-auto lg:mx-0">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-[0_32px_64px_rgba(0,0,0,0.15)] border border-gray-100">
              <h3 className="text-2xl font-bold text-blue-900 mb-2">Lista VIP</h3>
              <p className="text-gray-500 mb-6 text-sm">Cadastre-se para receber o line-up oficial e pré-venda exclusiva.</p>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-blue-900 uppercase tracking-widest ml-1">Nome Completo</label>
                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input 
                      type="text" 
                      required
                      placeholder="Ex: João Silva"
                      className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-yellow-400/20 focus:border-yellow-400 transition-all outline-none"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-blue-900 uppercase tracking-widest ml-1">E-mail Pessoal</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input 
                      type="email" 
                      required
                      placeholder="voce@email.com"
                      className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-yellow-400/20 focus:border-yellow-400 transition-all outline-none"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-blue-900 uppercase tracking-widest ml-1">WhatsApp</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input 
                      type="tel" 
                      required
                      placeholder="(85) 99999-9999"
                      className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-yellow-400/20 focus:border-yellow-400 transition-all outline-none"
                      value={formData.phone}
                      onChange={handlePhoneChange}
                    />
                  </div>
                </div>

                <button 
                  disabled={loading}
                  className="w-full bg-blue-900 hover:bg-blue-800 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-900/20 transform active:scale-[0.98] transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : 'ENTRAR NA LISTA'}
                </button>
              </form>

              {status.type && (
                <div className={`mt-6 p-4 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-4 ${status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                  {status.type === 'success' ? <CheckCircle className="w-5 h-5 mt-0.5 shrink-0" /> : <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />}
                  <p className="text-xs font-semibold">{status.message}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <PhotoCarousel />

      {/* Footer */}
      <footer className="bg-blue-950 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-black uppercase italic tracking-tighter">Samba <span className="text-yellow-400">Brasil</span></h2>
            <p className="text-gray-400 mt-2 font-medium tracking-wide">Fortaleza 2026 • A Capital do Samba</p>
            <p className="text-gray-500 text-sm mt-4">© 2024-2026 Samba Brasil Festival. Todos os direitos reservados.</p>
          </div>
          <div className="flex gap-8">
            {['Instagram', 'Facebook', 'TikTok'].map(social => (
              <a key={social} href="#" className="text-gray-400 hover:text-yellow-400 transition-all font-bold uppercase tracking-widest text-xs">{social}</a>
            ))}
          </div>
        </div>
      </footer>
    </main>
  );
};

export default LandingPage;
