// app/services/api.ts

// Types
export interface Car {
  _id?: string;
  id ?: string;
  dealer: string | { _id?: string; id?: string; [key: string]: any };
  name: string;
  make: string;
  model: string;
  year: number;
  transmission: string;
  engineSize: string;
  condition: string;
  price: number;
  mileage: number;
  fuelType: string;
  bodyType: string;
  color: string;
  comfortFeatures: string[];
  safetyFeatures: string[];
  images: string[];
  status: string;
  createdAt?: string;
  updatedAt?: string;
}
  
export interface Dealer {
  _id: string; 
  id?: string; 
  name: string;
  email: string;
  phone: string;
  whatsapp: string; 
  location: {
    address: string;
    latitude: number;
    longitude: number;
    coordinates?: {
      type: string;
      coordinates: [number, number]; // [longitude, latitude]
    };
  };
  profileImage?: string;
}

// User Types
export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  profileImage?: string;
  token?: string;
}

export interface AuthResponse {
  _id: string;
  name: string;
  email: string;
  phone: string;
  profileImage?: string;
  token: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface UpdateProfileData {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface PaginatedCarResponse {
  totalCars: number;
  totalPages: number;
  cars: Car[];
  page: number;
  pages: number;
  total: number;
}

export interface PaginatedDealerResponse {
  dealers: Dealer[];
  page: number;
  pages: number;
  total: number;
}

export interface FavoriteResponse {
  message: string;
  isFavorited: boolean;
  carId: string;
}

export interface FavoriteCheckResponse {
  isFavorited: boolean;
  carId: string;
}

export interface FavoriteCountResponse {
  count: number;
}

export interface UserFavoritesResponse {
  favorites: Array<{
    _id: string;
    user: string;
    car: Car;
    createdAt: string;
  }>;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

// API base URL - replace with your actual API URL
const API_BASE_URL =  process.env.NEXT_PUBLIC_API_URL || 'https://68.183.72.73:5000';

// Token management
export const TokenManager = {
  getToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  },
  
  setToken: (token: string, remember: boolean = false): void => {
    if (typeof window !== 'undefined') {
      if (remember) {
        localStorage.setItem('token', token);
      } else {
        sessionStorage.setItem('token', token);
      }
    }
  },
  
  removeToken: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
    }
  },
  
  isTokenValid: (): boolean => {
    const token = TokenManager.getToken();
    if (!token) return false;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp > Date.now() / 1000;
    } catch {
      return false;
    }
  }
};

