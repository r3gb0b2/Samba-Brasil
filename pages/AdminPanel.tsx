
import React, { useEffect, useState, useRef } from 'react';
import { dbService } from '../services/db';
import { Lead, Photo, SiteSettings } from '../types';
import { 
  Users, 
  Image as ImageIcon, 
  Trash2, 
  Eye, 
  EyeOff, 
  LogOut, 
  Search, 
  Download,
  Plus,
  ArrowLeft,
  Settings,
  Save,
  CheckCircle2,
  Upload,
  AlertCircle,
  Loader2
} from 'lucide-react';

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'leads' | 'photos' | 'settings'>('leads');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [settings, setSettings] = useState<SiteSettings>({ heroBannerUrl: '', eventName: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [newPhoto, setNewPhoto] = useState({ url: '', title: '' });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const loadData = async () => {
    const [allLeads, allPhotos, siteSettings] = await Promise.all([
      dbService.getLeads(),
      dbService.getPhotos(),
      dbService.getSettings()
    ]);
    setLeads(allLeads);
    setPhotos(allPhotos);
    setSettings(siteSettings);
  };

  useEffect(() => {
    const session = localStorage.getItem('samba_admin_session');
    if (session === 'active') setIsLoggedIn(true);
  }, []);

  useEffect(() => {
    if (isLoggedIn) loadData();
  }, [isLoggedIn]);

  // Função para comprimir imagem e garantir que caiba no Firestore (< 1MB)
  const compressImage = (file: File, maxWidth: number = 1920): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = (maxWidth * height) / width;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Exportar como JPEG com 70% de qualidade para reduzir peso
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          resolve(dataUrl);
        };
        img.onerror = (e) => reject(e);
      };
      reader.onerror = (e) => reject(e);
    });
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'samba2026') {
      setIsLoggedIn(true);
      localStorage.setItem('samba_admin_session', 'active');
    } else {
      alert('Senha incorreta!');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('samba_admin_session');
    window.location.hash = '/';
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      const compressedBase64 = await compressImage(file, 1920);
      setSettings(prev => ({ ...prev, heroBannerUrl: compressedBase64 }));
    } catch (err) {
      alert("Erro ao processar imagem. Tente uma foto menor.");
    } finally {
      setIsUploading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      const compressedBase64 = await compressImage(file, 1080);
      setNewPhoto(prev => ({ ...prev, url: compressedBase64 }));
    } catch (err) {
      alert("Erro ao processar imagem.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus('saving');
    try {
      const result = await dbService.updateSettings(settings);
      if (result.success) {
        setSaveStatus('success');
      } else {
        setSaveStatus('error');
        alert("Erro ao salvar no banco de dados. A imagem pode ser muito grande.");
      }
    } catch (err) {
      setSaveStatus('error');
    } finally {
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const handleAddPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhoto.url) return;
    await dbService.addPhoto(newPhoto.url, newPhoto.title || 'Foto da Galeria');
    setNewPhoto({ url: '', title: '' });
    loadData();
  };

  const handleDeletePhoto = async (id: string) => {
    if (confirm('Excluir esta foto?')) {
      await dbService.deletePhoto(id);
      loadData();
    }
  };

  const handleTogglePhoto = async (id: string) => {
    await dbService.togglePhotoStatus(id);
    loadData();
  };

  const filteredLeads = leads.filter(l => 
    l.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    l.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportLeads = () => {
    const csv = [
      ['ID', 'Nome', 'Email', 'Telefone', 'Data'],
      ...leads.map(l => [l.id, l.name, l.email, l.phone, new Date(l.createdAt).toLocaleString()])
    ].map(e => e.join(",")).join("\n");
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inscritos_samba_brasil_20anos.csv';
    a.click();
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#269f78] flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-[#f4f1e1] p-10 rounded-[3rem] shadow-2xl w-full max-w-sm border-4 border-white">
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-[#f37f3a] rounded-full flex items-center justify-center shadow-lg border-4 border-white">
              <Users className="text-white w-10 h-10" />
            </div>
          </div>
          <h2 className="text-2xl font-black text-[#269f78] text-center mb-8 uppercase italic tracking-tighter leading-none">Acesso Restrito<br/><span className="text-[#f37f3a] text-sm not-italic">Samba Brasil Admin</span></h2>
          <div className="space-y-6">
            <input 
              type="password" 
              autoFocus
              className="w-full px-5 py-4 rounded-2xl border-2 border-transparent bg-white focus:border-[#f37f3a] outline-none transition-all font-mono text-center"
              placeholder="Senha Mestra"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <button type="submit" className="w-full bg-[#269f78] text-white font-black py-5 rounded-2xl hover:bg-[#1e7e5f] transition-all shadow-xl uppercase tracking-widest text-xs border-b-4 border-green-900">
              ACESSAR PAINEL
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f1e1] flex">
      <aside className="w-72 bg-[#269f78] text-white flex flex-col fixed h-full shadow-2xl z-20">
        <div className="p-10">
          <h1 className="text-2xl font-black uppercase italic tracking-tighter">SAMBA <span className="text-[#f6c83e] block text-xs not-italic tracking-[0.3em] mt-1">ADMIN 20 ANOS</span></h1>
        </div>
        <nav className="flex-1 px-6 space-y-4">
          {[
            { id: 'leads', icon: Users, label: 'Inscritos' },
            { id: 'photos', icon: ImageIcon, label: 'Galeria' },
            { id: 'settings', icon: Settings, label: 'Visual' }
          ].map(item => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all font-black text-xs uppercase tracking-widest ${activeTab === item.id ? 'bg-[#1e7e5f] text-white shadow-lg' : 'text-white/60 hover:text-white'}`}
            >
              <item.icon className="w-4 h-4" /> {item.label}
            </button>
          ))}
        </nav>
        <div className="p-8 border-t border-white/10">
          <button onClick={handleLogout} className="w-full flex items-center gap-4 px-5 py-3 text-red-200 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest">
            <LogOut className="w-4 h-4" /> Deslogar
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-72 p-12">
        <div className="max-w-5xl mx-auto">
          {activeTab === 'leads' && (
            <div className="space-y-8 animate-in fade-in">
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-4xl font-black text-[#269f78] uppercase italic tracking-tighter">Inscritos</h2>
                  <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Lista de Leads para a Pré-venda</p>
                </div>
                <button onClick={exportLeads} className="bg-[#f37f3a] text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-[#d86b2b] transition-all shadow-lg border-b-4 border-orange-800">
                  <Download className="w-4 h-4" /> Exportar CSV
                </button>
              </div>

              <div className="bg-white rounded-[2rem] shadow-sm border-2 border-white overflow-hidden">
                <div className="p-6 bg-gray-50/50 border-b-2 border-gray-100">
                  <div className="relative max-w-sm">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 w-4 h-4" />
                    <input 
                      type="text" 
                      placeholder="Buscar por nome ou email..."
                      className="w-full pl-10 pr-6 py-3 rounded-xl border-2 border-gray-100 focus:border-[#269f78] outline-none text-xs font-bold"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50">
                        <th className="px-8 py-4">Inscrito</th>
                        <th className="px-8 py-4">WhatsApp</th>
                        <th className="px-8 py-4">Inscrição</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-gray-50">
                      {filteredLeads.map(lead => (
                        <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-8 py-5">
                            <p className="font-black text-[#269f78] uppercase text-sm">{lead.name}</p>
                            <p className="text-[11px] font-bold text-gray-400 lowercase">{lead.email}</p>
                          </td>
                          <td className="px-8 py-5 font-mono text-xs font-black text-[#f37f3a]">{lead.phone}</td>
                          <td className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase">{new Date(lead.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'photos' && (
            <div className="space-y-12 animate-in fade-in">
              <div className="flex justify-between items-end">
                <div>
                   <h2 className="text-4xl font-black text-[#269f78] uppercase italic tracking-tighter">Galeria</h2>
                   <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Fotos que aparecem no carrossel</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border-2 border-white h-fit">
                   <h3 className="text-sm font-black text-[#269f78] mb-6 uppercase tracking-widest flex items-center gap-2"><Plus className="w-4 h-4" /> Nova Foto</h3>
                   <div className="space-y-6">
                      <div className="relative group">
                        <div className="w-full aspect-[3/4] rounded-2xl border-4 border-dashed border-gray-100 flex flex-col items-center justify-center bg-gray-50 overflow-hidden">
                           {isUploading ? (
                             <div className="flex flex-col items-center">
                               <Loader2 className="w-8 h-8 animate-spin text-[#269f78]" />
                               <p className="text-[10px] font-black mt-2 text-[#269f78]">COMPRIMINDO...</p>
                             </div>
                           ) : newPhoto.url ? (
                             <img src={newPhoto.url} className="w-full h-full object-cover" alt="Preview" />
                           ) : (
                             <>
                               <ImageIcon className="w-10 h-10 text-gray-200 mb-2" />
                               <p className="text-[10px] font-black text-gray-300 uppercase text-center px-4">Sugestão: 1080 x 1350px (Vertical)</p>
                             </>
                           )}
                        </div>
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="mt-4 w-full bg-[#7db5d9] text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[#6ca8cc] transition-all">Selecionar Arquivo</button>
                      </div>
                      <input 
                        type="text" 
                        placeholder="Título opcional"
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 text-xs font-bold"
                        value={newPhoto.title}
                        onChange={e => setNewPhoto({...newPhoto, title: e.target.value})}
                      />
                      <button onClick={handleAddPhoto} className="w-full bg-[#269f78] text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest border-b-4 border-green-900 shadow-xl">Adicionar na Galeria</button>
                   </div>
                </div>

                <div className="lg:col-span-2 grid grid-cols-2 gap-6">
                  {photos.map(photo => (
                    <div key={photo.id} className="group relative bg-white rounded-3xl overflow-hidden shadow-sm border-4 border-white aspect-[3/4]">
                      <img src={photo.url} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="" />
                      <div className="absolute inset-0 bg-[#269f78]/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm">
                         <button onClick={() => handleTogglePhoto(photo.id)} className="p-3 bg-white rounded-xl text-[#269f78] shadow-xl hover:scale-110 transition-transform">
                            {photo.active ? <Eye size={20} /> : <EyeOff size={20} className="text-gray-300" />}
                         </button>
                         <button onClick={() => handleDeletePhoto(photo.id)} className="p-3 bg-red-500 rounded-xl text-white shadow-xl hover:scale-110 transition-transform">
                            <Trash2 size={20} />
                         </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-12 animate-in fade-in">
               <h2 className="text-4xl font-black text-[#269f78] uppercase italic tracking-tighter">Identidade Visual</h2>
               <div className="max-w-2xl bg-white p-10 rounded-[3rem] shadow-sm border-4 border-white">
                 <form onSubmit={handleSaveSettings} className="space-y-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-[#269f78] uppercase tracking-widest ml-2">Título do Evento</label>
                      <input 
                        type="text" 
                        className="w-full px-6 py-4 bg-[#f4f1e1] rounded-2xl font-black text-[#269f78] uppercase outline-none"
                        value={settings.eventName}
                        onChange={e => setSettings({...settings, eventName: e.target.value})}
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-[#269f78] uppercase tracking-widest ml-2">Banner Principal (Horizontal)</label>
                      <div className="w-full aspect-[21/9] rounded-2xl bg-[#f4f1e1] border-4 border-dashed border-gray-200 overflow-hidden relative group">
                        {isUploading ? (
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50">
                            <Loader2 className="w-10 h-10 animate-spin text-[#269f78]" />
                            <p className="text-[10px] font-black mt-2 text-[#269f78]">OTIMIZANDO IMAGEM...</p>
                          </div>
                        ) : null}
                        {settings.heroBannerUrl ? (
                          <img src={settings.heroBannerUrl} className="w-full h-full object-cover" alt="Preview" />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 italic">Sem banner definido</div>
                        )}
                        <div className="absolute inset-0 bg-[#269f78]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button type="button" onClick={() => bannerInputRef.current?.click()} className="bg-white text-[#269f78] px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest">Trocar Imagem</button>
                        </div>
                      </div>
                      <input type="file" ref={bannerInputRef} className="hidden" accept="image/*" onChange={handleBannerUpload} />
                      <div className="flex items-start gap-3 bg-blue-50 p-4 rounded-xl text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                        <AlertCircle className="w-4 h-4 shrink-0" /> Ideal: 1920x600 pixels. O sistema comprimirá automaticamente para caber no banco de dados.
                      </div>
                    </div>

                    <button 
                      type="submit"
                      disabled={isUploading || saveStatus === 'saving'} 
                      className="w-full bg-[#269f78] text-white py-6 rounded-2xl font-black uppercase tracking-widest border-b-8 border-[#1e7e5f] shadow-2xl active:translate-y-1 active:border-b-4 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                      {saveStatus === 'saving' ? (
                        <> <Loader2 className="w-5 h-5 animate-spin" /> SALVANDO...</>
                      ) : (
                        <><Save className="w-5 h-5" /> SALVAR ALTERAÇÕES</>
                      )}
                    </button>
                    
                    {saveStatus === 'success' && (
                      <div className="flex items-center justify-center gap-2 text-green-600 font-black text-[10px] uppercase animate-in fade-in slide-in-from-top-2">
                        <CheckCircle2 className="w-5 h-5" /> Alterações salvas com sucesso!
                      </div>
                    )}
                    {saveStatus === 'error' && (
                      <div className="flex items-center justify-center gap-2 text-red-600 font-black text-[10px] uppercase animate-in fade-in slide-in-from-top-2">
                        <AlertCircle className="w-5 h-5" /> Erro ao salvar. Tente novamente.
                      </div>
                    )}
                 </form>
               </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;
