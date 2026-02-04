
import React, { useEffect, useState } from 'react';
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
  CheckCircle2
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
  const [saveStatus, setSaveStatus] = useState(false);

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
    if (isLoggedIn) loadData();
  }, [isLoggedIn]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'samba2026') {
      setIsLoggedIn(true);
    } else {
      alert('Senha incorreta! Use: samba2026');
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await dbService.updateSettings(settings);
    setSaveStatus(true);
    setTimeout(() => setSaveStatus(false), 3000);
  };

  const handleAddPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhoto.url || !newPhoto.title) return;
    await dbService.addPhoto(newPhoto.url, newPhoto.title);
    setNewPhoto({ url: '', title: '' });
    loadData();
  };

  const handleDeletePhoto = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta foto?')) {
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
    a.setAttribute('href', url);
    a.setAttribute('download', 'leads_samba_brasil_fortaleza.csv');
    a.click();
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-blue-950 flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-white p-10 rounded-[2.5rem] shadow-2xl w-full max-w-sm">
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg shadow-yellow-400/20">
              <Users className="text-blue-900 w-10 h-10" />
            </div>
          </div>
          <h2 className="text-3xl font-black text-blue-900 text-center mb-2 uppercase tracking-tighter italic">Samba Admin</h2>
          <p className="text-gray-400 text-center text-sm mb-8 font-medium">Fortaleza 2026</p>
          
          <div className="space-y-6">
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Senha Mestra</label>
              <input 
                type="password" 
                autoFocus
                className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-mono"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <p className="text-[10px] text-blue-900/40 mt-3 text-center font-bold tracking-widest uppercase">Dica: samba2026</p>
            </div>
            <button className="w-full bg-blue-900 text-white font-black py-5 rounded-2xl hover:bg-blue-800 transition-all shadow-xl shadow-blue-900/20 active:scale-95 uppercase tracking-widest text-xs">
              ACESSAR PAINEL
            </button>
            <button 
              type="button"
              onClick={() => window.location.hash = '/'} 
              className="w-full text-gray-400 font-bold text-xs uppercase tracking-widest py-2 flex items-center justify-center gap-2 hover:text-blue-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Voltar ao Site
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-72 bg-blue-950 text-white flex flex-col fixed h-full shadow-2xl z-20">
        <div className="p-10">
          <h1 className="text-2xl font-black uppercase italic tracking-tighter">Samba <span className="text-yellow-400 text-sm block not-italic tracking-widest mt-1 opacity-80">ADMIN 2026</span></h1>
        </div>
        
        <nav className="flex-1 px-6 space-y-3">
          {[
            { id: 'leads', icon: Users, label: 'Inscritos' },
            { id: 'photos', icon: ImageIcon, label: 'Galeria' },
            { id: 'settings', icon: Settings, label: 'Configurações' }
          ].map(item => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all font-bold text-sm tracking-wide ${activeTab === item.id ? 'bg-blue-800 text-white shadow-lg shadow-black/20' : 'text-gray-400 hover:text-white hover:bg-blue-900/50'}`}
            >
              <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-yellow-400' : ''}`} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-6 space-y-2 border-t border-white/5 bg-blue-900/20">
          <button 
             onClick={() => window.location.hash = '/'} 
             className="w-full flex items-center gap-4 px-5 py-3 text-gray-400 hover:text-white transition-all text-xs font-bold uppercase tracking-widest"
          >
            <ArrowLeft className="w-4 h-4" />
            Ver Site
          </button>
          <button 
             onClick={() => setIsLoggedIn(false)}
             className="w-full flex items-center gap-4 px-5 py-3 text-red-400 hover:text-red-300 transition-all text-xs font-bold uppercase tracking-widest"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-72 p-12 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {activeTab === 'leads' && (
            <div className="animate-in fade-in duration-500">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div>
                  <h2 className="text-4xl font-black text-blue-900 tracking-tighter uppercase">Lista VIP</h2>
                  <p className="text-gray-400 font-medium mt-1 uppercase tracking-widest text-xs">Total de {leads.length} inscritos confirmados</p>
                </div>
                <button 
                  onClick={exportLeads}
                  className="flex items-center gap-3 bg-blue-900 text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-800 transition-all shadow-xl shadow-blue-900/10 active:scale-95"
                >
                  <Download className="w-5 h-5" /> Exportar Planilha
                </button>
              </div>

              <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-50 bg-gray-50/30">
                  <div className="relative max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input 
                      type="text" 
                      placeholder="Pesquisar inscritos..."
                      className="w-full pl-12 pr-6 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-blue-500/10 outline-none text-sm font-medium"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                        <th className="px-8 py-5">Nome do Inscrito</th>
                        <th className="px-8 py-5">E-mail</th>
                        <th className="px-8 py-5">WhatsApp</th>
                        <th className="px-8 py-5">Data/Hora</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredLeads.map(lead => (
                        <tr key={lead.id} className="hover:bg-blue-50/30 transition-colors group">
                          <td className="px-8 py-5 font-bold text-blue-900">{lead.name}</td>
                          <td className="px-8 py-5 text-gray-600 font-medium">{lead.email}</td>
                          <td className="px-8 py-5 text-blue-600 font-mono text-sm font-bold">{lead.phone}</td>
                          <td className="px-8 py-5 text-gray-400 text-[11px] font-bold uppercase tracking-tighter">
                            {new Date(lead.createdAt).toLocaleDateString()} • {new Date(lead.createdAt).toLocaleTimeString()}
                          </td>
                        </tr>
                      ))}
                      {filteredLeads.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-8 py-20 text-center">
                            <Users className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Nenhum inscrito encontrado</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'photos' && (
            <div className="animate-in fade-in duration-500">
              <div className="mb-12">
                <h2 className="text-4xl font-black text-blue-900 tracking-tighter uppercase">Galeria de Mídia</h2>
                <p className="text-gray-400 font-medium mt-1 uppercase tracking-widest text-xs">Fotos ativas no carrossel da Landing Page</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 h-fit sticky top-12">
                  <h3 className="text-xl font-black text-blue-900 mb-6 flex items-center gap-3 uppercase tracking-tighter">
                    <Plus className="w-6 h-6 text-yellow-500" /> Nova Mídia
                  </h3>
                  <form onSubmit={handleAddPhoto} className="space-y-6">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Legenda/Título</label>
                      <input 
                        type="text" 
                        required
                        className="w-full px-5 py-4 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-yellow-400/10 focus:border-yellow-400 outline-none transition-all font-medium"
                        placeholder="Ex: Noite de Samba"
                        value={newPhoto.title}
                        onChange={e => setNewPhoto({...newPhoto, title: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">URL da Imagem</label>
                      <input 
                        type="url" 
                        required
                        className="w-full px-5 py-4 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-yellow-400/10 focus:border-yellow-400 outline-none transition-all font-medium"
                        placeholder="https://images.unsplash.com/..."
                        value={newPhoto.url}
                        onChange={e => setNewPhoto({...newPhoto, url: e.target.value})}
                      />
                    </div>
                    <button className="w-full bg-yellow-400 text-blue-900 font-black py-5 rounded-2xl hover:bg-yellow-500 transition-all shadow-xl shadow-yellow-400/20 uppercase tracking-widest text-xs active:scale-95">
                      ADICIONAR À GALERIA
                    </button>
                  </form>
                </div>

                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {photos.map(photo => (
                    <div key={photo.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 flex flex-col group animate-in zoom-in-95 duration-300">
                      <div className="h-56 relative">
                        <img src={photo.url} alt={photo.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-blue-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm">
                           <button 
                             onClick={() => handleTogglePhoto(photo.id)}
                             className="p-3 bg-white rounded-2xl text-blue-900 hover:scale-110 transition-all shadow-xl"
                             title={photo.active ? 'Ocultar no Site' : 'Exibir no Site'}
                           >
                             {photo.active ? <Eye className="w-6 h-6" /> : <EyeOff className="w-6 h-6 text-gray-400" />}
                           </button>
                           <button 
                             onClick={() => handleDeletePhoto(photo.id)}
                             className="p-3 bg-red-500 rounded-2xl text-white hover:scale-110 transition-all shadow-xl shadow-red-500/20"
                             title="Excluir Permanentemente"
                           >
                             <Trash2 className="w-6 h-6" />
                           </button>
                        </div>
                      </div>
                      <div className="p-6 flex justify-between items-center">
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-blue-900 truncate uppercase tracking-tighter text-sm">{photo.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`w-2 h-2 rounded-full ${photo.active ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-gray-300'}`}></span>
                            <span className={`text-[9px] uppercase font-black tracking-widest ${photo.active ? 'text-green-600' : 'text-gray-400'}`}>
                              {photo.active ? 'Visível Online' : 'Oculto'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="animate-in fade-in duration-500">
              <div className="mb-12">
                <h2 className="text-4xl font-black text-blue-900 tracking-tighter uppercase">Aparência do Site</h2>
                <p className="text-gray-400 font-medium mt-1 uppercase tracking-widest text-xs">Configure os elementos principais da Landing Page</p>
              </div>

              <div className="max-w-3xl">
                <form onSubmit={handleSaveSettings} className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-8">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-blue-900 uppercase tracking-widest ml-1">Nome Oficial do Evento</label>
                      <input 
                        type="text" 
                        required
                        className="w-full px-6 py-5 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-lg text-blue-900"
                        value={settings.eventName}
                        onChange={e => setSettings({...settings, eventName: e.target.value})}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-blue-900 uppercase tracking-widest ml-1">URL do Banner Hero (Horizontal)</label>
                      <input 
                        type="url" 
                        required
                        className="w-full px-6 py-5 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-gray-600"
                        placeholder="Link da imagem principal..."
                        value={settings.heroBannerUrl}
                        onChange={e => setSettings({...settings, heroBannerUrl: e.target.value})}
                      />
                      <p className="text-[10px] text-gray-400 font-medium italic ml-1">* Recomendado: Proporção 16:9 ou 21:9 para melhor visualização em telas largas.</p>
                    </div>
                    
                    <div className="pt-4">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 ml-1">Prévia do Banner</p>
                      <div className="w-full h-40 rounded-2xl border-2 border-dashed border-gray-200 overflow-hidden relative group">
                        {settings.heroBannerUrl ? (
                          <img src={settings.heroBannerUrl} className="w-full h-full object-cover" alt="Preview" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300">
                            Sem imagem
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 pt-6">
                    <button 
                      type="submit"
                      className="flex-1 bg-blue-900 text-white font-black py-5 rounded-2xl hover:bg-blue-800 transition-all shadow-xl shadow-blue-900/20 uppercase tracking-widest text-xs flex items-center justify-center gap-3 active:scale-95"
                    >
                      <Save className="w-5 h-5" /> SALVAR ALTERAÇÕES
                    </button>
                    {saveStatus && (
                      <div className="flex items-center gap-2 text-green-600 font-black text-[10px] uppercase tracking-widest animate-in fade-in slide-in-from-left-4">
                        <CheckCircle2 className="w-5 h-5" /> Configurações Atualizadas!
                      </div>
                    )}
                  </div>
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
