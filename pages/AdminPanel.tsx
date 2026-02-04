
import React, { useEffect, useState } from 'react';
import { dbService } from '../services/db';
import { Lead, Photo } from '../types';
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
  ArrowLeft
} from 'lucide-react';

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'leads' | 'photos'>('leads');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newPhoto, setNewPhoto] = useState({ url: '', title: '' });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');

  const loadData = async () => {
    const [allLeads, allPhotos] = await Promise.all([
      dbService.getLeads(),
      dbService.getPhotos()
    ]);
    setLeads(allLeads.sort((a, b) => b.createdAt - a.createdAt));
    setPhotos(allPhotos);
  };

  useEffect(() => {
    if (isLoggedIn) loadData();
  }, [isLoggedIn]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'samba2024') {
      setIsLoggedIn(true);
    } else {
      alert('Senha incorreta!');
    }
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
    a.setAttribute('download', 'leads_samba_brasil.csv');
    a.click();
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-blue-900 flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-sm">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center">
              <Users className="text-blue-900 w-8 h-8" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-blue-900 text-center mb-6 uppercase">Admin Samba Brasil</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Senha de Acesso</label>
              <input 
                type="password" 
                autoFocus
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Digite a senha..."
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <p className="text-[10px] text-gray-400 mt-2 text-center">Dica: samba2024</p>
            </div>
            <button className="w-full bg-blue-900 text-white font-bold py-3 rounded-xl hover:bg-blue-800 transition-colors">
              ENTRAR NO PAINEL
            </button>
            <button 
              type="button"
              onClick={() => window.location.hash = '/'} 
              className="w-full text-gray-400 font-medium py-2 flex items-center justify-center gap-2 hover:text-blue-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Voltar para o Site
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-950 text-white flex flex-col fixed h-full">
        <div className="p-8">
          <h1 className="text-xl font-black uppercase tracking-tighter">Samba <span className="text-yellow-400">Admin</span></h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          <button 
            onClick={() => setActiveTab('leads')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'leads' ? 'bg-blue-800 text-white' : 'text-gray-400 hover:text-white hover:bg-blue-900/50'}`}
          >
            <Users className="w-5 h-5" />
            <span className="font-semibold">Inscritos</span>
          </button>
          <button 
            onClick={() => setActiveTab('photos')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'photos' ? 'bg-blue-800 text-white' : 'text-gray-400 hover:text-white hover:bg-blue-900/50'}`}
          >
            <ImageIcon className="w-5 h-5" />
            <span className="font-semibold">Galeria</span>
          </button>
        </nav>

        <div className="p-4 border-t border-white/10">
          <button 
             onClick={() => window.location.hash = '/'} 
             className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold">Ver Site</span>
          </button>
          <button 
             onClick={() => setIsLoggedIn(false)}
             className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-semibold">Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-6xl mx-auto">
          {activeTab === 'leads' ? (
            <div>
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-blue-900">Inscritos no Evento</h2>
                  <p className="text-gray-500">Total de {leads.length} leads cadastrados no Firebase</p>
                </div>
                <button 
                  onClick={exportLeads}
                  className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-xl text-blue-900 font-semibold hover:bg-gray-50 transition-all shadow-sm"
                >
                  <Download className="w-5 h-5" /> Exportar CSV
                </button>
              </div>

              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                  <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input 
                      type="text" 
                      placeholder="Pesquisar por nome ou e-mail..."
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      <th className="px-6 py-4">Nome</th>
                      <th className="px-6 py-4">E-mail</th>
                      <th className="px-6 py-4">Telefone</th>
                      <th className="px-6 py-4">Data Cadastro</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredLeads.map(lead => (
                      <tr key={lead.id} className="hover:bg-blue-50/30 transition-colors">
                        <td className="px-6 py-4 font-semibold text-blue-900">{lead.name}</td>
                        <td className="px-6 py-4 text-gray-600">{lead.email}</td>
                        <td className="px-6 py-4 text-gray-600">{lead.phone}</td>
                        <td className="px-6 py-4 text-gray-400 text-sm">
                          {new Date(lead.createdAt).toLocaleDateString()} às {new Date(lead.createdAt).toLocaleTimeString()}
                        </td>
                      </tr>
                    ))}
                    {filteredLeads.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-gray-400">Nenhum registro encontrado.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-blue-900">Gerenciar Galeria</h2>
                  <p className="text-gray-500">Adicione ou remova fotos do carrossel lateral</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Add Photo Form */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-fit">
                  <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                    <Plus className="w-5 h-5" /> Adicionar Foto
                  </h3>
                  <form onSubmit={handleAddPhoto} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Título</label>
                      <input 
                        type="text" 
                        required
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Ex: Show Arlindinho"
                        value={newPhoto.title}
                        onChange={e => setNewPhoto({...newPhoto, title: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">URL da Imagem</label>
                      <input 
                        type="url" 
                        required
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="https://images.unsplash.com/..."
                        value={newPhoto.url}
                        onChange={e => setNewPhoto({...newPhoto, url: e.target.value})}
                      />
                    </div>
                    <button className="w-full bg-yellow-400 text-blue-900 font-bold py-3 rounded-xl hover:bg-yellow-500 transition-colors shadow-lg shadow-yellow-400/20">
                      ADICIONAR À GALERIA
                    </button>
                  </form>
                </div>

                {/* Photos List */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {photos.map(photo => (
                    <div key={photo.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col group">
                      <div className="h-40 relative">
                        <img src={photo.url} alt={photo.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                           <button 
                             onClick={() => handleTogglePhoto(photo.id)}
                             className="p-2 bg-white rounded-full text-blue-900 hover:scale-110 transition-transform"
                             title={photo.active ? 'Ocultar' : 'Mostrar'}
                           >
                             {photo.active ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5 text-gray-400" />}
                           </button>
                           <button 
                             onClick={() => handleDeletePhoto(photo.id)}
                             className="p-2 bg-red-500 rounded-full text-white hover:scale-110 transition-transform"
                             title="Excluir"
                           >
                             <Trash2 className="w-5 h-5" />
                           </button>
                        </div>
                      </div>
                      <div className="p-4 flex justify-between items-center">
                        <div>
                          <p className="font-bold text-blue-900 truncate max-w-[150px]">{photo.title}</p>
                          <span className={`text-[10px] uppercase font-bold ${photo.active ? 'text-green-500' : 'text-gray-400'}`}>
                            {photo.active ? 'Ativa no Site' : 'Inativa'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;
