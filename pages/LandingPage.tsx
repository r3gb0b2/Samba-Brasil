
import React, { useState } from 'react';
import Header from '../components/Header';
import PhotoCarousel from '../components/PhotoCarousel';
import { dbService } from '../services/db';
import { Users, Mail, Phone, CheckCircle, AlertCircle } from 'lucide-react';

const LandingPage: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: null, message: '' });

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
    <main className="min-h-screen">
      <Header />
      
      {/* Hero Banner Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Banner Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&q=80&w=2000" 
            alt="Samba Brasil Background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-blue-900/40"></div>
        </div>

        <div className="container mx-auto px-4 z-10 flex flex-col lg:flex-row items-center gap-12 pt-20">
          {/* Informative Text */}
          <div className="flex-1 text-white text-center lg:text-left">
            <span className="inline-block bg-yellow-400 text-blue-900 px-4 py-1 rounded-full text-sm font-bold uppercase tracking-widest mb-6 animate-bounce">
              O Maior Festival do Mundo
            </span>
            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight uppercase tracking-tighter">
              Samba <span className="text-yellow-400">Brasil</span> 2024
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-8 font-light max-w-2xl leading-relaxed">
              Prepare seu coração para a maior celebração da cultura brasileira. Três dias de ritmo, cor e a energia inigualável do samba verdadeiro.
            </p>
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-6 py-3 rounded-xl border border-white/20">
                <span className="text-yellow-400 font-bold">15-17</span>
                <span className="text-sm">Novembro</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-6 py-3 rounded-xl border border-white/20">
                <span className="text-yellow-400 font-bold">RIO</span>
                <span className="text-sm">Maracanã</span>
              </div>
            </div>
          </div>

          {/* Registration Form Overlay */}
          <div className="w-full max-w-md">
            <div className="bg-white/95 backdrop-blur-xl p-8 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/50">
              <h3 className="text-2xl font-bold text-blue-900 mb-2">Garanta seu Lugar</h3>
              <p className="text-gray-600 mb-6">Receba benefícios exclusivos e informações em primeira mão.</p>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <label className="block text-xs font-bold text-blue-900 uppercase mb-1 ml-1">Nome Completo</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input 
                      type="text" 
                      required
                      placeholder="Seu nome"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all outline-none"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                </div>

                <div className="relative">
                  <label className="block text-xs font-bold text-blue-900 uppercase mb-1 ml-1">E-mail</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input 
                      type="email" 
                      required
                      placeholder="exemplo@email.com"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all outline-none"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>

                <div className="relative">
                  <label className="block text-xs font-bold text-blue-900 uppercase mb-1 ml-1">Telefone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input 
                      type="tel" 
                      required
                      placeholder="(00) 00000-0000"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all outline-none"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                </div>

                <button 
                  disabled={loading}
                  className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-900/20 transform active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? 'Processando...' : 'QUERO ME INSCREVER'}
                </button>
              </form>

              {status.type && (
                <div className={`mt-4 p-4 rounded-xl flex items-start gap-3 ${status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                  {status.type === 'success' ? <CheckCircle className="w-5 h-5 mt-0.5" /> : <AlertCircle className="w-5 h-5 mt-0.5" />}
                  <p className="text-sm font-medium">{status.message}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <PhotoCarousel />

      {/* Footer */}
      <footer className="bg-blue-950 text-white py-12 px-4 border-t border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div>
            <h2 className="text-2xl font-black uppercase italic tracking-tighter">Samba <span className="text-yellow-400">Brasil</span></h2>
            <p className="text-gray-400 mt-2">© 2024 Samba Brasil Festival. Todos os direitos reservados.</p>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-yellow-400 transition-colors">Instagram</a>
            <a href="#" className="hover:text-yellow-400 transition-colors">Facebook</a>
            <a href="#" className="hover:text-yellow-400 transition-colors">TikTok</a>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default LandingPage;
