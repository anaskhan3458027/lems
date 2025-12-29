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
  FileText,
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
                    <th className="px-4 py-3 text-left font-semibold">Employee</th>
                    <th className="px-4 py-3 text-left font-semibold">Position</th>
                    <th className="px-4 py-3 text-left font-semibold">Department</th>
                    <th className="px-4 py-3 text-left font-semibold">Email</th>
                    <th className="px-4 py-3 text-center font-semibold">Joining Date</th>
                    <th className="px-4 py-3 text-center font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredEmployees.map((emp) => {
                    const leaves = employeeLeaves[emp.email] || [];
                    const balance = calculateLeaveBalance(emp, leaves);
                    const isExpanded = expandedEmployee === emp.email;
                    
                    // Check if there are any pending leave requests
                    const hasPendingLeaves = leaves.some(leave => leave.approval_status === 'pending');
                    const pendingCount = leaves.filter(leave => leave.approval_status === 'pending').length;

                    return (
                      <React.Fragment key={emp.id}>
                        {/* Employee Row */}
                        <tr className={`hover:bg-gray-50 ${isExpanded ? 'bg-blue-50' : ''}`}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                {emp.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-gray-900 truncate">{emp.name}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Briefcase className="w-4 h-4 text-blue-600 flex-shrink-0" />
                              <span className="text-gray-700 truncate">{emp.position || 'N/A'}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-gray-500 flex-shrink-0" />
                              <span className="text-gray-700 truncate capitalize">{emp.department}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-gray-500 flex-shrink-0" />
                              <span className="text-gray-600 truncate text-xs">{emp.email}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <CalendarDays className="w-4 h-4 text-gray-500 flex-shrink-0" />
                              <span className="text-gray-700 text-sm">
                                {emp.joining_date ? formatDate(emp.joining_date) : 'N/A'}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => toggleEmployeeLeaves(emp.email)}
                              className={`relative px-4 py-2 rounded-lg text-sm font-medium inline-flex items-center gap-2 transition-all ${
                                isExpanded
                                  ? 'bg-blue-600 text-white shadow-lg'
                                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                              }`}
                            >
                              {hasPendingLeaves && !isExpanded && (
                                <span className="absolute -top-1 -right-1 flex h-5 w-5">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 text-white text-xs items-center justify-center font-bold">
                                    {pendingCount}
                                  </span>
                                </span>
                              )}
                              {isExpanded ? (
                                <>
                                  <ChevronUp className="w-4 h-4" />
                                  Hide Leaves
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="w-4 h-4" />
                                  View Leaves
                                </>
                              )}
                            </button>
                          </td>
                        </tr>

                        {/* Expanded Leave Requests Section */}
                        {isExpanded && (
                          <tr>
                            <td colSpan={6} className="bg-gray-50 p-6">
                              <div className="mb-4 flex items-center justify-between">
                                <h4 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                                  <FileText className="w-5 h-5 text-blue-600" />
                                  Leave History ({leaves.length} total)
                                </h4>
                                {leavesLoading[emp.email] && (
                                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                )}
                              </div>

                              {/* Leave Balance Summary */}
                              {balance && (
                                <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                                  {/* CL Card */}
                                  <div className="bg-white border-2 border-blue-200 rounded-lg p-4">
                                    <p className="text-xs text-gray-500 font-medium mb-1">Casual Leave (CL)</p>
                                    <p className="text-2xl font-bold text-blue-600">{balance.cl.remaining.toFixed(1)}</p>
                                    <p className="text-xs text-gray-500 mt-1">Remaining of {balance.cl.perYear}</p>
                                  </div>
                                  
                                  {/* EL Card */}
                                  <div className="bg-white border-2 border-green-200 rounded-lg p-4">
                                    <p className="text-xs text-gray-500 font-medium mb-1">Earned Leave (EL)</p>
                                    <p className={`text-2xl font-bold ${balance.el.remaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                      {balance.el.remaining.toFixed(1)}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">Accumulated {balance.el.accumulated.toFixed(1)}</p>
                                  </div>
                                  
                                  {/* HalfDay Card */}
                                  <div className="bg-white border-2 border-orange-200 rounded-lg p-4">
                                    <p className="text-xs text-gray-500 font-medium mb-1">Half Day</p>
                                    <p className="text-2xl font-bold text-orange-600">{balance.halfDay.remaining.toFixed(1)}</p>
                                    <p className="text-xs text-gray-500 mt-1">Used {balance.halfDay.used.toFixed(1)}</p>
                                  </div>
                                  
                                  {/* LWP Card */}
                                  <div className="bg-white border-2 border-red-200 rounded-lg p-4">
                                    <p className="text-xs text-gray-500 font-medium mb-1">Leave Without Pay</p>
                                    <p className="text-2xl font-bold text-red-600">{balance.lwp.remaining.toFixed(1)}</p>
                                    <p className="text-xs text-gray-500 mt-1">Used {balance.lwp.used.toFixed(1)}</p>
                                  </div>
                                </div>
                              )}
                              
                              {/* Leave Requests Table */}
                              {leaves.length === 0 ? (
                                <div className="text-center py-8 bg-white rounded-lg border-2 border-gray-200">
                                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                  <p className="text-gray-500 font-medium">No leave requests</p>
                                </div>
                              ) : (
                                <div className="overflow-x-auto">
                                  <table className="w-full text-sm border bg-white rounded-lg overflow-hidden">
                                    <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                                      <tr>
                                        <th className="px-4 py-3 text-left font-semibold">Type</th>
                                        <th className="px-4 py-3 text-left font-semibold">From Date</th>
                                        <th className="px-4 py-3 text-left font-semibold">To Date</th>
                                        <th className="px-4 py-3 text-center font-semibold">Days</th>
                                        <th className="px-4 py-3 text-left font-semibold">Reason</th>
                                        <th className="px-4 py-3 text-center font-semibold">Status</th>
                                        <th className="px-4 py-3 text-left font-semibold">Applied On</th>
                                        <th className="px-4 py-3 text-center font-semibold">Actions</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                      {leaves.map((leave) => (
                                        <tr key={leave.id} className="hover:bg-blue-50 transition-colors">
                                          <td className="px-4 py-3">
                                            <span className={`font-bold px-3 py-1.5 rounded-full text-xs ${
                                              leave.leave_type === 'CL' || leave.leave_type === 'cl' 
                                                ? 'bg-blue-100 text-blue-700 border border-blue-300'
                                                : leave.leave_type === 'EL' || leave.leave_type === 'el'
                                                ? 'bg-green-100 text-green-700 border border-green-300'
                                                : leave.leave_type === 'HalfDay' || leave.leave_type === 'halfday'
                                                ? 'bg-orange-100 text-orange-700 border border-orange-300'
                                                : leave.leave_type === 'LWP' || leave.leave_type === 'lwp'
                                                ? 'bg-red-100 text-red-700 border border-red-300'
                                                : 'bg-gray-100 text-gray-700 border border-gray-300'
                                            }`}>
                                              {leave.leave_type}
                                            </span>
                                          </td>
                                          <td className="px-4 py-3 font-medium text-gray-700">{formatDate(leave.from_date)}</td>
                                          <td className="px-4 py-3 font-medium text-gray-700">{formatDate(leave.to_date)}</td>
                                          <td className="px-4 py-3 text-center">
                                            <span className="font-bold text-gray-900">{leave.total_days}</span>
                                          </td>
                                          <td className="px-4 py-3 text-gray-700 max-w-xs truncate">{leave.reason}</td>
                                          <td className="px-4 py-3 text-center">
                                            <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                                              leave.approval_status === 'approved'
                                                ? 'bg-green-100 text-green-700 border border-green-300'
                                                : leave.approval_status === 'rejected'
                                                ? 'bg-red-100 text-red-700 border border-red-300'
                                                : 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                                            }`}>
                                              {leave.approval_status.toUpperCase()}
                                            </span>
                                          </td>
                                          <td className="px-4 py-3 text-gray-600 font-medium">{formatDate(leave.created_at)}</td>
                                          <td className="px-4 py-3">
                                            <div className="flex gap-2 justify-center">
                                              <button
                                                onClick={() => handleApprove(leave.id, emp.email, 'approved')}
                                                className={`p-2 rounded-lg transition-all ${
                                                  leave.approval_status === 'approved'
                                                    ? 'bg-green-200 text-green-800 cursor-not-allowed'
                                                    : 'bg-green-500 hover:bg-green-600 text-white shadow-md hover:shadow-lg'
                                                }`}
                                                disabled={leavesLoading[emp.email] || leave.approval_status === 'approved'}
                                                title="Approve"
                                              >
                                                <CheckCircle className="w-5 h-5" />
                                              </button>
                                              <button
                                                onClick={() => handleApprove(leave.id, emp.email, 'rejected')}
                                                className={`p-2 rounded-lg transition-all ${
                                                  leave.approval_status === 'rejected'
                                                    ? 'bg-red-200 text-red-800 cursor-not-allowed'
                                                    : 'bg-red-500 hover:bg-red-600 text-white shadow-md hover:shadow-lg'
                                                }`}
                                                disabled={leavesLoading[emp.email] || leave.approval_status === 'rejected'}
                                                title="Reject"
                                              >
                                                <XCircle className="w-5 h-5" />
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