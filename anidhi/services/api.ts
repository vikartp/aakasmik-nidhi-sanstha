import { storageService } from '../utils/tempStorage';

// Configuration for different environments
const isDevelopment = __DEV__;

// Production-ready API configuration
const DEVELOPMENT_API_URL = 'http://192.168.1.100:5000'; // Update with your IP
const PRODUCTION_API_URL = 'https://aakasmik-nidhi-backend.onrender.com';

// Use production server by default, can switch to local for development
const API_BASE_URL = PRODUCTION_API_URL;
// For local development, uncomment this line:
// const API_BASE_URL = isDevelopment ? DEVELOPMENT_API_URL : PRODUCTION_API_URL;

console.log(`🌐 API Base URL: ${API_BASE_URL}`);

interface LoginRequest {
  mobile: string;
  password: string;
}

interface LoginResponse {
  message: string;
  accessToken: string;
}

interface User {
  _id: string;
  mobile: string;
  name: string;
  fatherName: string;
  role: 'member' | 'admin' | 'superadmin';
  email?: string;
  occupation?: string;
  verified: boolean;
  createdAt: string;
}

interface Contribution {
  _id: string;
  userId: string;
  amount: number;
  verifiedBy: string;
  screenshotId?: string;
  contributionDate: string;
}

interface Screenshot {
  _id: string;
  userId: string;
  url: string;
  publicId: string;
  uploadedAt: string;
  uploadMonth: string;
  uploadYear: string;
  type: 'payment' | 'qrCode';
  verified: boolean;
  rejected?: string;
}

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private async getAuthHeaders() {
    const token = await storageService.getItem('accessToken');
    return {
      'Content-Type': 'application/json',
      // Optional: Add app identifier for additional security
      'X-App-Version': '1.0.0',
      'X-Platform': 'mobile',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async getFormDataHeaders() {
    const token = await storageService.getItem('accessToken');
    return {
      'Content-Type': 'multipart/form-data',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await fetch(`${this.baseURL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store the access token
      if (data.accessToken) {
        await storageService.setItem('accessToken', data.accessToken);
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      const headers = await this.getAuthHeaders();
      
      await fetch(`${this.baseURL}/auth/logout`, {
        method: 'POST',
        headers,
      });

      // Clear stored token
      await storageService.removeItem('accessToken');
      await storageService.removeItem('user');
    } catch (error) {
      console.error('Logout error:', error);
      // Clear local storage even if API call fails
      await storageService.removeItem('accessToken');
      await storageService.removeItem('user');
    }
  }

  async getUserProfile(): Promise<User> {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${this.baseURL}/users/me`, {
        method: 'GET',
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch user profile');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  async uploadScreenshot(file: {
    uri: string;
    type: string;
    name: string;
  }, userId: string, uploadMonth?: string): Promise<{ url: string }> {
    try {
      const formData = new FormData();
      
      // Append the file
      formData.append('screenshot', {
        uri: file.uri,
        type: file.type,
        name: file.name,
      } as any);
      
      formData.append('userId', userId);
      formData.append('type', 'payment');
      
      if (uploadMonth) {
        formData.append('uploadMonth', uploadMonth);
      }

      const token = await storageService.getItem('accessToken');
      
      const response = await fetch(`${this.baseURL}/screenshots/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Upload failed');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  async getScreenshots(userId: string, month?: string) {
    try {
      const headers = await this.getAuthHeaders();
      
      let url = `${this.baseURL}/screenshots`;
      if (userId && month) {
        url = `${this.baseURL}/screenshots/user/${userId}/month/${month}`;
      } else if (month) {
        url = `${this.baseURL}/screenshots/month/${month}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch screenshots');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  async getContributionsByUser(userId: string): Promise<Contribution[]> {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${this.baseURL}/contributions/${userId}`, {
        method: 'GET',
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch contributions');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  async getContributionsByYearAndMonth(year: number, month: string): Promise<Contribution[]> {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${this.baseURL}/contributions/year/${year}/month/${month}`, {
        method: 'GET',
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch contributions');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  // User Secret Management
  async getMySecret(): Promise<{ secret: string }> {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${this.baseURL}/users/my-secret`, {
        method: 'GET',
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch secret');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  async resetMySecret(): Promise<{ secret: string }> {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${this.baseURL}/users/reset-secret`, {
        method: 'GET',
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset secret');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }
}

export default new ApiService();
export type { LoginRequest, LoginResponse, User, Contribution, Screenshot };
