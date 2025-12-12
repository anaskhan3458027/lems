// utils/apiClient.ts
// ✅ Centralized API client with automatic token handling

interface RequestConfig extends RequestInit {
  requiresAuth?: boolean;
  userType?: 'admin' | 'employee';
}

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
  }

  /**
   * Get the appropriate auth token based on user type
   */
  private getAuthToken(userType?: 'admin' | 'employee'): string | null {
    if (userType === 'employee') {
      return localStorage.getItem('employeeAuthToken');
    }
    // Default to admin or check both
    return localStorage.getItem('adminAuthToken') || localStorage.getItem('employeeAuthToken');
  }

  /**
   * Make an authenticated API request
   */
  async request<T = any>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<T> {
    const {
      requiresAuth = true,
      userType,
      headers = {},
      ...restConfig
    } = config;

    // Build headers
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(headers as Record<string, string>),
    };

    // Add authentication token if required
    if (requiresAuth) {
      const token = this.getAuthToken(userType);
      
      if (!token) {
        throw new Error('Authentication required. Please login.');
      }

      requestHeaders['Authorization'] = `Bearer ${token}`;
    }

    // Make the request
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...restConfig,
        headers: requestHeaders,
      });

      // Handle authentication errors
      if (response.status === 401) {
        // Clear tokens
        localStorage.removeItem('adminAuthToken');
        localStorage.removeItem('employeeAuthToken');
        
        // Redirect to login
        if (typeof window !== 'undefined') {
          const currentPath = window.location.pathname;
          if (currentPath.includes('/employee')) {
            window.location.href = '/dss/management/employee/login';
          } else {
            window.location.href = '/dss/management/admin/login';
          }
        }
        
        throw new Error('Session expired. Please login again.');
      }

      // Parse response
      const data = await response.json();

      // Check for API-level errors
      if (!response.ok) {
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }

      return data as T;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  /**
   * Convenience methods
   */
  async get<T = any>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  async post<T = any>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T = any>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T = any>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }

  /**
   * Upload files with authentication
   */
  async upload<T = any>(
    endpoint: string,
    formData: FormData,
    config?: Omit<RequestConfig, 'headers'>
  ): Promise<T> {
    const { requiresAuth = true, userType, ...restConfig } = config || {};

    const requestHeaders: Record<string, string> = {};

    if (requiresAuth) {
      const token = this.getAuthToken(userType);
      if (!token) {
        throw new Error('Authentication required. Please login.');
      }
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }

    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...restConfig,
        method: 'POST',
        headers: requestHeaders,
        body: formData,
      });

      if (response.status === 401) {
        localStorage.removeItem('adminAuthToken');
        localStorage.removeItem('employeeAuthToken');
        
        if (typeof window !== 'undefined') {
          window.location.href = '/dss/management/admin/login';
        }
        
        throw new Error('Session expired. Please login again.');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Upload failed with status ${response.status}`);
      }

      return data as T;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Upload error occurred');
    }
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export type for responses
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}