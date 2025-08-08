/// app/services/api.ts

// Types
export interface Car {
  _id?: string;
  id?: string;
  dealer: string | { _id?: string; id?: string; [key: string]: any };
  user?: string | { _id?: string; id?: string; [key: string]: any };
  listerType?: 'dealer' | 'user';
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
      coordinates: [number, number];
    };
  };
  profileImage?: string;
}

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
  totalCars?: number;
  totalPages?: number;
  cars: Car[];
  page: number;
  pages: number;
  total: number;
  count?: number;
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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Utility function to generate SEO-friendly slug from car data
export function generateCarSlug(car: Car): string {
  const parts = [
    car.year?.toString() || '',
    car.make || '',
    car.model || ''
  ].filter(Boolean);
  
  const title = parts.join(' ').trim();
  
  if (!title) {
    return 'car-listing';
  }
  
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim()
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

// Utility function to generate full car URL with slug and ID
export function generateCarUrl(car: Car): string {
  const slug = generateCarSlug(car);
  const id = car._id || car.id || '';
  return `/cars/${slug}-${id}`;
}

// Utility function to extract ID from slug-id combination
export function extractIdFromSlug(slugWithId: string): string {
  // Find the last hyphen and extract everything after it as the ID
  const lastHyphenIndex = slugWithId.lastIndexOf('-');
  if (lastHyphenIndex === -1) {
    // If no hyphen found, assume the entire string is the ID (backward compatibility)
    return slugWithId;
  }
  
  const potentialId = slugWithId.substring(lastHyphenIndex + 1);
  
  // Validate that it looks like a MongoDB ObjectId (24 hex characters) or similar ID
  if (potentialId.length >= 12 && /^[a-f0-9]{12,}$/i.test(potentialId)) {
    return potentialId;
  }
  
  // If it doesn't look like an ID, return the whole string (backward compatibility)
  return slugWithId;
}

export const TokenManager = {
  getToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token') || sessionStorage.getItem('token');
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
  },
};

// Update the fetchApi function to handle FormData properly
async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}/api${endpoint}`;
  const token = TokenManager.getToken();

  // Handle FormData vs JSON differently
  const isFormData = options?.body instanceof FormData;
  
  const defaultHeaders: HeadersInit = {};
  
  // Only add Content-Type for non-FormData requests
  if (!isFormData) {
    defaultHeaders['Content-Type'] = 'application/json';
  }
  
  // Add authorization header if token exists
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const requestOptions: RequestInit = {
    method: options?.method || 'GET',
    headers: {
      ...defaultHeaders,
      ...options?.headers,
    },
    credentials: 'include',
    body: options?.body,
  };

  try {
    console.log(`Fetching from URL: ${url}`);
    const response = await fetch(url, requestOptions);

    if (!response.ok) {
      const errorText = await response.text();
      if (response.status === 401) TokenManager.removeToken();
      return Promise.reject(`API error: ${response.status} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    return Promise.reject(error);
  }
}

// Authentication
export const registerUser = (data: RegisterData) => fetchApi<AuthResponse>('/users/register', { method: 'POST', body: JSON.stringify(data) });
export const loginUser = (data: LoginData) => fetchApi<AuthResponse>('/users/login', { method: 'POST', body: JSON.stringify(data) });
export const getUserProfile = () => fetchApi<User>('/users/me');
export const updateUserProfile = (data: UpdateProfileData) => fetchApi<User>('/users/update-profile', { method: 'PUT', body: JSON.stringify(data) });
export const changePassword = (data: ChangePasswordData) => fetchApi<{ message: string }>('/users/change-password', { method: 'PUT', body: JSON.stringify(data) });
export const logoutUser = async () => {
  const result = await fetchApi<{ message: string }>('/users/logout', { method: 'POST' });
  TokenManager.removeToken();
  return result;
};
export const isAuthenticated = () => TokenManager.isTokenValid();

