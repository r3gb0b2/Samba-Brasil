
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
  Loader2,
  ExternalLink,
  Instagram,
  Facebook,
  Youtube,
  Type,
  CalendarDays,
  Target,
  Code,
  Menu as MenuIcon,
  ChevronLeft,
  ChevronRight,
  CreditCard
} from 'lucide-react';

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'leads' | 'photos' | 'settings' | 'marketing'>('leads');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [settings, setSettings] = useState<SiteSettings>({ 
    logoUrl: '',
    heroBannerUrl: '', 
    eventName: '',
    eventDescription: '',
    eventDateDisplay: '',
    eventDayBanner: '',
    eventMonthBanner: '',
    instagramUrl: '',
    facebookUrl: '',
    tiktokUrl: '',
    facebookPixelId: '',
    googleTagManagerId: '',
    customHeadScript: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [newPhoto, setNewPhoto] = useState({ url: '', title: '' });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [isUploading, setIsUploading] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

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
          
          // Se for PNG, preserva a transparência exportando como PNG
          // Caso contrário, usa JPEG para comprimir melhor
          const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
          
          ctx?.drawImage(img, 0, 0, width, height);
          
          const dataUrl = canvas.toDataURL(outputType, outputType === 'image/jpeg' ? 0.7 : undefined);
          resolve(dataUrl);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
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
      alert("Erro ao processar imagem.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      // Logos costumam ser menores, então 800px é suficiente
      const compressedBase64 = await compressImage(file, 800);
      setSettings(prev => ({ ...prev, logoUrl: compressedBase64 }));
    } catch (err) {
      alert("Erro ao processar imagem.");
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
      if (result.success) setSaveStatus('success');
      else setSaveStatus('error');
    } catch (err) {
      setSaveStatus('error');
    } finally {
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const handleAddPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhoto.url) return;
    await dbService.addPhoto(newPhoto.url, newPhoto.title || 'Foto Galeria');
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
    l.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.cpf.includes(searchTerm)
  );

  const exportLeads = () => {
    const csv = [
      ['ID', 'Nome', 'Email', 'Telefone', 'CPF', 'Data'],
      ...leads.map(l => [l.id, l.name, l.email, l.phone, l.cpf, new Date(l.createdAt).toLocaleString()])
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
          <h2 className="text-2xl font-black text-[#269f78] text-center mb-8 uppercase italic tracking-tighter leading-none">Acesso Admin<br/><span className="text-[#f37f3a] text-sm not-italic">D&E MUSIC</span></h2>
          <div className="space-y-6">
            <input 
              type="password" 
              autoFocus
              className="w-full px-5 py-4 rounded-2xl border-2 border-transparent bg-white focus:border-[#f37f3a] outline-none transition-all font-mono text-center"
              placeholder="Digite a Senha"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <button type="submit" className="w-full bg-[#269f78] text-white font-black py-5 rounded-2xl hover:bg-[#1e7e5f] transition-all shadow-xl uppercase tracking-widest text-xs border-b-4 border-green-900">
              ENTRAR NO PAINEL
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f1e1] flex relative transition-all duration-300">
      {/* Botão de abrir menu (quando fechado) */}
      {!isSidebarVisible && (
        <button 
          onClick={() => setIsSidebarVisible(true)}
          className="fixed top-6 left-6 z-50 bg-[#269f78] text-white p-4 rounded-2xl shadow-xl border-2 border-white hover:scale-110 transition-all active:scale-95"
          title="Abrir Menu"
        >
          <MenuIcon className="w-6 h-6" />
        </button>
      )}

      {/* Sidebar Admin */}
      <aside className={`w-72 bg-[#269f78] text-white flex flex-col fixed h-full shadow-2xl z-40 transition-transform duration-300 ease-in-out ${isSidebarVisible ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-10 flex justify-between items-start">
          <h1 className="text-2xl font-black uppercase italic tracking-tighter leading-tight">SAMBA <span className="text-[#f6c83e] block text-[10px] not-italic tracking-[0.3em] mt-1 opacity-80">ADMIN D&E MUSIC</span></h1>
          <button 
            onClick={() => setIsSidebarVisible(false)}
            className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all md:block hidden"
            title="Recolher Menu"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="flex-1 px-6 space-y-4 overflow-y-auto pb-8">
          <button 
            onClick={() => window.location.hash = '/'} 
            className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-black text-[10px] uppercase tracking-widest transition-all mb-4 border border-white/20"
          >
            <ExternalLink className="w-4 h-4" /> Voltar ao Site
          </button>
          {[
            { id: 'leads', icon: Users, label: 'Inscritos' },
            { id: 'photos', icon: ImageIcon, label: 'Galeria' },
            { id: 'settings', icon: Settings, label: 'Visual & Site' },
            { id: 'marketing', icon: Target, label: 'Marketing & Meta' }
          ].map(item => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all font-black text-xs uppercase tracking-widest ${activeTab === item.id ? 'bg-[#1e7e5f] text-white shadow-lg border-b-4 border-green-950' : 'text-white/60 hover:text-white'}`}
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

      {/* Overlay para mobile quando o menu estiver aberto */}
      {isSidebarVisible && (
        <div 
          className="fixed inset-0 bg-black/20 z-30 md:hidden"
          onClick={() => setIsSidebarVisible(false)}
        />
      )}

      <main className={`flex-1 p-6 md:p-12 transition-all duration-300 ${isSidebarVisible ? 'ml-72' : 'ml-0 pt-24'}`}>
        <div className="max-w-5xl mx-auto">
          {activeTab === 'leads' && (
            <div className="space-y-8 animate-in fade-in">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                  <h2 className="text-4xl font-black text-[#269f78] uppercase italic tracking-tighter">Inscritos</h2>
                  <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Base de dados para pré-venda</p>
                </div>
                <button onClick={exportLeads} className="bg-[#f37f3a] text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-[#d86b2b] transition-all shadow-lg border-b-4 border-orange-800">
                  <Download className="w-4 h-4" /> Exportar Planilha
                </button>
              </div>
              <div className="bg-white rounded-[2rem] shadow-sm border-2 border-white overflow-hidden">
                <div className="p-6 bg-gray-50/50 border-b-2 border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="relative max-w-sm w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 w-4 h-4" />
                    <input 
                      type="text" 
                      placeholder="Pesquisar..."
                      className="w-full pl-10 pr-6 py-3 rounded-xl border-2 border-gray-100 focus:border-[#269f78] outline-none text-xs font-bold"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <span className="text-[10px] font-black text-[#269f78] uppercase">{leads.length} Cadastros</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50">
                        <th className="px-8 py-4">Inscrito</th>
                        <th className="px-8 py-4">CPF</th>
                        <th className="px-8 py-4">WhatsApp</th>
                        <th className="px-8 py-4">Data</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-gray-50">
                      {filteredLeads.map(lead => (
                        <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-8 py-5">
                            <p className="font-black text-[#269f78] uppercase text-sm">{lead.name}</p>
                            <p className="text-[11px] font-bold text-gray-400 lowercase">{lead.email}</p>
                          </td>
                          <td className="px-8 py-5 font-mono text-xs font-black text-gray-600">{lead.cpf}</td>
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
              <h2 className="text-4xl font-black text-[#269f78] uppercase italic tracking-tighter">Galeria de Fotos</h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border-2 border-white h-fit">
                   <h3 className="text-sm font-black text-[#269f78] mb-6 uppercase tracking-widest flex items-center gap-2"><Plus className="w-4 h-4" /> Adicionar Mídia</h3>
                   <div className="space-y-6">
                      <div className="relative group">
                        <div className="w-full aspect-[3/4] rounded-2xl border-4 border-dashed border-gray-100 flex flex-col items-center justify-center bg-gray-50 overflow-hidden">
                           {isUploading ? <Loader2 className="animate-spin text-[#269f78]" /> : newPhoto.url ? <img src={newPhoto.url} className="w-full h-full object-cover" /> : <ImageIcon size={40} className="text-gray-200" />}
                        </div>
                        <input type="file" ref={fileInputRef} className="hidden" onChange={handlePhotoUpload} />
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="mt-4 w-full bg-[#7db5d9] text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-widest">Escolher Foto</button>
                      </div>
                      <input type="text" placeholder="Título Opcional" className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 text-xs font-bold" value={newPhoto.title} onChange={e => setNewPhoto({...newPhoto, title: e.target.value})} />
                      <button onClick={handleAddPhoto} className="w-full bg-[#269f78] text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest border-b-4 border-green-900 shadow-xl">Publicar Galeria</button>
                   </div>
                </div>
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {photos.map(photo => (
                    <div key={photo.id} className="group relative bg-white rounded-3xl overflow-hidden shadow-sm border-4 border-white aspect-[3/4]">
                      <img src={photo.url} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                      <div className="absolute inset-0 bg-[#269f78]/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm">
                         <button onClick={() => handleTogglePhoto(photo.id)} className="p-3 bg-white rounded-xl text-[#269f78]">{photo.active ? <Eye size={20} /> : <EyeOff size={20} />}</button>
                         <button onClick={() => handleDeletePhoto(photo.id)} className="p-3 bg-red-500 rounded-xl text-white"><Trash2 size={20} /></button>
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
               <div className="bg-white p-6 md:p-10 rounded-[3rem] shadow-sm border-4 border-white">
                 <form onSubmit={handleSaveSettings} className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                          <label className="text-[10px] font-black text-[#269f78] uppercase tracking-widest ml-2 flex items-center gap-2">Logo do Evento</label>
                          <div className="w-full aspect-square max-w-[200px] rounded-2xl bg-[#f4f1e1] border-4 border-dashed border-gray-200 overflow-hidden relative group">
                            {isUploading && <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10"><Loader2 className="animate-spin text-[#269f78]" /></div>}
                            {settings.logoUrl ? <img src={settings.logoUrl} className="w-full h-full object-contain p-4" /> : <div className="w-full h-full flex items-center justify-center text-gray-300 italic">Sem Logo</div>}
                            <button type="button" onClick={() => logoInputRef.current?.click()} className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity font-black text-[10px] uppercase">Trocar Logo</button>
                          </div>
                          <input type="file" ref={logoInputRef} className="hidden" onChange={handleLogoUpload} />
                        </div>
                        
                        <div className="space-y-8">
                          <div className="space-y-2">
                              <label className="text-[10px] font-black text-[#269f78] uppercase tracking-widest ml-2 flex items-center gap-2">Título do Evento</label>
                              <input type="text" className="w-full px-6 py-4 bg-[#f4f1e1] rounded-2xl font-black text-[#269f78] uppercase outline-none" value={settings.eventName} onChange={e => setSettings({...settings, eventName: e.target.value})} />
                          </div>
                          <div className="space-y-2">
                              <label className="text-[10px] font-black text-[#269f78] uppercase tracking-widest ml-2 flex items-center gap-2">Data para Exibição</label>
                              <input type="text" className="w-full px-6 py-4 bg-[#f4f1e1] rounded-2xl font-bold text-xs" value={settings.eventDateDisplay} onChange={e => setSettings({...settings, eventDateDisplay: e.target.value})} />
                          </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-[#269f78] uppercase tracking-widest ml-2">Dia (Banner)</label>
                            <input type="text" className="w-full px-6 py-4 bg-[#f4f1e1] rounded-2xl font-bold text-xs" value={settings.eventDayBanner} onChange={e => setSettings({...settings, eventDayBanner: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-[#269f78] uppercase tracking-widest ml-2">Mês (Banner)</label>
                            <input type="text" className="w-full px-6 py-4 bg-[#f4f1e1] rounded-2xl font-bold text-xs uppercase" value={settings.eventMonthBanner} onChange={e => setSettings({...settings, eventMonthBanner: e.target.value})} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-[#269f78] uppercase tracking-widest ml-2">Descrição do Evento</label>
                        <textarea rows={4} className="w-full px-6 py-4 bg-[#f4f1e1] rounded-2xl font-bold text-sm leading-relaxed outline-none" value={settings.eventDescription} onChange={e => setSettings({...settings, eventDescription: e.target.value})} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-[#269f78] uppercase tracking-widest ml-2">Instagram (Link)</label>
                            <input type="text" className="w-full px-6 py-4 bg-[#f4f1e1] rounded-2xl font-bold text-xs" value={settings.instagramUrl} onChange={e => setSettings({...settings, instagramUrl: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-[#269f78] uppercase tracking-widest ml-2">Facebook (Link)</label>
                            <input type="text" className="w-full px-6 py-4 bg-[#f4f1e1] rounded-2xl font-bold text-xs" value={settings.facebookUrl} onChange={e => setSettings({...settings, facebookUrl: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-[#269f78] uppercase tracking-widest ml-2">Outra Rede (Link)</label>
                            <input type="text" className="w-full px-6 py-4 bg-[#f4f1e1] rounded-2xl font-bold text-xs" value={settings.tiktokUrl} onChange={e => setSettings({...settings, tiktokUrl: e.target.value})} />
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-[#269f78] uppercase tracking-widest ml-2">Banner Principal</label>
                      <div className="w-full aspect-[21/9] rounded-2xl bg-[#f4f1e1] border-4 border-dashed border-gray-200 overflow-hidden relative group">
                        {isUploading && <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10"><Loader2 className="animate-spin text-[#269f78]" /></div>}
                        {settings.heroBannerUrl ? <img src={settings.heroBannerUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-300 italic">Sem banner</div>}
                        <button type="button" onClick={() => bannerInputRef.current?.click()} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white text-[#269f78] px-6 py-3 rounded-xl font-black text-[10px] uppercase opacity-0 group-hover:opacity-100 transition-opacity">Substituir Imagem</button>
                      </div>
                      <input type="file" ref={bannerInputRef} className="hidden" onChange={handleBannerUpload} />
                    </div>

                    <button type="submit" disabled={isUploading || saveStatus === 'saving'} className="w-full bg-[#269f78] text-white py-6 rounded-2xl font-black uppercase tracking-widest border-b-8 border-[#1e7e5f] shadow-2xl active:translate-y-1 transition-all">
                      {saveStatus === 'saving' ? "SALVANDO..." : "ATUALIZAR VISUAL"}
                    </button>
                    {saveStatus === 'success' && <p className="text-center text-green-600 font-black text-[10px] uppercase">✓ Site atualizado!</p>}
                 </form>
               </div>
            </div>
          )}

          {activeTab === 'marketing' && (
            <div className="space-y-12 animate-in fade-in">
               <h2 className="text-4xl font-black text-[#269f78] uppercase italic tracking-tighter">Marketing & Conversão</h2>
               <div className="bg-white p-6 md:p-10 rounded-[3rem] shadow-sm border-4 border-white">
                 <form onSubmit={handleSaveSettings} className="space-y-8">
                    <div className="bg-[#269f78]/5 p-6 rounded-3xl border border-[#269f78]/10">
                      <h3 className="flex items-center gap-2 font-black text-[#269f78] uppercase text-xs mb-4"><Target className="w-4 h-4" /> Configuração Meta (Facebook/Instagram)</h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-[#269f78] uppercase tracking-widest ml-2">ID do Pixel do Facebook</label>
                          <input 
                            type="text" 
                            className="w-full px-6 py-4 bg-[#f4f1e1] rounded-2xl font-mono text-xs outline-none" 
                            placeholder="Ex: 123456789012345"
                            value={settings.facebookPixelId} 
                            onChange={e => setSettings({...settings, facebookPixelId: e.target.value})} 
                          />
                          <p className="text-[9px] text-gray-400 font-bold ml-2 italic">Cole apenas o número do ID. O evento de 'Lead' será disparado automaticamente em cada cadastro.</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#f37f3a]/5 p-6 rounded-3xl border border-[#f37f3a]/10">
                      <h3 className="flex items-center gap-2 font-black text-[#f37f3a] uppercase text-xs mb-4"><Code className="w-4 h-4" /> Scripts Customizados (Head)</h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-[#f37f3a] uppercase tracking-widest ml-2">Código Adicional (Google Analytics, GTM, etc.)</label>
                          <textarea 
                            rows={8} 
                            className="w-full px-6 py-4 bg-[#f4f1e1] rounded-2xl font-mono text-[10px] outline-none leading-relaxed" 
                            placeholder="<script> ... </script>"
                            value={settings.customHeadScript} 
                            onChange={e => setSettings({...settings, customHeadScript: e.target.value})} 
                          />
                        </div>
                      </div>
                    </div>

                    <button type="submit" disabled={saveStatus === 'saving'} className="w-full bg-[#f37f3a] text-white py-6 rounded-2xl font-black uppercase tracking-widest border-b-8 border-orange-800 shadow-2xl active:translate-y-1 transition-all">
                      {saveStatus === 'saving' ? "SALVANDO..." : "SALVAR CONFIGURAÇÕES DE TRACKING"}
                    </button>
                    {saveStatus === 'success' && <p className="text-center text-green-600 font-black text-[10px] uppercase animate-pulse">✓ Rastreamento configurado!</p>}
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
