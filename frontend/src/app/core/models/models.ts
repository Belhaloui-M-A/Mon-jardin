// ===== MODELS / INTERFACES TypeScript =====

export interface User {
  id?: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  role: "ADMIN" | "CLIENT";
  enabled: boolean;
  createdAt?: string;
}

export interface AuthResponse {
  email: string;
  firstName: string;
  lastName: string;
  role: "ADMIN" | "CLIENT";
  message: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
}

export interface Cart {
  items: CartItem[];
}

export interface SiteSettings {
  id?: number;
  emailContact: string;
  phoneContact: string;
  addressFr: string;
  addressAr: string;
  descriptionFr: string;
  descriptionAr: string;
}

export interface Plant {
  id: number;
  name: string;
  species?: string;
  description?: string;
  price: number;
  stock: number;
  imageUrl?: string;
  images?: string[];
  wateringFrequency?: string;
  lightRequirement?: string;
  difficultyLevel?: "FACILE" | "MOYEN" | "DIFFICILE";
  adultSize?: string;
  toxicForAnimals?: boolean;
  discountPercent?: number;
  finalPrice?: number;
  active: boolean;
  plantOfTheMonth?: boolean;
  category?: Category;
  createdAt?: string;
}

export interface CartItem {
  id: number;
  plant: Plant;
  quantity: number;
  updatedAt?: string;
}

export interface WishlistItem {
  id: number;
  plant: Plant;
  createdAt?: string;
}

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export interface OrderItem {
  id: number;
  plant: Plant;
  quantity: number;
  unitPrice: number;
  subtotal?: number;
}

export interface Order {
  id: number;
  client?: User;
  items: OrderItem[];
  status: OrderStatus;
  total: number;
  deliveryAddress: string;
  deliveryCity?: string;
  deliveryPhone?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface PlantSearchParams {
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  inStock?: boolean;
  page?: number;
  size?: number;
  sortBy?: string;
}

export interface DashboardStats {
  totalRevenue: number;
  revenueThisMonth: number;
  pendingOrders: number;
  totalClients: number;
  totalPlants: number;
  lowStockCount: number;
  topSellingPlants: { name: string; totalSold: number }[];
  dailySales: { date: string; revenue: number }[];
  lowStockPlants: { id: number; name: string; stock: number }[];
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "En attente",
  CONFIRMED: "Confirmée",
  SHIPPED: "Expédiée",
  DELIVERED: "Livrée",
  CANCELLED: "Annulée",
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: "warn",
  CONFIRMED: "info",
  SHIPPED: "primary",
  DELIVERED: "success",
  CANCELLED: "danger",
};
