
export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  createdAt: number;
}

export interface Photo {
  id: string;
  url: string;
  title: string;
  active: boolean;
}

export interface SiteSettings {
  logoUrl: string;
  heroBannerUrl: string;
  mobileBannerUrl: string; // Novo campo para banner mobile
  eventName: string;
  eventDescription: string;
  eventDateDisplay: string;
  eventMonthBanner: string;
  eventDayBanner: string;
  instagramUrl?: string;
  youtubeUrl?: string;
  tiktokUrl?: string;
  // Campos de Marketing/Meta
  facebookPixelId?: string;
  googleTagManagerId?: string;
  customHeadScript?: string;
}

export interface AdminStats {
  totalLeads: number;
  recentLeads: Lead[];
  totalPhotos: number;
}
