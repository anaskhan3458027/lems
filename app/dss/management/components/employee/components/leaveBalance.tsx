'use client';

import { useMemo, useState } from 'react';
import { Calendar, TrendingUp, AlertCircle, CheckCircle, XCircle, Info, ChevronRight } from 'lucide-react';

interface Leave {
  id: number;
  leave_type: string;
  from_date: string;
  to_date: string;
  total_days: number;
  approval_status: string;
  reason: string;
  created_at: string;
  supervisor_email: string;
  position?: string;
  joining_date?: string;
}

interface User {
  username: string;
  email: string;
  position?: string | null; 
  joining_date?: string | null;
  department?: string;
}

interface LeaveBalanceProps {
  user: User;
  leaves: Leave[];
}

// Leave calculation utility function - CALENDAR MONTH BASED
const calculateLeaveBalance = (user: User, leaves: Leave[]) => {
  if (!user.joining_date) {
    return null;
  }

  const joiningDate = new Date(user.joining_date);
  const today = new Date();
  
  // Get joining month/year
  const joiningYear = joiningDate.getFullYear();
  const joiningMonth = joiningDate.getMonth(); // 0-11
  
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  
  // Calculate total calendar months since joining (including current month)
  const monthsSinceJoining = (currentYear - joiningYear) * 12 + (currentMonth - joiningMonth) + 1;
  const yearsSinceJoining = Math.floor(monthsSinceJoining / 12);
  
  // CL per month based on position
  const clPerMonth = user.position === 'YP (Young Professional)' ? 1.5 : 2.5;
  
  // EL calculation (unchanged - based on joining date anniversary)
  const totalELPerYear = 8;
  const currentLeaveYearStart = new Date(joiningDate);
  currentLeaveYearStart.setFullYear(joiningDate.getFullYear() + yearsSinceJoining);
  
  const nextLeaveYearStart = new Date(currentLeaveYearStart);
  nextLeaveYearStart.setFullYear(currentLeaveYearStart.getFullYear() + 1);
  
  // Filter leaves by type and status
  const approvedLeaves = leaves.filter(leave => leave.approval_status === 'approved');
  const pendingLeaves = leaves.filter(leave => leave.approval_status === 'pending');
  
  // CL Calculation - Month by Month with Negative Carry
  let clBalance = 0;
  const clHistory: Array<{month: string, credit: number, used: number, balance: number}> = [];
  
  // Iterate through each calendar month from joining to current
  for (let i = 0; i < monthsSinceJoining; i++) {
    const monthDate = new Date(joiningYear, joiningMonth + i, 1);
    const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
    const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59);
    
    // Credit CL for this month
    clBalance += clPerMonth;
    
    // Find APPROVED CL leaves taken in this calendar month
    const clUsedThisMonth = approvedLeaves
      .filter(leave => {
        if (leave.leave_type !== 'CL' && leave.leave_type !== 'cl') return false;
        const leaveDate = new Date(leave.from_date);
        return leaveDate >= monthStart && leaveDate <= monthEnd;
      })
      .reduce((sum, leave) => sum + (leave.total_days || 0), 0);
    
    // Deduct approved CL
    clBalance -= clUsedThisMonth;
    
    // Store month history
    clHistory.push({
      month: monthDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
      credit: clPerMonth,
      used: clUsedThisMonth,
      balance: clBalance
    });
  }
  
  // Total CL accumulated and used
  const totalCLAccumulated = monthsSinceJoining * clPerMonth;
  const usedCL = approvedLeaves
    .filter(leave => leave.leave_type === 'CL' || leave.leave_type === 'cl')
    .reduce((sum, leave) => sum + (leave.total_days || 0), 0);
  
  // Current CL balance (can be negative)
  const remainingCL = clBalance;
  
  // Pending CL (not deducted yet)
  const pendingCL = pendingLeaves
    .filter(leave => leave.leave_type === 'CL' || leave.leave_type === 'cl')
    .reduce((sum, leave) => sum + (leave.total_days || 0), 0);
  
  // EL Calculation (unchanged)
  const elLeaves = approvedLeaves.filter(leave => 
    leave.leave_type === 'EL' || leave.leave_type === 'el'
  );
  
  const usedELThisYear = elLeaves
    .filter(leave => {
      const leaveDate = new Date(leave.from_date);
      return leaveDate >= currentLeaveYearStart && leaveDate < nextLeaveYearStart;
    })
    .reduce((sum, leave) => sum + (leave.total_days || 0), 0);
  
  const remainingEL = Math.max(0, totalELPerYear - usedELThisYear);
  
  const pendingEL = pendingLeaves
    .filter(leave => leave.leave_type === 'EL' || leave.leave_type === 'el')
    .reduce((sum, leave) => sum + (leave.total_days || 0), 0);
  
  return {
    cl: {
      perMonth: clPerMonth,
      accumulated: totalCLAccumulated,
      used: usedCL,
      remaining: remainingCL, // Can be negative
      pending: pendingCL,
      history: clHistory.slice(-6) // Last 6 months history
    },
    el: {
      perYear: totalELPerYear,
      used: usedELThisYear,
      remaining: remainingEL,
      pending: pendingEL,
      yearStart: currentLeaveYearStart,
      yearEnd: nextLeaveYearStart
    },
    monthsSinceJoining,
    yearsSinceJoining
  };
};

