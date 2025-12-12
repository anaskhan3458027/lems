// contexts/management/AdminContext/DashboardContext.tsx
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { apiClient } from '@/contexts/utils/apiClient';

/* ========= TYPES ========= */

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
  joining_date?: string;
  position?: string;
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

/* ========= API RESPONSE TYPES ========= */

interface FilterEmployeesResponse {
  success: boolean;
  count: number;
  projects: string[];
  employees: Employee[];
  message?: string;
}

interface LeaveByEmailResponse {
  message: string;
  total_leaves: number;
  data: LeaveRecord[];
}

/* ========= CONTEXT ========= */

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [employeeLeaves, setEmployeeLeaves] = useState<{ [email: string]: LeaveRecord[] }>({});
  const [leavesLoading, setLeavesLoading] = useState<{ [email: string]: boolean }>({});

  /* ===== Filter employees by projects ===== */

  const filterByProjects = async (projects: string[]) => {
    setLoading(true);
    setError(null);

    try {
      const data = await apiClient.post<FilterEmployeesResponse>(
        '/django/management/filter-employees',
        { projects },
        { requiresAuth: true, userType: 'admin' }
      );

      console.log('Filter employees API result:', data);

      if (data.success) {
        setEmployees(data.employees || []);
        console.log('Employees after setEmployees:', data.employees || []);
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

  /* ===== Fetch leaves for an employee (by email) ===== */

  const fetchEmployeeLeaves = async (email: string): Promise<void> => {
    setLeavesLoading(prev => ({ ...prev, [email]: true }));

    try {
      const result = await apiClient.post<LeaveByEmailResponse>(
        '/django/management/leave-employee-email',
        { employee_email: email },
        { requiresAuth: true, userType: 'admin' }
      );

      console.log('Leave records API result:', result);

      setEmployeeLeaves(prev => ({
        ...prev,
        [email]: result.data || [],
      }));
    } catch (err) {
      console.error('Fetch employee leaves error:', err);
      setEmployeeLeaves(prev => ({ ...prev, [email]: [] }));
    } finally {
      setLeavesLoading(prev => ({ ...prev, [email]: false }));
    }
  };

  /* ===== Approve / Reject leave ===== */

  const approveLeave = async (leaveId: number, status: 'approved' | 'rejected'): Promise<boolean> => {
    try {
      const response = await apiClient.post(
        '/django/management/leave-update-status',
        { 
          leave_id: leaveId, 
          approval_status: status,
        },
        { requiresAuth: true, userType: 'admin' }
      );

      // apiClient returns raw JSON; assume it has { success: boolean } or similar
      // If you want strict typing, define an interface like { success: boolean; message?: string }
      // and use apiClient.post<ThatType>(...)
      // @ts-ignore – if backend returns success
      return response.success ?? true;
    } catch (err) {
      console.error('Leave approval error:', err);
      return false;
    }
  };

  /* ===== PROVIDER VALUE ===== */

  return (
    <DashboardContext.Provider
      value={{
        employees,
        loading,
        error,
        filterByProjects,
        employeeLeaves,
        leavesLoading,
        fetchEmployeeLeaves,
        approveLeave,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) throw new Error('useDashboard must be used inside DashboardProvider');
  return context;
};
