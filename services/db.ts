
import { Lead, Photo } from '../types';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  deleteDoc, 
  doc, 
  updateDoc 
} from 'firebase/firestore';

// Configuração do Firebase
// Nota: Em um ambiente de produção real, essas chaves viriam de variáveis de ambiente.
const firebaseConfig = {
  apiKey: "AIzaSyDsi6VpfhLQW8UWgAp5c4TRV7vqOkDyauU",
  authDomain: "stingressos-e0a5f.firebaseapp.com",
  projectId: "stingressos-e0a5f",
  storageBucket: "stingressos-e0a5f.firebasestorage.app",
  messagingSenderId: "424186734009",
  appId: "1:424186734009:web:b459df27b94bf127784268",
  measurementId: "G-EEWHM37VXR"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Nomes das coleções
const LEADS_COLLECTION = 'leads';
const PHOTOS_COLLECTION = 'photos';

export const dbService = {
  // --- LEADS ---
  async getLeads(): Promise<Lead[]> {
    try {
      const q = query(collection(db, LEADS_COLLECTION), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Lead[];
    } catch (error) {
      console.error("Erro ao buscar leads:", error);
      return [];
    }
  },

  async addLead(lead: Omit<Lead, 'id' | 'createdAt'>): Promise<{ success: boolean; message: string }> {
    try {
      // Verificação de duplicidade por e-mail no Firestore
      const q = query(collection(db, LEADS_COLLECTION), where("email", "==", lead.email.toLowerCase()));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        return { success: false, message: 'Este e-mail já está cadastrado em nossa lista!' };
      }

      await addDoc(collection(db, LEADS_COLLECTION), {
        ...lead,
        email: lead.email.toLowerCase(),
        createdAt: Date.now()
      });

      return { success: true, message: 'Cadastro realizado com sucesso! Prepare seu samba.' };
    } catch (error) {
      console.error("Erro ao adicionar lead:", error);
      return { success: false, message: 'Erro ao conectar com o servidor. Tente novamente.' };
    }
  },

  // --- PHOTOS ---
  async getPhotos(): Promise<Photo[]> {
    try {
      const querySnapshot = await getDocs(collection(db, PHOTOS_COLLECTION));
      const photos = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Photo[];

      // Se a coleção estiver vazia (primeiro acesso), poderíamos popular com iniciais
      if (photos.length === 0) {
        return [
          { id: 'default1', url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=800', title: 'Samba 1', active: true },
          { id: 'default2', url: 'https://images.unsplash.com/photo-1545127398-14699f92334b?auto=format&fit=crop&q=80&w=800', title: 'Samba 2', active: true }
        ];
      }
      return photos;
    } catch (error) {
      console.error("Erro ao buscar fotos:", error);
      return [];
    }
  },

  async addPhoto(url: string, title: string): Promise<void> {
    try {
      await addDoc(collection(db, PHOTOS_COLLECTION), {
        url,
        title,
        active: true,
        createdAt: Date.now()
      });
    } catch (error) {
      console.error("Erro ao adicionar foto:", error);
    }
  },

  async deletePhoto(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, PHOTOS_COLLECTION, id));
    } catch (error) {
      console.error("Erro ao deletar foto:", error);
    }
  },

  async togglePhotoStatus(id: string): Promise<void> {
    try {
      const photos = await this.getPhotos();
      const photo = photos.find(p => p.id === id);
      if (photo) {
        const photoRef = doc(db, PHOTOS_COLLECTION, id);
        await updateDoc(photoRef, {
          active: !photo.active
        });
      }
    } catch (error) {
      console.error("Erro ao alterar status da foto:", error);
    }
  }
};
