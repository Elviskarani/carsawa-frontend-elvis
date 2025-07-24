/// app/services/api.ts

// Types
export interface Car {
  _id?: string;
  id?: string;
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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

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
  },
};

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}/api${endpoint}`;
  const token = TokenManager.getToken();

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };

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
