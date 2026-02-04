
import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy, 
  deleteDoc, 
  doc, 
  setDoc,
  updateDoc 
} from 'firebase/firestore';
import { Lead, Photo, SiteSettings } from '../types';

const firebaseConfig = {
  apiKey: "AIzaSyDsi6VpfhLQW8UWgAp5c4TRV7vqOkDyauU",
  authDomain: "stingressos-e0a5f.firebaseapp.com",
  projectId: "stingressos-e0a5f",
  storageBucket: "stingressos-e0a5f.firebasestorage.app",
  messagingSenderId: "424186734009",
  appId: "1:424186734009:web:b459df27b94bf127784268",
  measurementId: "G-EEWHM37VXR"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

const LEADS_COLLECTION = 'leads';
const PHOTOS_COLLECTION = 'photos';
const SETTINGS_COLLECTION = 'settings';
const GLOBAL_SETTINGS_ID = 'global';

export const dbService = {
  async getSettings(): Promise<SiteSettings> {
    try {
      const docRef = doc(db, SETTINGS_COLLECTION, GLOBAL_SETTINGS_ID);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as SiteSettings;
        return {
          ...data,
          eventDescription: data.eventDescription || 'Há duas décadas escrevendo a história do samba no Ceará. Prepare-se para a maior edição de todos os tempos.',
          eventDateDisplay: data.eventDateDisplay || '08 de Agosto',
          eventDayBanner: data.eventDayBanner || '08',
          eventMonthBanner: data.eventMonthBanner || 'AGOSTO',
          instagramUrl: data.instagramUrl || '#',
          facebookUrl: data.facebookUrl || '#',
          tiktokUrl: data.tiktokUrl || '#',
          facebookPixelId: data.facebookPixelId || '',
          googleTagManagerId: data.googleTagManagerId || '',
          customHeadScript: data.customHeadScript || ''
        };
      }
      return {
        heroBannerUrl: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&q=80&w=2000',
        eventName: 'Samba Brasil Fortaleza 2026',
        eventDescription: 'Há duas décadas escrevendo a história do samba no Ceará. Prepare-se para a maior edição de todos os tempos.',
        eventDateDisplay: '08 de Agosto',
        eventDayBanner: '08',
        eventMonthBanner: 'AGOSTO',
        instagramUrl: '#',
        facebookUrl: '#',
        tiktokUrl: '#',
        facebookPixelId: '',
        googleTagManagerId: '',
        customHeadScript: ''
      };
    } catch (error) {
      return {
        heroBannerUrl: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&q=80&w=2000',
        eventName: 'Samba Brasil Fortaleza 2026',
        eventDescription: 'Há duas décadas escrevendo a história do samba no Ceará. Prepare-se para a maior edição de todos os tempos.',
        eventDateDisplay: '08 de Agosto',
        eventDayBanner: '08',
        eventMonthBanner: 'AGOSTO',
        instagramUrl: '#',
        facebookUrl: '#',
        tiktokUrl: '#',
        facebookPixelId: '',
        googleTagManagerId: '',
        customHeadScript: ''
      };
    }
  },

  async updateSettings(settings: Partial<SiteSettings>): Promise<{success: boolean, error?: string}> {
    try {
      const docRef = doc(db, SETTINGS_COLLECTION, GLOBAL_SETTINGS_ID);
      await setDoc(docRef, settings, { merge: true });
      return { success: true };
    } catch (error: any) {
      console.error("Erro ao salvar:", error);
      return { success: false, error: error.message };
    }
  },

  async getLeads(): Promise<Lead[]> {
    try {
      const q = query(collection(db, LEADS_COLLECTION), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Lead[];
    } catch (error) {
      return [];
    }
  },

  async addLead(lead: Omit<Lead, 'id' | 'createdAt'>): Promise<{ success: boolean; message: string }> {
    try {
      const q = query(collection(db, LEADS_COLLECTION), where("email", "==", lead.email.toLowerCase()));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        return { success: false, message: 'Este e-mail já está cadastrado!' };
      }
      await addDoc(collection(db, LEADS_COLLECTION), {
        ...lead,
        email: lead.email.toLowerCase(),
        createdAt: Date.now()
      });
      return { success: true, message: 'Cadastro realizado com sucesso!' };
    } catch (error) {
      return { success: false, message: 'Erro ao conectar com o banco de dados.' };
    }
  },

  async getPhotos(): Promise<Photo[]> {
    try {
      const querySnapshot = await getDocs(collection(db, PHOTOS_COLLECTION));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Photo[];
    } catch (error) {
      return [];
    }
  },

  async addPhoto(url: string, title: string): Promise<void> {
    try {
      await addDoc(collection(db, PHOTOS_COLLECTION), { url, title, active: true, createdAt: Date.now() });
    } catch (error) {}
  },

  async deletePhoto(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, PHOTOS_COLLECTION, id));
    } catch (error) {}
  },

  async togglePhotoStatus(id: string): Promise<void> {
    try {
      const photoRef = doc(db, PHOTOS_COLLECTION, id);
      const photoSnap = await getDoc(photoRef);
      if (photoSnap.exists()) {
        await updateDoc(photoRef, { active: !photoSnap.data().active });
      }
    } catch (error) {}
  }
};
