
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
  updateDoc,
  onSnapshot,
  serverTimestamp,
  Timestamp
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
const PRESENCE_COLLECTION = 'presence';
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
          logoUrl: data.logoUrl || '',
          heroBannerUrl: data.heroBannerUrl || '',
          mobileBannerUrl: data.mobileBannerUrl || '',
          eventDescription: data.eventDescription || '',
          eventDateDisplay: data.eventDateDisplay || '',
          eventDayBanner: data.eventDayBanner || '',
          eventMonthBanner: data.eventMonthBanner || '',
          instagramUrl: data.instagramUrl || '',
          youtubeUrl: data.youtubeUrl || '',
          tiktokUrl: data.tiktokUrl || '',
        };
      }
      return {} as SiteSettings;
    } catch (error) {
      return {} as SiteSettings;
    }
  },

  async updateSettings(settings: Partial<SiteSettings>): Promise<{success: boolean, error?: string}> {
    try {
      const docRef = doc(db, SETTINGS_COLLECTION, GLOBAL_SETTINGS_ID);
      await setDoc(docRef, settings, { merge: true });
      return { success: true };
    } catch (error: any) {
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

  // Sistema de Presença (Heartbeat)
  async updateUserPresence(sessionId: string) {
    try {
      const presenceRef = doc(db, PRESENCE_COLLECTION, sessionId);
      await setDoc(presenceRef, {
        lastSeen: serverTimestamp()
      });
    } catch (e) {
      console.error("Error updating presence", e);
    }
  },

  subscribeOnlineCount(callback: (count: number) => void) {
    const q = collection(db, PRESENCE_COLLECTION);
    return onSnapshot(q, (snapshot) => {
      const now = Date.now();
      const oneMinuteAgo = now - 60000;
      
      const onlineUsers = snapshot.docs.filter(doc => {
        const data = doc.data();
        if (!data.lastSeen) return false;
        const lastSeenMillis = data.lastSeen instanceof Timestamp ? data.lastSeen.toMillis() : data.lastSeen;
        return lastSeenMillis > oneMinuteAgo;
      });
      
      callback(onlineUsers.length);
    });
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
