
export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: number;
}

export interface Photo {
  id: string;
  url: string;
  title: string;
  active: boolean;
}

export interface SiteSettings {
  heroBannerUrl: string;
  eventName: string;
  instagramUrl?: string;
  facebookUrl?: string;
  tiktokUrl?: string;
}

export interface AdminStats {
  totalLeads: number;
  recentLeads: Lead[];
  totalPhotos: number;
}
