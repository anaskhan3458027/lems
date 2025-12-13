// lib/api.ts - Create this file for centralized API calls

interface RequestOptions extends RequestInit {
    requireAuth?: boolean;
    userType?: 'admin' | 'employee';
}

class APIClient {
    private baseURL: string;

    constructor() {
        this.baseURL = process.env.NEXT_PUBLIC_API_URL || '';
    }

    /**
     * Get appropriate auth token based on user type
     */
    private getToken(userType?: 'admin' | 'employee'): string | null {
        if (userType === 'admin') {
            return localStorage.getItem('adminAuthToken');
        } else if (userType === 'employee') {
            return localStorage.getItem('employeeAuthToken');
        }

        // Try both if not specified
        return localStorage.getItem('adminAuthToken') || localStorage.getItem('employeeAuthToken');
    }

    /**
     * Make authenticated API request
     */
    async request<T = any>(
        endpoint: string,
        options: RequestOptions = {}
    ): Promise<T> {
        const { requireAuth = true, userType, ...fetchOptions } = options;

        // Build headers
        // Build headers
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(fetchOptions.headers as Record<string, string> ?? {}),
        };

        // Add auth token if required
        if (requireAuth) {
            const token = this.getToken(userType);

            if (!token) {
                throw new Error('Authentication required. Please login.');
            }

            headers['Authorization'] = `Bearer ${token}`;
        }


        // Make request
        const response = await fetch(`${this.baseURL}${endpoint}`, {
            ...fetchOptions,
            headers,
        });

        // Handle response
        const data = await response.json();

        // Handle authentication errors
        if (response.status === 401) {
            // Token expired or invalid - clear storage and redirect
            if (userType === 'admin') {
                localStorage.removeItem('adminAuthToken');
                window.location.href = '/management/admin/login';
            } else if (userType === 'employee') {
                localStorage.removeItem('employeeAuthToken');
                window.location.href = '/management/employee/login';
            }

            throw new Error(data.message || 'Authentication failed');
        }

        if (!response.ok) {
            throw new Error(data.message || 'Request failed');
        }

        return data;
    }

    /**
     * GET request
     */
    async get<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
        return this.request<T>(endpoint, { ...options, method: 'GET' });
    }

    /**
     * POST request
     */
    async post<T = any>(
        endpoint: string,
        body?: any,
        options: RequestOptions = {}
    ): Promise<T> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'POST',
            body: JSON.stringify(body),
        });
    }

    /**
     * PUT request
     */
    async put<T = any>(
        endpoint: string,
        body?: any,
        options: RequestOptions = {}
    ): Promise<T> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'PUT',
            body: JSON.stringify(body),
        });
    }

    /**
     * DELETE request
     */
    async delete<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
        return this.request<T>(endpoint, { ...options, method: 'DELETE' });
    }
}

// Export singleton instance
export const api = new APIClient();

// Usage examples:

// 1. Admin endpoints
// await api.post('/django/management/filter-employees',
//   { projects: ['Project A'] },
//   { userType: 'admin' }
// );

// 2. Employee endpoints
// await api.post('/django/management/apply-leave',
//   leaveData,
//   { userType: 'employee' }
// );

// 3. Public endpoints (no auth)
// await api.post('/django/management/login',
//   { email, password },
//   { requireAuth: false }
// );