export default function LeaveBalanceCalculator({ user, leaves }: LeaveBalanceProps) {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  
  const leaveBalance = useMemo(() => {
    return calculateLeaveBalance(user, leaves);
  }, [user, leaves]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!leaveBalance) {
    return (
      <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
        <AlertCircle className="w-5 h-5" />
        <span>Joining date not available. Cannot calculate leave balance.</span>
      </div>
    );
  }

  const clPercentage = Math.max(0, Math.min(100, (leaveBalance.cl.remaining / leaveBalance.cl.accumulated) * 100));
  const elPercentage = (leaveBalance.el.remaining / leaveBalance.el.perYear) * 100;
  
  // Check if CL is negative
  const isNegativeCL = leaveBalance.cl.remaining < 0;

  return (
    <div className="space-y-6">
      {/* Header with Tenure Info */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <Calendar className="w-8 h-8" />
              Leave Balance Summary
            </h2>
            <p className="text-indigo-100 text-sm">
              Tenure: {leaveBalance.monthsSinceJoining} months ({leaveBalance.yearsSinceJoining} year{leaveBalance.yearsSinceJoining !== 1 ? 's' : ''})
            </p>
          </div>
          <div className="text-right">
            <p className="text-indigo-200 text-sm">As of</p>
            <p className="text-xl font-bold">{formatDate(new Date())}</p>
          </div>
        </div>
      </div>

      {/* Main Leave Cards - Calendar Style */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CL Card */}
        <div 
          className="relative bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-blue-100 hover:border-blue-300 transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-1"
          onMouseEnter={() => setHoveredCard('cl')}
          onMouseLeave={() => setHoveredCard(null)}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <Calendar className="w-6 h-6" />
                Casual Leave (CL)
              </h3>
              <div className="relative group">
                <Info className="w-5 h-5 cursor-help opacity-70 hover:opacity-100 transition-opacity" />
                <div className="absolute right-0 top-8 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <p className="font-bold mb-1">CL Rules (Calendar Month Based):</p>
                  <ul className="space-y-1 text-gray-200">
                    <li>• {leaveBalance.cl.perMonth} days per calendar month</li>
                    <li>• Credited on 1st of each month</li>
                    <li>• Carries forward indefinitely</li>
                    <li>• Can go negative (recovers monthly)</li>
                    <li>• Pending leaves not deducted yet</li>
                  </ul>
                </div>
              </div>
            </div>
            <p className="text-blue-100 text-sm">
              {leaveBalance.cl.perMonth} days/calendar month • Accumulates & Carries Forward
              {user.position === 'YP (Young Professional)' && 
                <span className="ml-2 bg-orange-500 px-2 py-0.5 rounded-full text-xs font-bold">YP</span>
              }
            </p>
          </div>

          {/* Progress Circle */}
          <div className="p-8">
            <div className="flex items-center justify-center mb-6">
              <div className="relative w-48 h-48">
                <svg className="transform -rotate-90 w-48 h-48">
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="#E0E7FF"
                    strokeWidth="12"
                    fill="none"
                  />
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke={isNegativeCL ? "url(#clGradientNegative)" : "url(#clGradient)"}
                    strokeWidth="12"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 88}`}
                    strokeDashoffset={`${2 * Math.PI * 88 * (1 - clPercentage / 100)}`}
                    className="transition-all duration-1000"
                  />
                  <defs>
                    <linearGradient id="clGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#3B82F6" />
                      <stop offset="100%" stopColor="#06B6D4" />
                    </linearGradient>
                    <linearGradient id="clGradientNegative" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#DC2626" />
                      <stop offset="100%" stopColor="#EF4444" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className={`text-5xl font-bold ${isNegativeCL ? 'text-red-600' : 'text-blue-600'}`}>
                    {leaveBalance.cl.remaining.toFixed(1)}
                  </p>
                  <p className="text-gray-500 text-sm font-medium">days {isNegativeCL ? 'deficit' : 'left'}</p>
                  {isNegativeCL && (
                    <p className="text-xs text-red-500 mt-1 font-bold">Will recover</p>
                  )}
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-blue-50 rounded-xl p-3 text-center border border-blue-100">
                <p className="text-xs text-blue-600 font-medium mb-1">Accumulated</p>
                <p className="text-xl font-bold text-blue-700">{leaveBalance.cl.accumulated.toFixed(1)}</p>
              </div>
              <div className="bg-red-50 rounded-xl p-3 text-center border border-red-100">
                <p className="text-xs text-red-600 font-medium mb-1">Used</p>
                <p className="text-xl font-bold text-red-700">{leaveBalance.cl.used.toFixed(1)}</p>
              </div>
              <div className="bg-yellow-50 rounded-xl p-3 text-center border border-yellow-100">
                <p className="text-xs text-yellow-600 font-medium mb-1">Pending</p>
                <p className="text-xl font-bold text-yellow-700">{leaveBalance.cl.pending.toFixed(1)}</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Balance</span>
                <span>{clPercentage.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-1000 ${isNegativeCL ? 'bg-gradient-to-r from-red-500 to-red-600' : 'bg-gradient-to-r from-blue-500 to-cyan-500'}`}
                  style={{ width: `${clPercentage}%` }}
                />
              </div>
            </div>
            
            {isNegativeCL && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-xs text-red-800">
                  <strong>⚠️ Negative Balance:</strong> You have used more CL than accumulated. This will be recovered from future monthly credits ({leaveBalance.cl.perMonth} days/month).
                </p>
              </div>
            )}
          </div>

          {/* Hover Overlay */}
          {hoveredCard === 'cl' && (
            <div className="absolute inset-0 bg-blue-500 bg-opacity-95 flex items-center justify-center transition-all duration-300 animate-fadeIn">
              <div className="text-white text-center p-8">
                <CheckCircle className="w-16 h-16 mx-auto mb-4" />
                <h4 className="text-2xl font-bold mb-4">CL Balance Details</h4>
                <div className="space-y-2 text-left max-w-xs mx-auto">
                  <div className="flex justify-between">
                    <span>Monthly Credit:</span>
                    <span className="font-bold">{leaveBalance.cl.perMonth} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Accumulated:</span>
                    <span className="font-bold">{leaveBalance.cl.accumulated.toFixed(1)} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Leaves Used:</span>
                    <span className="font-bold">-{leaveBalance.cl.used.toFixed(1)} days</span>
                  </div>
                  <div className="flex justify-between border-t border-white/30 pt-2 mt-2">
                    <span className="font-bold">Available:</span>
                    <span className="font-bold text-xl">{leaveBalance.cl.remaining.toFixed(1)} days</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* EL Card */}
        <div 
          className="relative bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-green-100 hover:border-green-300 transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-1"
          onMouseEnter={() => setHoveredCard('el')}
          onMouseLeave={() => setHoveredCard(null)}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <TrendingUp className="w-6 h-6" />
                Earned Leave (EL)
              </h3>
              <div className="relative group">
                <Info className="w-5 h-5 cursor-help opacity-70 hover:opacity-100 transition-opacity" />
                <div className="absolute right-0 top-8 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <p className="font-bold mb-1">EL Rules:</p>
                  <ul className="space-y-1 text-gray-200">
                    <li>• 8 days per year</li>
                    <li>• Resets annually on joining date</li>
                    <li>• No carry forward</li>
                    <li>• Same for all positions</li>
                  </ul>
                  <p className="mt-2 text-yellow-300 font-semibold">
                    Use before: {formatDate(leaveBalance.el.yearEnd)}
                  </p>
                </div>
              </div>
            </div>
            <p className="text-green-100 text-sm">
              8 days/year • Resets Annually • No Carry Forward
            </p>
          </div>

          {/* Progress Circle */}
          <div className="p-8">
            <div className="flex items-center justify-center mb-6">
              <div className="relative w-48 h-48">
                <svg className="transform -rotate-90 w-48 h-48">
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="#DCFCE7"
                    strokeWidth="12"
                    fill="none"
                  />
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="url(#elGradient)"
                    strokeWidth="12"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 88}`}
                    strokeDashoffset={`${2 * Math.PI * 88 * (1 - elPercentage / 100)}`}
                    className="transition-all duration-1000"
                  />
                  <defs>
                    <linearGradient id="elGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#22C55E" />
                      <stop offset="100%" stopColor="#10B981" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-5xl font-bold text-green-600">{leaveBalance.el.remaining.toFixed(1)}</p>
                  <p className="text-gray-500 text-sm font-medium">days left</p>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-green-50 rounded-xl p-3 text-center border border-green-100">
                <p className="text-xs text-green-600 font-medium mb-1">Allocated</p>
                <p className="text-xl font-bold text-green-700">{leaveBalance.el.perYear}</p>
              </div>
              <div className="bg-red-50 rounded-xl p-3 text-center border border-red-100">
                <p className="text-xs text-red-600 font-medium mb-1">Used</p>
                <p className="text-xl font-bold text-red-700">{leaveBalance.el.used.toFixed(1)}</p>
              </div>
              <div className="bg-yellow-50 rounded-xl p-3 text-center border border-yellow-100">
                <p className="text-xs text-yellow-600 font-medium mb-1">Pending</p>
                <p className="text-xl font-bold text-yellow-700">{leaveBalance.el.pending.toFixed(1)}</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Balance</span>
                <span>{elPercentage.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${elPercentage}%` }}
                />
              </div>
            </div>

            {/* Leave Year Info */}
            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-xs text-amber-700 font-medium mb-1">Current Leave Year</p>
              <p className="text-sm font-bold text-amber-900">
                {formatDate(leaveBalance.el.yearStart)} - {formatDate(leaveBalance.el.yearEnd)}
              </p>
            </div>
          </div>

          {/* Hover Overlay */}
          {hoveredCard === 'el' && (
            <div className="absolute inset-0 bg-green-500 bg-opacity-95 flex items-center justify-center transition-all duration-300 animate-fadeIn">
              <div className="text-white text-center p-8">
                <CheckCircle className="w-16 h-16 mx-auto mb-4" />
                <h4 className="text-2xl font-bold mb-4">EL Balance Details</h4>
                <div className="space-y-2 text-left max-w-xs mx-auto">
                  <div className="flex justify-between">
                    <span>Yearly Allocation:</span>
                    <span className="font-bold">{leaveBalance.el.perYear} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Leaves Used:</span>
                    <span className="font-bold">-{leaveBalance.el.used.toFixed(1)} days</span>
                  </div>
                  <div className="flex justify-between border-t border-white/30 pt-2 mt-2">
                    <span className="font-bold">Available:</span>
                    <span className="font-bold text-xl">{leaveBalance.el.remaining.toFixed(1)} days</span>
                  </div>
                  <div className="bg-white/20 rounded p-2 mt-3">
                    <p className="text-xs">Resets on {formatDate(leaveBalance.el.yearEnd)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Monthly CL History Table */}
      <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-indigo-100">
        <h3 className="text-xl font-bold text-indigo-800 mb-4 flex items-center gap-2">
          <Calendar className="w-6 h-6" />
          Recent CL History (Last 6 Months)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-indigo-50 border-b-2 border-indigo-200">
                <th className="text-left p-3 font-bold text-indigo-900">Month</th>
                <th className="text-right p-3 font-bold text-indigo-900">Credit (+)</th>
                <th className="text-right p-3 font-bold text-indigo-900">Used (-)</th>
                <th className="text-right p-3 font-bold text-indigo-900">Balance</th>
              </tr>
            </thead>
            <tbody>
              {leaveBalance.cl.history.map((month, idx) => (
                <tr key={idx} className="border-b border-gray-100 hover:bg-blue-50 transition-colors">
                  <td className="p-3 font-medium text-gray-800">{month.month}</td>
                  <td className="p-3 text-right text-green-600 font-bold">+{month.credit.toFixed(1)}</td>
                  <td className="p-3 text-right text-red-600 font-bold">
                    {month.used > 0 ? `-${month.used.toFixed(1)}` : '0.0'}
                  </td>
                  <td className={`p-3 text-right font-bold text-lg ${month.balance < 0 ? 'text-red-600' : 'text-blue-600'}`}>
                    {month.balance.toFixed(1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-blue-800">
            <strong>Note:</strong> CL is credited on 1st of each calendar month (Jan, Feb, Mar...). Negative balances will be recovered from future months. Pending leaves are NOT deducted until approved.
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}

export { calculateLeaveBalance };