// User Management
export const getUsers = (params?: { page?: number; pageSize?: number }) => {
  const query = params ? `?${new URLSearchParams(params as any).toString()}` : '';
  return fetchApi<{ users: User[]; page: number; pages: number; total: number }>(`/users${query}`);
};

export const getUserById = (id: string) => {
  if (!id) return Promise.reject('User ID cannot be empty');
  return fetchApi<User>(`/users/${id}`);
};

// User Car Management
export const createUserCar = (data: FormData) => 
  fetchApi<Car>('/cars/create', { 
    method: 'POST', 
    body: data 
  });

export const getUserCars = (userId: string, params?: { page?: number; pageSize?: number; status?: string }) => {
  if (!userId) return Promise.reject('User ID cannot be empty');
  const query = params ? `?${new URLSearchParams(params as any).toString()}` : '';
  return fetchApi<PaginatedCarResponse>(`/users/${userId}/cars${query}`);
};

export const getMyCarListings = () => 
  fetchApi<{ cars: Car[]; count: number }>('/cars/my-listings');

export const updateUserCar = (carId: string, data: FormData) => 
  fetchApi<Car>(`/cars/${carId}`, { 
    method: 'PUT',
    body: data 
  });

export const deleteUserCar = (carId: string) => 
  fetchApi<{ message: string }>(`/cars/${carId}`, { method: 'DELETE' });

export const updateUserCarStatus = (carId: string, status: string) => 
  fetchApi<Car>(`/cars/${carId}/status`, { 
    method: 'PUT', 
    body: JSON.stringify({ status }) 
  });

// Cars
export const getAllCars = (params?: Record<string, string | number>) => {
  const query = params ? `?${new URLSearchParams(params as any).toString()}` : '';
  return fetchApi<PaginatedCarResponse>(`/cars${query}`);
};

export const getCarById = (id: string) => fetchApi<Car>(`/cars/${id}`);

export const getCarsByDealer = (dealerId: string, params?: { page?: number; pageSize?: number; status?: string; sort?: string }) => {
  if (!dealerId) return Promise.reject('Dealer ID cannot be empty');
  const query = params ? `?${new URLSearchParams(params as any).toString()}` : '';
  return fetchApi<PaginatedCarResponse>(`/dealers/${dealerId}/cars${query}`);
};

// Dealers
export const getAllDealers = (params?: { page?: number; pageSize?: number }) => {
  const query = params ? `?${new URLSearchParams(params as any).toString()}` : '';
  return fetchApi<PaginatedDealerResponse>(`/dealers${query}`);
};

export const getDealerById = (id: string) => {
  if (!id) return Promise.reject('Dealer ID cannot be empty');
  return fetchApi<Dealer>(`/dealers/${id}`);
};

// Favorites
export const toggleFavorite = (carId: string) => fetchApi<FavoriteResponse>(`/favorites/toggle/${carId}`, { method: 'POST' });
export const checkFavoriteStatus = (carId: string) => fetchApi<FavoriteCheckResponse>(`/favorites/check/${carId}`);
export const getUserFavorites = (page = 1, limit = 10) => fetchApi<UserFavoritesResponse>(`/favorites?page=${page}&limit=${limit}`);
export const removeFavorite = (carId: string) => fetchApi<{ message: string; carId: string }>(`/favorites/${carId}`, { method: 'DELETE' });
export const getFavoriteCount = () => fetchApi<FavoriteCountResponse>('/favorites/count');

// Search
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
  sort?: string;
  page?: number;
  pageSize?: number;
}

export const searchCars = (searchQuery: string, fetchedCars: Car[], filters: SearchFilters) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  });
  const query = params.toString();
  return fetchApi<PaginatedCarResponse>(`/cars?${query}`);
};

// Add this to your existing API service file
export async function getAllCarIds(): Promise<string[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/cars/ids`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch car IDs: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching car IDs:', error);
    throw error;
  }
}