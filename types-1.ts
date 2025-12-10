
export enum UserRole {
  ADMIN = 'admin',
  FARMER = 'farmer',
  CONSUMER = 'consumer'
}

export interface User {
  id: number;
  name: string;
  role: UserRole;
  avatar: string;
}

export interface NewsItem {
  id: number;
  title: string;
  summary: string;
  date: string;
  category: 'Policy' | 'Notice' | 'News';
  imageUrl?: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  farmerName: string;
  stock: number;
  image: string;
  category: string;
}

export interface ServiceGuide {
  id: number;
  title: string;
  icon: any; // Lucide Icon
  status?: 'pending' | 'completed' | 'processing';
}

export interface ServiceApplication {
  id: number;
  userId: number; // 0 for current user in this demo
  userName: string;
  serviceName: string;
  date: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  note: string;
}

export interface Post {
  id: number;
  author: string;
  content: string;
  likes: number;
  comments: number;
  timeAgo: string;
  type: 'General' | 'Trade';
}

export interface CartItem extends Product {
  quantity: number;
}
