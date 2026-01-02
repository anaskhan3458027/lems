"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  username: string;
  department: string;
  supervisor_name: string | null;
  supervisor_email: string | null;
  projectName: string | null;
  joining_date: string | null;
  position: string | null;
  resign_date: string | null;
  is_active: boolean;
  last_login?: string;
  token?: string;
}

interface LoginContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithUserData: (userData: User) => void;
  logout: () => Promise<void>;
  isLoading: boolean;
  error: string;
  checkAuthStatus: () => Promise<boolean>;
}

interface ForgotPasswordContextType {
  sendOTP: (email: string, userType: string) => Promise<boolean>;
  verifyOTP: (email: string, otp: string, userType: string) => Promise<boolean>;
  resetPassword: (email: string, userType: string, newPassword: string, otp: string) => Promise<boolean>;
  isLoading: boolean;
  error: string;
  successMessage: string;
}

const LoginContext = createContext<LoginContextType | undefined>(undefined);
const ForgotPasswordContext = createContext<ForgotPasswordContextType | undefined>(undefined);

export const useLogin = () => {
  const context = useContext(LoginContext);
  if (!context) throw new Error('useLogin must be used within LoginProvider');
  return context;
};

export const useForgotPassword = () => {
  const context = useContext(ForgotPasswordContext);
  if (!context) throw new Error('useForgotPassword must be used within LoginProvider');
  return context;
};

export const LoginProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Forgot Password states
  const [fpLoading, setFpLoading] = useState(false);
  const [fpError, setFpError] = useState('');
  const [fpSuccess, setFpSuccess] = useState('');

  useEffect(() => {
    const initAuth = async () => {
      await checkAuthStatus();
      setIsCheckingAuth(false);
    };
    initAuth();
  }, []);

  const checkAuthStatus = async (): Promise<boolean> => {
  const token = localStorage.getItem('employeeAuthToken');

  if (!token) {
    setUser(null);
    return false;
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/django/management/status/employee`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    // Remove the check for data.is_active here
    if (response.ok && data.success) {
      const userData: User = {
        ...data.user,
        supervisor_email: data.user.supervisor_email ?? null,
        supervisor_name: data.user.supervisor_name ?? null,
        projectName: data.user.projectName ?? null,
        joining_date: data.user.joining_date ?? null,
        position: data.user.position ?? null,
        resign_date: data.user.resign_date ?? null,
        token,
        // Make sure is_active is properly set from the API response
        is_active: data.user.is_active ?? data.is_active ?? false,
      };
      setUser(userData);
      return true;
    } else {
      localStorage.removeItem('employeeAuthToken');
      setUser(null);
      return false;
    }
  } catch (err) {
    console.error('Auth check error:', err);
    localStorage.removeItem('employeeAuthToken');
    setUser(null);
    return false;
  }
};

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError('');

    try {
      if (!email || !password) {
        setError('Please fill in all fields');
        setIsLoading(false);
        return false;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError('Please enter a valid email address');
        setIsLoading(false);
        return false;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/django/management/login/employee`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const userData: User = {
          ...data.user,
          supervisor_email: data.user.supervisor_email ?? null,
          supervisor_name: data.user.supervisor_name ?? null,
          projectName: data.user.projectName ?? null,
          joining_date: data.user.joining_date ?? null,
          position: data.user.position ?? null,
          resign_date: data.user.resign_date ?? null,
          token: data.token,
        };

        setUser(userData);
        setError('');

        if (data.token) {
          localStorage.setItem('employeeAuthToken', data.token);
        }

        return true;
      } else {
        setError(data.message || 'Invalid credentials. Please try again.');
        return false;
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred during login. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithUserData = (userData: any) => {
    const completeUserData: User = {
      ...userData,
      supervisor_email: userData.supervisor_email ?? null,
      supervisor_name: userData.supervisor_name ?? null,
      projectName: userData.projectName ?? null,
      joining_date: userData.joining_date ?? null,
      position: userData.position ?? null,
      resign_date: userData.resign_date ?? null,
    };
    setUser(completeUserData);
    setError('');

    if (completeUserData.token) {
      localStorage.setItem('employeeAuthToken', completeUserData.token);
    }
  };

  const logout = async () => {
    setIsLoading(true);

    try {
      const token = localStorage.getItem('employeeAuthToken');

      if (token) {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/django/management/logout/employee`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (!response.ok) {
          console.error('Logout API error:', data.message);
        }
      }

      setUser(null);
      setError('');
      localStorage.removeItem('employeeAuthToken');
    } catch (err) {
      console.error('Logout error:', err);
      setUser(null);
      setError('');
      localStorage.removeItem('employeeAuthToken');
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot Password Functions
  const sendOTP = async (email: string, userType: string): Promise<boolean> => {
    setFpLoading(true);
    setFpError('');
    setFpSuccess('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/django/management/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, user_type: userType })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setFpSuccess(data.message);
        return true;
      } else {
        setFpError(data.message || 'Failed to send OTP');
        return false;
      }
    } catch (err) {
      console.error('Send OTP error:', err);
      setFpError('An error occurred. Please try again.');
      return false;
    } finally {
      setFpLoading(false);
    }
  };

  const verifyOTP = async (email: string, otp: string, userType: string): Promise<boolean> => {
    setFpLoading(true);
    setFpError('');
    setFpSuccess('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/django/management/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp, user_type: userType })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setFpSuccess(data.message);
        return true;
      } else {
        setFpError(data.message || 'Invalid OTP');
        return false;
      }
    } catch (err) {
      console.error('Verify OTP error:', err);
      setFpError('An error occurred. Please try again.');
      return false;
    } finally {
      setFpLoading(false);
    }
  };

  const resetPassword = async (email: string, userType: string, newPassword: string, otp: string): Promise<boolean> => {
    setFpLoading(true);
    setFpError('');
    setFpSuccess('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/django/management/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          user_type: userType, 
          new_password: newPassword,
          otp 
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setFpSuccess(data.message);
        return true;
      } else {
        setFpError(data.message || 'Failed to reset password');
        return false;
      }
    } catch (err) {
      console.error('Reset password error:', err);
      setFpError('An error occurred. Please try again.');
      return false;
    } finally {
      setFpLoading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-teal-50 to-cyan-50">
        <div className="text-center">
          <div className="inline-block">
            <svg
              className="animate-spin h-12 w-12 text-green-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <LoginContext.Provider
      value={{
        user,
        login,
        loginWithUserData,
        logout,
        isLoading,
        error,
        checkAuthStatus,
      }}
    >
      <ForgotPasswordContext.Provider value={{
        sendOTP,
        verifyOTP,
        resetPassword,
        isLoading: fpLoading,
        error: fpError,
        successMessage: fpSuccess
      }}>
        {children}
      </ForgotPasswordContext.Provider>
    </LoginContext.Provider>
  );
};