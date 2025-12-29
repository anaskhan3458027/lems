// admin/components/dashboard.tsx
'use client';

import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Building2, 
  Briefcase, 
  LogOut, 
  Home,
  Users,
  FolderOpen,
  Calendar,
  UserCog,
} from 'lucide-react';
import { useLogin } from '@/contexts/management/AdminContext/LoginContext';
import { useDashboard } from '@/contexts/management/AdminContext/DashboardContext';
import EmployeeList from './employeelist';

type Section = 'home' | 'employees' | 'projects' | 'profile';

export default function AdminDashboard() {
  const { user, logout } = useLogin();
  const { employees, loading, error, filterByProjects } = useDashboard();
  const [activeSection, setActiveSection] = useState<Section>('home');
  const [selectedProjectName, setSelectedProjectName] = useState('');

  if (!user) {
    return null;
  }

  const handleProjectClick = async (projectName: string) => {
    setSelectedProjectName(projectName);
    await filterByProjects([projectName]);
    setActiveSection('employees');
  };

  const handleNavClick = (section: Section) => {
    setActiveSection(section);
    if (section !== 'employees') {
      setSelectedProjectName('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-full mx-auto px-6">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Admin Dashboard</h1>
                <p className="text-sm text-gray-500">Welcome, {user?.name || user?.username}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition transform hover:scale-105 shadow-lg"
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
        <div className="w-[30%] bg-white shadow-lg overflow-y-auto border-r border-gray-200">
          <div className="p-4 space-y-2">
            {/* Home Section */}
            <button
              onClick={() => handleNavClick('home')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all transform hover:scale-[1.02] ${
                activeSection === 'home'
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Home className="w-5 h-5 flex-shrink-0" />
              <div className="text-left flex-1 min-w-0">
                <p className="font-semibold truncate">Dashboard Home</p>
                <p className={`text-xs truncate ${activeSection === 'home' ? 'text-blue-100' : 'text-gray-500'}`}>
                  Overview & Stats
                </p>
              </div>
            </button>

            {/* Projects Section */}
            <button
              onClick={() => handleNavClick('projects')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all transform hover:scale-[1.02] ${
                activeSection === 'projects'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <FolderOpen className="w-5 h-5 flex-shrink-0" />
              <div className="text-left flex-1 min-w-0">
                <p className="font-semibold truncate">Projects</p>
                <p className={`text-xs truncate ${activeSection === 'projects' ? 'text-purple-100' : 'text-gray-500'}`}>
                  {user?.projects?.length || 0} Total
                </p>
              </div>
            </button>

            {/* Divider */}
            <div className="border-t border-gray-300 my-4"></div>

            {/* Project List - Only show if we have projects */}
            {user?.projects && user.projects.length > 0 && (
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide px-4 mb-2">
                  Your Projects
                </p>
                <div className="space-y-1">
                  {user.projects.map((project: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => handleProjectClick(project)}
                      className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all transform hover:scale-[1.02] ${
                        activeSection === 'employees' && selectedProjectName === project
                          ? 'bg-gradient-to-r from-indigo-500 to-blue-600 text-white shadow-lg'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Briefcase className="w-4 h-4 flex-shrink-0" />
                      <div className="text-left flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{project}</p>
                        <p className={`text-xs truncate ${activeSection === 'employees' && selectedProjectName === project ? 'text-blue-100' : 'text-gray-500'}`}>
                          View Employees
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - 70% */}
        <div className="w-[70%] bg-gray-50 overflow-y-auto">
          <div className="p-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            {/* HOME SECTION */}
            {activeSection === 'home' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Home className="w-7 h-7 text-blue-500" />
                    Dashboard Overview
                  </h2>
                </div>

                {/* Statistics Cards */}
                {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500 transform hover:scale-105 transition">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-500 text-sm font-medium">Email</p>
                        <p className="text-lg font-bold text-gray-800 mt-1 break-all">{user?.email}</p>
                      </div>
                      <div className="bg-blue-100 p-3 rounded-lg flex-shrink-0">
                        <Mail className="w-8 h-8 text-blue-500" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500 transform hover:scale-105 transition">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-500 text-sm font-medium">Department</p>
                        <p className="text-lg font-bold text-gray-800 mt-1 truncate">{user?.department || 'N/A'}</p>
                      </div>
                      <div className="bg-purple-100 p-3 rounded-lg flex-shrink-0">
                        <Building2 className="w-8 h-8 text-purple-500" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-pink-500 transform hover:scale-105 transition">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-500 text-sm font-medium">Total Projects</p>
                        <p className="text-lg font-bold text-gray-800 mt-1">{user?.projects?.length || 0}</p>
                      </div>
                      <div className="bg-pink-100 p-3 rounded-lg flex-shrink-0">
                        <Briefcase className="w-8 h-8 text-pink-500" />
                      </div>
                    </div>
                  </div>
                </div> */}

                {/* Quick Actions */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={() => handleNavClick('projects')}
                      className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:shadow-lg transition text-left group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center shadow-lg">
                          <FolderOpen className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">View Projects</p>
                          <p className="text-sm text-gray-500">Browse all projects</p>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        if (user?.projects && user.projects.length > 0) {
                          handleProjectClick(user.projects[0]);
                        }
                      }}
                      disabled={!user?.projects || user.projects.length === 0}
                      className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:shadow-lg transition text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-teal-500 rounded-lg flex items-center justify-center shadow-lg">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">View Employees</p>
                          <p className="text-sm text-gray-500">Manage leave requests</p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* My Profile Section */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <User className="w-6 h-6 text-orange-500" />
                    My Profile
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-500 font-medium mb-1">Full Name</p>
                      <p className="text-lg font-semibold text-gray-800">{user?.name || 'N/A'}</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-500 font-medium mb-1">Username</p>
                      <p className="text-lg font-semibold text-gray-800">{user?.username || 'N/A'}</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-500 font-medium mb-1">Email Address</p>
                      <p className="text-lg font-semibold text-gray-800 break-all">{user?.email || 'N/A'}</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-500 font-medium mb-1">Department</p>
                      <p className="text-lg font-semibold text-gray-800">{user?.department || 'N/A'}</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200 md:col-span-2">
                      <p className="text-sm text-gray-500 font-medium mb-1">Role</p>
                      <p className="text-lg font-semibold text-gray-800">Administrator</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* EMPLOYEES SECTION */}
            {activeSection === 'employees' && (
              <div>
                <div className="mb-4">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Users className="w-7 h-7 text-green-500" />
                    {selectedProjectName ? `${selectedProjectName} - Employees` : 'All Employees'}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedProjectName ? `Employees working on ${selectedProjectName}` : 'Complete employee leave management'}
                  </p>
                </div>
                <EmployeeList />
              </div>
            )}

            {/* PROJECTS SECTION */}
            {activeSection === 'projects' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                    <Briefcase className="w-7 h-7 text-purple-500" />
                    Your Projects
                  </h2>
                  <p className="text-sm text-gray-500">Click on any project to view its employees</p>
                </div>

                {user?.projects && user.projects.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {user.projects.map((project: string, index: number) => (
                      <button
                        key={index}
                        onClick={() => handleProjectClick(project)}
                        className="bg-white p-6 border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:shadow-lg transition transform hover:scale-105 text-left group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-xl transition-shadow">
                            <Briefcase className="w-7 h-7 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-lg text-gray-800 truncate">{project}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                              <p className="text-sm text-gray-500">Click to view employees</p>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                      <Briefcase className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">No Projects Yet</h3>
                    <p className="text-gray-500">You don't have any projects assigned at the moment.</p>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}