// contexts/management/AdminContext/DashboardContext.tsx
// ✅ Example using the new API client for secure requests

'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { apiClient, ApiResponse } from '@/contexts/utils/apiClient';

export interface Employee {
  id: number;
  name: string;
  email: string;
  username: string;
  department: string;
  supervisor_name: string;
  supervisor_email: string | null;
  projectName: string;
  joining_date: string | null;
  position: string | null;
  resign_date: string | null;
  is_active: boolean;
}

export interface LeaveRecord {
  id: number;
  employee_name: string;
  employee_email: string;
  supervisor_email: string;
  from_date: string;
  to_date: string;
  total_days: number;
  reason: string;
  leave_type: string;
  approval_status: string;
  created_at: string;
}

interface DashboardContextType {
  employees: Employee[];
  loading: boolean;
  error: string | null;
  filterByProjects: (projects: string[]) => Promise<void>;
  employeeLeaves: { [email: string]: LeaveRecord[] };
  leavesLoading: { [email: string]: boolean };
  fetchEmployeeLeaves: (email: string) => Promise<void>;
  approveLeave: (leaveId: number, status: 'approved' | 'rejected') => Promise<boolean>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [employeeLeaves, setEmployeeLeaves] = useState<{ [email: string]: LeaveRecord[] }>({});
  const [leavesLoading, setLeavesLoading] = useState<{ [email: string]: boolean }>({});

  const filterByProjects = async (projects: string[]) => {
    setLoading(true);
    setError(null);

    try {
      // ✅ Using API client - automatically adds token
      const data = await apiClient.post<ApiResponse<{ employees: Employee[] }>>(
        '/django/management/filter-employees',
        { projects },
        { requiresAuth: true, userType: 'admin' }
      );

      if (data.success) {
        setEmployees(data.data?.employees || []);
      } else {
        setError(data.message || 'Failed to filter employees');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error occurred');
      console.error('Filter error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployeeLeaves = async (email: string): Promise<void> => {
    setLeavesLoading(prev => ({ ...prev, [email]: true }));
    
    try {
      // ✅ Using API client with authentication
      const result = await apiClient.post<ApiResponse<{ data: LeaveRecord[] }>>(
        '/django/management/leave-employee-email/',
        { employee_email: email },
        { requiresAuth: true, userType: 'admin' }
      );

      if (result.success) {
        setEmployeeLeaves(prev => ({
          ...prev,
          [email]: result.data?.data || []
        }));
      }
    } catch (err) {
      console.error('Fetch employee leaves error:', err);
      setEmployeeLeaves(prev => ({ ...prev, [email]: [] }));
    } finally {
      setLeavesLoading(prev => ({ ...prev, [email]: false }));
    }
  };

  const approveLeave = async (leaveId: number, status: 'approved' | 'rejected'): Promise<boolean> => {
    try {
      // ✅ Using API client with authentication
      const response = await apiClient.post<ApiResponse>(
        '/django/management/leave-update-status',
        { 
          leave_id: leaveId, 
          approval_status: status 
        },
        { requiresAuth: true, userType: 'admin' }
      );

      return response.success;
    } catch (err) {
      console.error('Leave approval error:', err);
      return false;
    }
  };

  return (
    <DashboardContext.Provider value={{
      employees,
      loading,
      error,
      filterByProjects,
      employeeLeaves,
      leavesLoading,
      fetchEmployeeLeaves,
      approveLeave,
    }}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) throw new Error('useDashboard must be used inside DashboardProvider');
  return context;
};