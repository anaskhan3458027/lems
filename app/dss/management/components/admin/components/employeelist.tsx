'use client';

import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Mail, 
  Briefcase, 
  ChevronDown, 
  CheckCircle, 
  XCircle,
  Building2,
  CalendarDays,
  UserCheck,
  ChevronUp,
} from 'lucide-react';
import { useDashboard } from '@/contexts/management/AdminContext/DashboardContext';

import { calculateLeaveBalance } from '../../employee/components/leaveBalance';

export default function EmployeeList() {
  const { 
    employees, 
    loading, 
    error, 
    fetchEmployeeLeaves, 
    employeeLeaves, 
    leavesLoading,
    approveLeave 
  } = useDashboard();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedEmployee, setExpandedEmployee] = useState<string | null>(null);

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp =>
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (emp.position && emp.position.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [employees, searchTerm]);

  const toggleEmployeeLeaves = async (email: string) => {
    if (expandedEmployee === email) {
      setExpandedEmployee(null);
    } else {
      await fetchEmployeeLeaves(email);
      setExpandedEmployee(email);
    }
  };

  const handleApprove = async (leaveId: number, email: string, status: 'approved' | 'rejected') => {
    const success = await approveLeave(leaveId, status);
    if (success) {
      await fetchEmployeeLeaves(email);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-4 mb-4 flex items-center gap-3">
          <Users className="w-6 h-6 text-blue-600" />
          <div>
            <h1 className="text-xl font-bold text-gray-800">Employee Leave Management</h1>
            <p className="text-gray-500 text-sm">View leave balances and manage requests</p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Search */}
        <div className="bg-white rounded-lg shadow p-3 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name, email, position, or project..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border rounded outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Main Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading employees...</p>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-500 mb-2">No employees found</h3>
            <p className="text-gray-400">Try adjusting your search</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-blue-600 text-white">
                  <tr>
                    <th className="px-3 py-3 text-left font-semibold">Employee</th>
                    <th className="px-3 py-3 text-left font-semibold">Position</th>
                    <th className="px-3 py-3 text-left font-semibold">Department</th>
                    <th className="px-3 py-3 text-center font-semibold">EL Accumulated</th>
                    <th className="px-3 py-3 text-center font-semibold">EL Used</th>
                    <th className="px-3 py-3 text-center font-semibold">EL Pending</th>
                    <th className="px-3 py-3 text-center font-semibold">EL Remaining</th>
                    <th className="px-3 py-3 text-center font-semibold">CL Allocated</th>
                    <th className="px-3 py-3 text-center font-semibold">CL Used</th>
                    <th className="px-3 py-3 text-center font-semibold">CL Pending</th>
                    <th className="px-3 py-3 text-center font-semibold">CL Remaining</th>
                    <th className="px-3 py-3 text-center font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredEmployees.map((emp) => {
                    const leaves = employeeLeaves[emp.email] || [];
                    const balance = calculateLeaveBalance(emp, leaves);
                    const isExpanded = expandedEmployee === emp.email;

                    return (
                      <React.Fragment key={emp.id}>
                        {/* Employee Row */}
                        <tr className={`hover:bg-gray-50 ${isExpanded ? 'bg-blue-50' : ''}`}>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                                {emp.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-gray-900 truncate">{emp.name}</p>
                                <p className="text-xs text-gray-500 truncate">{emp.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-1">
                              <Briefcase className="w-3 h-3 text-blue-600 flex-shrink-0" />
                              <span className="text-gray-700 truncate">{emp.position || 'N/A'}</span>
                            </div>
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-1">
                              <Building2 className="w-3 h-3 text-gray-500 flex-shrink-0" />
                              <span className="text-gray-700 truncate capitalize">{emp.department}</span>
                            </div>
                          </td>
                          {balance ? (
                            <>
                              <td className="px-3 py-3 text-center font-medium text-blue-600">{balance.el.accumulated.toFixed(1)}</td>
                              <td className="px-3 py-3 text-center text-red-600 font-medium">{balance.el.used.toFixed(1)}</td>
                              <td className="px-3 py-3 text-center text-yellow-600 font-medium">{balance.el.pending.toFixed(1)}</td>
                              <td className={`px-3 py-3 text-center font-bold ${balance.el.remaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                {balance.el.remaining.toFixed(1)}
                              </td>
                              <td className="px-3 py-3 text-center font-medium text-blue-600">{balance.cl.perYear}</td>
                              <td className="px-3 py-3 text-center text-red-600 font-medium">{balance.cl.used.toFixed(1)}</td>
                              <td className="px-3 py-3 text-center text-yellow-600 font-medium">{balance.cl.pending.toFixed(1)}</td>
                              <td className="px-3 py-3 text-center text-green-600 font-bold">{balance.cl.remaining.toFixed(1)}</td>
                            </>
                          ) : (
                            <td colSpan={8} className="px-3 py-3 text-center text-gray-400 text-xs">No joining date</td>
                          )}
                          <td className="px-3 py-3 text-center">
                            <button
                              onClick={() => toggleEmployeeLeaves(emp.email)}
                              className={`px-3 py-1 rounded text-xs font-medium inline-flex items-center gap-1 ${
                                isExpanded
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                              }`}
                            >
                              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                              {isExpanded ? 'Hide' : 'View'}
                            </button>
                          </td>
                        </tr>

                        {/* Expanded Leave Requests Table */}
                        {isExpanded && (
                          <tr>
                            <td colSpan={12} className="bg-gray-50 p-4">
                              <div className="mb-3 flex items-center justify-between">
                                <h4 className="font-bold text-gray-800">
                                  Leave Requests ({leaves.length})
                                </h4>
                                {leavesLoading[emp.email] && (
                                  <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                )}
                              </div>
                              
                              {leaves.length === 0 ? (
                                <p className="text-gray-500 text-sm text-center py-4 bg-white rounded border">No leave requests</p>
                              ) : (
                                <div className="overflow-x-auto">
                                  <table className="w-full text-sm border bg-white">
                                    <thead className="bg-gray-200">
                                      <tr>
                                        <th className="px-3 py-2 text-left font-semibold">Type</th>
                                        <th className="px-3 py-2 text-left font-semibold">From Date</th>
                                        <th className="px-3 py-2 text-left font-semibold">To Date</th>
                                        <th className="px-3 py-2 text-center font-semibold">Days</th>
                                        <th className="px-3 py-2 text-left font-semibold">Reason</th>
                                        <th className="px-3 py-2 text-left font-semibold">Supervisor</th>
                                        <th className="px-3 py-2 text-center font-semibold">Status</th>
                                        <th className="px-3 py-2 text-left font-semibold">Applied On</th>
                                        <th className="px-3 py-2 text-center font-semibold">Actions</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                      {leaves.map((leave) => (
                                        <tr key={leave.id} className="hover:bg-gray-50">
                                          <td className="px-3 py-2 font-bold text-blue-700">{leave.leave_type}</td>
                                          <td className="px-3 py-2">{formatDate(leave.from_date)}</td>
                                          <td className="px-3 py-2">{formatDate(leave.to_date)}</td>
                                          <td className="px-3 py-2 text-center font-medium">{leave.total_days}</td>
                                          <td className="px-3 py-2 text-gray-700 max-w-xs truncate">{leave.reason}</td>
                                          <td className="px-3 py-2 text-xs text-gray-600 truncate max-w-xs">
                                            {leave.supervisor_email}
                                          </td>
                                          <td className="px-3 py-2 text-center">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                              leave.approval_status === 'approved'
                                                ? 'bg-green-100 text-green-700'
                                                : leave.approval_status === 'rejected'
                                                ? 'bg-red-100 text-red-700'
                                                : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                              {leave.approval_status.toUpperCase()}
                                            </span>
                                          </td>
                                          <td className="px-3 py-2 text-gray-600">{formatDate(leave.created_at)}</td>
                                          <td className="px-3 py-2">
                                            <div className="flex gap-1 justify-center">
                                              <button
                                                onClick={() => handleApprove(leave.id, emp.email, 'approved')}
                                                className={`p-1 rounded ${
                                                  leave.approval_status === 'approved'
                                                    ? 'bg-green-300 text-green-800 cursor-not-allowed'
                                                    : 'bg-green-500 hover:bg-green-600 text-white'
                                                }`}
                                                disabled={leavesLoading[emp.email] || leave.approval_status === 'approved'}
                                                title="Approve"
                                              >
                                                <CheckCircle className="w-4 h-4" />
                                              </button>
                                              <button
                                                onClick={() => handleApprove(leave.id, emp.email, 'rejected')}
                                                className={`p-1 rounded ${
                                                  leave.approval_status === 'rejected'
                                                    ? 'bg-red-300 text-red-800 cursor-not-allowed'
                                                    : 'bg-red-500 hover:bg-red-600 text-white'
                                                }`}
                                                disabled={leavesLoading[emp.email] || leave.approval_status === 'rejected'}
                                                title="Reject"
                                              >
                                                <XCircle className="w-4 h-4" />
                                              </button>
                                            </div>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}