// Helper function for API requests
async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}/api${endpoint}`;
  
  const token = TokenManager.getToken();
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
    credentials: 'include',
    mode: 'cors'
  };
  
  try {
    console.log(`Fetching from URL: ${url}`);
    
    const response = await fetch(url, { ...defaultOptions, ...options });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error: ${response.status} - ${errorText}`);
      
      // If unauthorized, clear token
      if (response.status === 401) {
        TokenManager.removeToken();
      }
      
      return Promise.reject(`API error: ${response.status} - ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    return Promise.reject(error);
  }
}

// Authentication API functions
export async function registerUser(userData: RegisterData): Promise<AuthResponse> {
  return fetchApi<AuthResponse>('/users/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
}

export async function loginUser(credentials: LoginData): Promise<AuthResponse> {
  return fetchApi<AuthResponse>('/users/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}

export async function getUserProfile(): Promise<User> {
  return fetchApi<User>('/users/me');
}

export async function updateUserProfile(userData: UpdateProfileData): Promise<User> {
  return fetchApi<User>('/users/update-profile', {
    method: 'PUT',
    body: JSON.stringify(userData),
  });
}

export async function changePassword(passwordData: ChangePasswordData): Promise<{ message: string }> {
  return fetchApi<{ message: string }>('/users/change-password', {
    method: 'PUT',
    body: JSON.stringify(passwordData),
  });
}

export async function logoutUser(): Promise<{ message: string }> {
  const result = await fetchApi<{ message: string }>('/users/logout', {
    method: 'POST',
  });
  
  // Clear token from storage
  TokenManager.removeToken();
  
  return result;
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  return TokenManager.isTokenValid();
}

// Car API functions
export async function getAllCars(params?: Record<string, string | number>): Promise<PaginatedCarResponse> {
  let queryString = '';
  
  if (params && Object.keys(params).length > 0) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    queryString = `?${searchParams.toString()}`;
  }
  
  return fetchApi<PaginatedCarResponse>(`/cars${queryString}`);
}

// Helper function to sort cars by status if needed client-side
export function sortCarsByStatus(cars: Car[]): Car[] {
  const statusOrder: { [key: string]: number } = {
    "available": 1,
    "reserved": 2,
    "sold": 3
  };
  
  return [...cars].sort((a, b) => {
    const statusA = (a.status || "unknown").toLowerCase();
    const statusB = (b.status || "unknown").toLowerCase();
    
    // If status is not in our order mapping, it goes to the end
    const orderA = statusOrder[statusA] || 999;
    const orderB = statusOrder[statusB] || 999;
    
    return orderA - orderB;
  });
}

export async function getCarById(id: string): Promise<Car> {
  return fetchApi<Car>(`/cars/${id}`);
}

// Updated to match backend controller for getting cars by dealer
export async function getCarsByDealer(
  dealerId: string,
  params?: { page?: number; pageSize?: number; status?: string; sort?: string }
): Promise<PaginatedCarResponse> {
  if (!dealerId) {
    return Promise.reject('Dealer ID cannot be empty for getCarsByDealer');
  }
  const queryParams = new URLSearchParams();
  if (params) {
    if (params.page) queryParams.append('page', String(params.page));
    if (params.pageSize) queryParams.append('pageSize', String(params.pageSize));
    if (params.status) queryParams.append('status', String(params.status));
    if (params.sort) queryParams.append('sort', String(params.sort));
  }
  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
  return fetchApi<PaginatedCarResponse>(`/dealers/${dealerId}/cars${queryString}`);
}

export async function getAllDealers(params?: { page?: number; pageSize?: number }): Promise<PaginatedDealerResponse> {
  const searchParams = new URLSearchParams();
  if (params?.page) {
    searchParams.append('page', String(params.page));
  }
  if (params?.pageSize) {
    searchParams.append('pageSize', String(params.pageSize));
  }
  const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';
  return fetchApi<PaginatedDealerResponse>(`/dealers${queryString}`);
}

export async function getDealerById(id: string): Promise<Dealer> {
  if (!id) {
    return Promise.reject('Dealer ID cannot be empty');
  }
  return fetchApi<Dealer>(`/dealers/${id}`);
}

export async function toggleFavorite(carId: string): Promise<FavoriteResponse> {
  return fetchApi<FavoriteResponse>(`/favorites/toggle/${carId}`, {
    method: 'POST',
  });
}

export async function checkFavoriteStatus(carId: string): Promise<FavoriteCheckResponse> {
  return fetchApi<FavoriteCheckResponse>(`/favorites/check/${carId}`);
}

export async function getUserFavorites(page: number = 1, limit: number = 10): Promise<UserFavoritesResponse> {
  return fetchApi<UserFavoritesResponse>(`/favorites?page=${page}&limit=${limit}`);
}

export async function removeFavorite(carId: string): Promise<{ message: string; carId: string }> {
  return fetchApi<{ message: string; carId: string }>(`/favorites/${carId}`, {
    method: 'DELETE',
  });
}

export async function getFavoriteCount(): Promise<FavoriteCountResponse> {
  return fetchApi<FavoriteCountResponse>('/favorites/count');
}
// Search cars with filters matching backend expectations
export interface SearchFilters {
  make?: string;
  model?: string;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  transmission?: string;
  condition?: string;
  fuelType?: string;
  bodyType?: string;
  status?: string;
  sort?: string; // Added sort parameter
  page?: number;
  pageSize?: number;
}

export async function searchCars(searchQuery: string, fetchedCars: Car[], filters: SearchFilters): Promise<PaginatedCarResponse> {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  });
  const queryString = params.toString();
  console.log(`Searching cars with query: /cars?${queryString}`);
  return fetchApi<PaginatedCarResponse>(`/cars?${queryString}`);
}