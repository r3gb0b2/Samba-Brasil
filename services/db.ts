
import { Lead, Photo } from '../types';

/**
 * Este serviço simula o comportamento do Firebase Firestore utilizando LocalStorage.
 * Para usar o Firebase real, basta substituir as chamadas para os métodos do SDK do Firebase.
 */

const LEADS_KEY = 'samba_brasil_leads';
const PHOTOS_KEY = 'samba_brasil_photos';

// Fotos iniciais de exemplo
const INITIAL_PHOTOS: Photo[] = [
  { id: '1', url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=800', title: 'Samba 1', active: true },
  { id: '2', url: 'https://images.unsplash.com/photo-1545127398-14699f92334b?auto=format&fit=crop&q=80&w=800', title: 'Samba 2', active: true },
  { id: '3', url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=800', title: 'Samba 3', active: true },
  { id: '4', url: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?auto=format&fit=crop&q=80&w=800', title: 'Samba 4', active: true },
];

export const dbService = {
  // --- LEADS ---
  async getLeads(): Promise<Lead[]> {
    const data = localStorage.getItem(LEADS_KEY);
    return data ? JSON.parse(data) : [];
  },

  async addLead(lead: Omit<Lead, 'id' | 'createdAt'>): Promise<{ success: boolean; message: string }> {
    const leads = await this.getLeads();
    
    // Verificação de duplicidade por e-mail
    if (leads.some(l => l.email.toLowerCase() === lead.email.toLowerCase())) {
      return { success: false, message: 'Este e-mail já está cadastrado em nossa lista!' };
    }

    const newLead: Lead = {
      ...lead,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: Date.now()
    };

    leads.push(newLead);
    localStorage.setItem(LEADS_KEY, JSON.stringify(leads));
    return { success: true, message: 'Cadastro realizado com sucesso! Prepare seu samba.' };
  },

  // --- PHOTOS ---
  async getPhotos(): Promise<Photo[]> {
    const data = localStorage.getItem(PHOTOS_KEY);
    if (!data) {
      localStorage.setItem(PHOTOS_KEY, JSON.stringify(INITIAL_PHOTOS));
      return INITIAL_PHOTOS;
    }
    return JSON.parse(data);
  },

  async addPhoto(url: string, title: string): Promise<void> {
    const photos = await this.getPhotos();
    const newPhoto: Photo = {
      id: Math.random().toString(36).substr(2, 9),
      url,
      title,
      active: true
    };
    photos.push(newPhoto);
    localStorage.setItem(PHOTOS_KEY, JSON.stringify(photos));
  },

  async deletePhoto(id: string): Promise<void> {
    const photos = await this.getPhotos();
    const filtered = photos.filter(p => p.id !== id);
    localStorage.setItem(PHOTOS_KEY, JSON.stringify(filtered));
  },

  async togglePhotoStatus(id: string): Promise<void> {
    const photos = await this.getPhotos();
    const updated = photos.map(p => p.id === id ? { ...p, active: !p.active } : p);
    localStorage.setItem(PHOTOS_KEY, JSON.stringify(updated));
  }
};
