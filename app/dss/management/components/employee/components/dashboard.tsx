// components/management/employee/components/dashboard.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Building2,
  Briefcase,
  UserCheck,
  LogOut,
  Activity,
  Clock as ClockIcon,
  Shield,
  AlertCircle,
  Calendar,
  FileText,
  X,
  RefreshCw,
  CalendarDays,
  Briefcase as BriefcaseIcon,
  TrendingUp,
  Home,
  UserCog,
  History,
  PlusCircle,
} from 'lucide-react';
import { useLogin } from '@/contexts/management/EmployeeContext/LoginContext';
import { useLeave } from '@/contexts/management/EmployeeContext/ApplyLeaveContext';
import LeaveRequestForm from './applyleave';
import LeaveBalanceCalculator from './leaveBalance';

type Section = 'home' | 'apply-leave' | 'leave-balance' | 'leave-history' | 'profile' | 'project';

export default function EmployeeDashboard() {
  const { user, logout, isLoading } = useLogin();
  const { leaves, totalLeaves, loadingLeaves, fetchLeaves } = useLeave();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [activeSection, setActiveSection] = useState<Section>('home');
  const [isRefreshing, setIsRefreshing] = useState(false);

  if (!user) {
    return null;
  }

  useEffect(() => {
    if ((activeSection === 'leave-history' || activeSection === 'leave-balance') && user?.email) {
      handleRefreshLeaves();
    }
  }, [activeSection]);

  const handleRefreshLeaves = async () => {
    if (!user?.email) return;

    setIsRefreshing(true);
    try {
      await fetchLeaves();
    } catch (error) {
      console.error('Error refreshing leaves:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setShowLogoutConfirm(false);
  };

  const formatLastLogin = (timestamp?: string) => {
    if (!timestamp) return 'Recently';
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  const toCamelCase = (str?: string) => {
    if (!str) return "N/A";
    return str
      .toLowerCase()
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };


  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const supervisorEmail = user.supervisor_email || 'Not Assigned';
  const supervisorName = user.supervisor_name || 'Not Assigned';

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-cyan-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-md border-b-2 border-green-500 sticky top-0 z-50">
        <div className="max-w-full mx-auto px-6">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                <User className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Employee Dashboard</h1>
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  Welcome, <span className="font-semibold text-green-600">{user.username}</span>
                  {user.is_active && (
                    <span className="flex items-center gap-1 text-green-600">
                      <Activity className="w-3 h-3" />
                      Active
                    </span>
                  )}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowLogoutConfirm(true)}
              disabled={isLoading}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Layout: 30-70 Split */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Panel - 30% */}
        <div className="w-[30%] bg-white shadow-lg overflow-y-auto border-r-2 border-green-200">
          <div className="p-4 space-y-2">
            {/* Home Section */}
            <button
              onClick={() => setActiveSection('home')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all transform hover:scale-[1.02] ${activeSection === 'home'
                  ? 'bg-gradient-to-r from-green-500 to-teal-600 text-white shadow-lg'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
            >
              <Home className="w-5 h-5 flex-shrink-0" />
              <div className="text-left flex-1 min-w-0">
                <p className="font-semibold truncate">Dashboard Home</p>
                <p className={`text-xs truncate ${activeSection === 'home' ? 'text-green-100' : 'text-gray-500'}`}>
                  Overview & Stats
                </p>
              </div>
            </button>

            {/* Apply Leave Section */}
            <button
              onClick={() => {
                setActiveSection('apply-leave');
                setShowLeaveForm(true);
              }}
              disabled={!user.supervisor_email}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all transform hover:scale-[1.02] ${activeSection === 'apply-leave'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
              title={!user.supervisor_email ? 'No supervisor assigned' : 'Apply for leave'}
            >
              <PlusCircle className="w-5 h-5 flex-shrink-0" />
              <div className="text-left flex-1 min-w-0">
                <p className="font-semibold truncate">Apply for Leave</p>
                <p className={`text-xs truncate ${activeSection === 'apply-leave' ? 'text-purple-100' : 'text-gray-500'}`}>
                  Submit New Request
                </p>
              </div>
            </button>

            {/* Leave Balance Section */}
            <button
              onClick={() => setActiveSection('leave-balance')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all transform hover:scale-[1.02] ${activeSection === 'leave-balance'
                  ? 'bg-gradient-to-r from-indigo-500 to-blue-600 text-white shadow-lg'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
            >
              <TrendingUp className="w-5 h-5 flex-shrink-0" />
              <div className="text-left flex-1 min-w-0">
                <p className="font-semibold truncate">Leave Balance</p>
                <p className={`text-xs truncate ${activeSection === 'leave-balance' ? 'text-blue-100' : 'text-gray-500'}`}>
                  CL, EL, HD, LWP
                </p>
              </div>
            </button>

            {/* Leave History Section */}
            <button
              onClick={() => setActiveSection('leave-history')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all transform hover:scale-[1.02] ${activeSection === 'leave-history'
                  ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
            >
              <History className="w-5 h-5 flex-shrink-0" />
              <div className="text-left flex-1 min-w-0">
                <p className="font-semibold truncate">Leave History</p>
                <p className={`text-xs truncate ${activeSection === 'leave-history' ? 'text-purple-100' : 'text-gray-500'}`}>
                  {totalLeaves} Total Requests
                </p>
              </div>
            </button>


          </div>
        </div>

        {/* Right Panel - 70% */}
        <div className="w-[70%] bg-gradient-to-br from-green-50/50 via-teal-50/50 to-cyan-50/50 overflow-y-auto">
          <div className="p-6">
            {/* HOME SECTION */}
            {activeSection === 'home' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                    <Home className="w-7 h-7 text-green-500" />
                    Dashboard Overview
                  </h2>
                  <p className="text-sm text-gray-500">Welcome to your employee dashboard</p>
                </div>

                {/* Active Status Banner */}
                {user.is_active && (
                  <div className="bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-xl shadow-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-lg">
                          <Shield className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-bold text-lg">Your session is active</p>
                          <p className="text-sm text-green-50 flex items-center gap-1">
                            <ClockIcon className="w-4 h-4" />
                            Last login: {formatLastLogin(user.last_login)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg">
                        <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
                        <span className="font-medium">Online</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Statistics Cards - Grid with 6 cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Total Leaves Card */}
                  {/* <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500 transform hover:scale-105 transition-all hover:shadow-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-500 text-sm font-medium mb-1">Leave Requests</p>
                        <p className="text-3xl font-bold text-purple-600">{totalLeaves}</p>
                      </div>
                      <div className="bg-purple-100 p-3 rounded-lg flex-shrink-0">
                        <FileText className="w-8 h-8 text-purple-500" />
                      </div>
                    </div>
                  </div> */}

                  {/* Leave Balance Card */}
                  {/* <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-indigo-500 transform hover:scale-105 transition-all hover:shadow-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-500 text-sm font-medium mb-1">Leave Balance</p>
                        <p className="text-3xl font-bold text-indigo-600">
                          {user.joining_date ? '📊' : 'N/A'}
                        </p>
                      </div>
                      <div className="bg-indigo-100 p-3 rounded-lg flex-shrink-0">
                        <TrendingUp className="w-8 h-8 text-indigo-500" />
                      </div>
                    </div>
                  </div> */}

                  {/* Email Card */}
                  {/* <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500 transform hover:scale-105 transition-all hover:shadow-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-500 text-sm font-medium mb-1">Email</p>
                        <p className="text-sm font-bold text-gray-800 truncate">{user.email}</p>
                      </div>
                      <div className="bg-green-100 p-3 rounded-lg flex-shrink-0">
                        <Mail className="w-8 h-8 text-green-500" />
                      </div>
                    </div>
                  </div> */}

                  {/* Department Card */}
                  {/* <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-teal-500 transform hover:scale-105 transition-all hover:shadow-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-500 text-sm font-medium mb-1">Department</p>
                        <p className="text-sm font-bold text-gray-800 capitalize truncate">
                          {user.department || 'N/A'}
                        </p>
                      </div>
                      <div className="bg-teal-100 p-3 rounded-lg flex-shrink-0">
                        <Building2 className="w-8 h-8 text-teal-500" />
                      </div>
                    </div>
                  </div> */}

                  {/* Position Card */}
                  {/* <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500 transform hover:scale-105 transition-all hover:shadow-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-500 text-sm font-medium mb-1">Position</p>
                        <p className="text-sm font-bold text-gray-800 truncate">
                          {user.position || 'N/A'}
                        </p>
                      </div>
                      <div className="bg-blue-100 p-3 rounded-lg flex-shrink-0">
                        <BriefcaseIcon className="w-8 h-8 text-blue-500" />
                      </div>
                    </div>
                  </div> */}

                  {/* Joining Date Card */}
                  {/* <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500 transform hover:scale-105 transition-all hover:shadow-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-500 text-sm font-medium mb-1">Joined On</p>
                        <p className="text-sm font-bold text-gray-800">
                          {user.joining_date ? formatDate(user.joining_date) : 'N/A'}
                        </p>
                      </div>
                      <div className="bg-orange-100 p-3 rounded-lg flex-shrink-0">
                        <CalendarDays className="w-8 h-8 text-orange-500" />
                      </div>
                    </div>
                  </div> */}
                </div>

                {/* Quick Actions */}
                {/* <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={() => {
                        setActiveSection('apply-leave');
                        setShowLeaveForm(true);
                      }}
                      disabled={!user.supervisor_email}
                      className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:shadow-lg transition text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center shadow-lg">
                          <Calendar className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">Apply for Leave</p>
                          <p className="text-sm text-gray-500">Submit a new request</p>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => setActiveSection('leave-balance')}
                      className="p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:shadow-lg transition text-left group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-blue-500 rounded-lg flex items-center justify-center shadow-lg">
                          <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">Check Balance</p>
                          <p className="text-sm text-gray-500">View leave balance</p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div> */}

                {/* User Information Section */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <User className="w-6 h-6 text-green-500" />
                    My Profile
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-500 font-medium mb-1">Full Name</p>
                      <p className="text-lg font-semibold text-gray-800">
                        {toCamelCase(user.name || user.username)}
                      </p>
                    </div>

                    {/* <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-500 font-medium mb-1">Username</p>
                      <p className="text-lg font-semibold text-gray-800">
                        {user.username || 'N/A'}
                      </p>
                    </div> */}
                    <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-500 font-medium mb-1">Email Address</p>
                      <p className="text-lg font-semibold text-gray-800 break-all">
                        {user.email || 'N/A'}
                      </p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-500 font-medium mb-1">Department</p>
                      <p className="text-lg font-semibold text-gray-800 capitalize">
                        {user.department || 'N/A'}
                      </p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-500 font-medium mb-1">Position</p>
                      <p className="text-lg font-semibold text-gray-800">
                        {user.position || 'N/A'}
                      </p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-500 font-medium mb-1">Joining Date</p>
                      <p className="text-lg font-semibold text-gray-800">
                        {user.joining_date ? formatDate(user.joining_date) : 'N/A'}
                      </p>
                    </div>
                    {user.resign_date && (
                      <div className="p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-lg border border-red-200">
                        <p className="text-sm text-red-500 font-medium mb-1">Resign Date</p>
                        <p className="text-lg font-semibold text-red-800">
                          {formatDate(user.resign_date)}
                        </p>
                      </div>
                    )}
                    <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-500 font-medium mb-1">Supervisor</p>
                      <p className="text-lg font-semibold text-gray-800 break-all">
                        {supervisorName}
                      </p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-500 font-medium mb-1">Supervisor Email</p>
                      <p className="text-lg font-semibold text-gray-800 break-all">
                        {supervisorEmail}
                      </p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-500 font-medium mb-1">Account Status</p>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full ${user.is_active ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                            }`}
                        ></div>
                        <p
                          className={`text-lg font-semibold ${user.is_active ? 'text-green-600' : 'text-red-600'
                            }`}
                        >
                          {user.is_active ? 'Active' : 'Inactive'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Current Project Section */}
                {user.projectName ? (
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <Briefcase className="w-6 h-6 text-teal-500" />
                      Current Project
                    </h2>
                    <div className="p-6 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:shadow-lg transition-all transform hover:scale-[1.02] bg-gradient-to-br from-green-50 to-teal-50">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg">
                          <Briefcase className="w-8 h-8 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-gray-800 mb-2">
                            {user.projectName}
                          </h3>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="inline-block w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                            <p className="text-green-600 font-semibold">Active Project</p>
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <UserCheck className="w-4 h-4" />
                              <span>
                                Supervised by{' '}
                                <span className="font-semibold break-all">
                                  {supervisorName} {supervisorEmail && `(${supervisorEmail})`}
                                </span>
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4" />
                              <span className="font-semibold capitalize">
                                {user.department}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                      <Briefcase className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      No Project Assigned
                    </h3>
                    <p className="text-sm text-gray-400 mt-2">
                      Contact your supervisor for project assignment.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* LEAVE BALANCE SECTION */}
            {activeSection === 'leave-balance' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                      <TrendingUp className="w-7 h-7 text-indigo-500" />
                      Leave Balance Calculator
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">View your leave balances for all types</p>
                  </div>
                  <button
                    onClick={handleRefreshLeaves}
                    disabled={isRefreshing || loadingLeaves}
                    className="p-2 hover:bg-indigo-50 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                    title="Refresh leave data"
                  >
                    <RefreshCw className={`w-5 h-5 text-indigo-500 ${isRefreshing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                  </button>
                </div>

                {loadingLeaves || isRefreshing ? (
                  <div className="flex items-center justify-center py-12 bg-white rounded-xl shadow-lg">
                    <div className="text-center">
                      <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-gray-500">Loading leave balance...</p>
                    </div>
                  </div>
                ) : (
                  <LeaveBalanceCalculator user={user} leaves={leaves} />
                )}
              </div>
            )}

            {/* LEAVE HISTORY SECTION */}
            {activeSection === 'leave-history' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                      <FileText className="w-7 h-7 text-purple-500" />
                      Leave History
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">All your leave requests</p>
                  </div>
                  <button
                    onClick={handleRefreshLeaves}
                    disabled={isRefreshing || loadingLeaves}
                    className="p-2 hover:bg-purple-50 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                    title="Refresh leave history"
                  >
                    <RefreshCw className={`w-5 h-5 text-purple-500 ${isRefreshing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                  </button>
                </div>

                {loadingLeaves || isRefreshing ? (
                  <div className="flex items-center justify-center py-12 bg-white rounded-xl shadow-lg">
                    <div className="text-center">
                      <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-gray-500">
                        {isRefreshing ? 'Refreshing leave records...' : 'Loading leave records...'}
                      </p>
                    </div>
                  </div>
                ) : leaves.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-500 mb-2">No leave requests found</h3>
                    <p className="text-gray-400">Your leave history will appear here once you submit requests.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {leaves.map((leave) => (
                      <div key={leave.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all hover:border-purple-300">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <div className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(leave.approval_status)}`}>
                              {leave.approval_status.toUpperCase()}
                            </div>
                            <h4 className="font-bold text-sm text-gray-800">{leave.leave_type}</h4>
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-3 mb-3 border border-blue-200">
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <p className="text-gray-500 font-medium mb-1 flex items-center gap-1">
                                <BriefcaseIcon className="w-3 h-3" />
                                Position
                              </p>
                              <p className="font-semibold text-blue-800">{leave.position || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 font-medium mb-1 flex items-center gap-1">
                                <CalendarDays className="w-3 h-3" />
                                Joined On
                              </p>
                              <p className="font-semibold text-blue-800">
                                {leave.joining_date ? formatDate(leave.joining_date) : 'N/A'}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3 text-xs">
                          <div>
                            <p className="text-gray-500 font-medium mb-1">Period</p>
                            <p className="font-semibold text-gray-800 text-sm">
                              {formatDate(leave.from_date)} - {formatDate(leave.to_date)}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500 font-medium mb-1">Days</p>
                            <p className="font-semibold text-purple-600">{leave.total_days}</p>
                          </div>
                        </div>

                        <div className="text-xs mb-2">
                          <p className="text-gray-500 font-medium mb-1">Reason</p>
                          <p className="text-gray-700 line-clamp-2 bg-gray-50 p-2 rounded">{leave.reason}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <p className="text-gray-500">Applied</p>
                            <p className="font-medium text-gray-800">{formatDate(leave.created_at)}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Supervisor</p>
                            <p className="text-gray-700 break-all text-[10px]">{leave.supervisor_email}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full transform transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">Confirm Logout</h3>
                <p className="text-sm text-gray-500">
                  Are you sure you want to log out?
                </p>
              </div>
            </div>
            <p className="text-gray-600 mb-6">
              Your account will be set to{' '}
              <span className="font-semibold text-red-600">inactive</span> and you'll
              need to log in again to access your dashboard.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-semibold hover:from-red-600 hover:to-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Logging out...
                  </>
                ) : (
                  <>
                    <LogOut className="w-4 h-4" />
                    Logout
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leave Application Modal */}
      {showLeaveForm && (
        <LeaveRequestForm onClose={() => {
          setShowLeaveForm(false);
          setActiveSection('home');
        }} />
      )}
    </div>
  );
}