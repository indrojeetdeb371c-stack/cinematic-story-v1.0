export interface Photo {
  id: string;
  url: string;
  category: 'wedding' | 'engagement' | 'pre-wedding' | 'other';
  title: string;
}

export interface Booking {
  id: string;
  name: string;
  phone: string;
  date: string;
  location: string;
  package: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface Package {
  name: string;
  price: string;
  features: string[];
  color: string;
}

export interface Review {
  id: string;
  name: string;
  comment: string;
  rating: number;
}

export interface Offer {
  _id: string;
  title: string;
  description: string;
  discount: string;
  expiryDate: string;
  isActive: boolean;
}

export interface Settings {
  phone: string;
  email: string;
  facebook: string;
  instagram: string;
  youtube: string;
  address: string;
  heroImage: string;
  aboutTitle: string;
  aboutSubtitle: string;
  aboutDescription: string;
  aboutImage: string;
  showOffers: boolean;
}
