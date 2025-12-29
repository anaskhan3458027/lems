// frontend/app/dss/management/components/employee/components/leaveBalance.tsx
'use client';

import { useMemo } from 'react';
import { Calendar, AlertCircle } from 'lucide-react';

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

const calculateLeaveBalance = (user: User, leaves: Leave[]) => {
  if (!user.joining_date) {
    return null;
  }

  const joiningDate = new Date(user.joining_date);
  const today = new Date();

  const joiningYear = joiningDate.getFullYear();
  const joiningMonth = joiningDate.getMonth();

  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  const monthsSinceJoining =
    (currentYear - joiningYear) * 12 + (currentMonth - joiningMonth) + 1;
  const yearsSinceJoining = Math.floor(monthsSinceJoining / 12);

  const elPerMonth = 2.5;
  const totalCLPerYear = 8;

  const currentLeaveYearStart = new Date(joiningDate);
  currentLeaveYearStart.setFullYear(joiningDate.getFullYear() + yearsSinceJoining);

  const nextLeaveYearStart = new Date(currentLeaveYearStart);
  nextLeaveYearStart.setFullYear(currentLeaveYearStart.getFullYear() + 1);

  const approvedLeaves = leaves.filter(
    (leave) => leave.approval_status === 'approved'
  );
  const pendingLeaves = leaves.filter(
    (leave) => leave.approval_status === 'pending'
  );

  // EL Calculation - Starts after 1 month of joining (2.5/month)
  let elBalance = 0;
  const elHistory: Array<{
    month: string;
    credit: number;
    used: number;
    balance: number;
  }> = [];

  // EL starts from the 2nd month onwards
  const elStartMonth = 1; // Start crediting from month 2 (index 1)

  for (let i = 0; i < monthsSinceJoining; i++) {
    const monthDate = new Date(joiningYear, joiningMonth + i, 1);
    const monthStart = new Date(
      monthDate.getFullYear(),
      monthDate.getMonth(),
      1
    );
    const monthEnd = new Date(
      monthDate.getFullYear(),
      monthDate.getMonth() + 1,
      0,
      23,
      59,
      59
    );

    // Credit EL only after first month
    if (i >= elStartMonth) {
      elBalance += elPerMonth;
    }

    const elUsedThisMonth = approvedLeaves
      .filter((leave) => {
        if (leave.leave_type !== 'EL' && leave.leave_type !== 'el') return false;
        const leaveDate = new Date(leave.from_date);
        return leaveDate >= monthStart && leaveDate <= monthEnd;
      })
      .reduce((sum, leave) => sum + (leave.total_days || 0), 0);

    elBalance -= elUsedThisMonth;

    elHistory.push({
      month: monthDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
      }),
      credit: i >= elStartMonth ? elPerMonth : 0,
      used: elUsedThisMonth,
      balance: elBalance,
    });
  }

  const totalELAccumulated = Math.max(0, monthsSinceJoining - elStartMonth) * elPerMonth;
  const usedEL = approvedLeaves
    .filter((leave) => leave.leave_type === 'EL' || leave.leave_type === 'el')
    .reduce((sum, leave) => sum + (leave.total_days || 0), 0);

  const remainingEL = elBalance;
  const pendingEL = pendingLeaves
    .filter((leave) => leave.leave_type === 'EL' || leave.leave_type === 'el')
    .reduce((sum, leave) => sum + (leave.total_days || 0), 0);

  // CL Calculation - 8 days per year from joining date
  const usedCLThisYear = approvedLeaves
    .filter((leave) => {
      if (leave.leave_type !== 'CL' && leave.leave_type !== 'cl') return false;
      const leaveDate = new Date(leave.from_date);
      return leaveDate >= currentLeaveYearStart && leaveDate < nextLeaveYearStart;
    })
    .reduce((sum, leave) => sum + (leave.total_days || 0), 0);

  const remainingCL = Math.max(0, totalCLPerYear - usedCLThisYear);

  const pendingCL = pendingLeaves
    .filter((leave) => leave.leave_type === 'CL' || leave.leave_type === 'cl')
    .reduce((sum, leave) => sum + (leave.total_days || 0), 0);

  // HalfDay Calculation - Starts at 0, deducts 0.5 for each half day
  const usedHalfDay = approvedLeaves
    .filter((leave) => leave.leave_type === 'HalfDay' || leave.leave_type === 'halfday')
    .reduce((sum, leave) => sum + (leave.total_days || 0) * 0.5, 0);

  const remainingHalfDay = -usedHalfDay; // Always negative or 0

  const pendingHalfDay = pendingLeaves
    .filter((leave) => leave.leave_type === 'HalfDay' || leave.leave_type === 'halfday')
    .reduce((sum, leave) => sum + (leave.total_days || 0) * 0.5, 0);

  // LWP Calculation - Starts at 0, deducts 1 for each day
  const usedLWP = approvedLeaves
    .filter((leave) => leave.leave_type === 'LWP' || leave.leave_type === 'lwp')
    .reduce((sum, leave) => sum + (leave.total_days || 0), 0);

  const remainingLWP = -usedLWP; // Always negative or 0

  const pendingLWP = pendingLeaves
    .filter((leave) => leave.leave_type === 'LWP' || leave.leave_type === 'lwp')
    .reduce((sum, leave) => sum + (leave.total_days || 0), 0);

  return {
    el: {
      perMonth: elPerMonth,
      accumulated: totalELAccumulated,
      used: usedEL,
      remaining: remainingEL,
      pending: pendingEL,
      history: elHistory.slice(-6),
    },
    cl: {
      perYear: totalCLPerYear,
      used: usedCLThisYear,
      remaining: remainingCL,
      pending: pendingCL,
      yearStart: currentLeaveYearStart,
      yearEnd: nextLeaveYearStart,
    },
    halfDay: {
      used: usedHalfDay,
      remaining: remainingHalfDay,
      pending: pendingHalfDay,
    },
    lwp: {
      used: usedLWP,
      remaining: remainingLWP,
      pending: pendingLWP,
    },
    monthsSinceJoining,
    yearsSinceJoining,
  };
};

export default function LeaveBalanceCalculator({
  user,
  leaves,
}: LeaveBalanceProps) {
  const leaveBalance = useMemo(() => {
    return calculateLeaveBalance(user, leaves);
  }, [user, leaves]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (!leaveBalance) {
    return (
      <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg flex items-center gap-2">
        <AlertCircle className="w-5 h-5" />
        <span>Joining date not available. Cannot calculate leave balance.</span>
      </div>
    );
  }

  const isNegativeEL = leaveBalance.el.remaining < 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <Calendar className="w-6 h-6" />
              Leave Balance Summary
            </h2>
            <p className="text-indigo-100 text-sm">
              Tenure: {leaveBalance.monthsSinceJoining} months ({leaveBalance.yearsSinceJoining} year{leaveBalance.yearsSinceJoining !== 1 ? 's' : ''})
            </p>
          </div>
          <div className="text-right">
            <p className="text-indigo-200 text-sm">As of</p>
            <p className="text-lg font-semibold">{formatDate(new Date())}</p>
          </div>
        </div>
      </div>

      {/* Leave Balance Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                <th className="px-6 py-4 text-left font-semibold">Leave Type</th>
                <th className="px-6 py-4 text-center font-semibold">Allocated</th>
                <th className="px-6 py-4 text-center font-semibold">Used (Approved)</th>
                <th className="px-6 py-4 text-center font-semibold">Pending</th>
                <th className="px-6 py-4 text-center font-semibold">Available</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {/* Casual Leave Row */}
              <tr className="hover:bg-blue-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="font-semibold text-gray-900">Casual Leave (CL)</p>
                      <p className="text-xs text-gray-500">{leaveBalance.cl.perYear} days/year</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <p className="text-lg font-bold text-blue-600">{leaveBalance.cl.perYear}</p>
                  <p className="text-xs text-gray-500">Per year</p>
                </td>
                <td className="px-6 py-4 text-center">
                  <p className="text-lg font-bold text-red-600">{leaveBalance.cl.used.toFixed(1)}</p>
                </td>
                <td className="px-6 py-4 text-center">
                  <p className="text-lg font-bold text-yellow-600">{leaveBalance.cl.pending.toFixed(1)}</p>
                </td>
                <td className="px-6 py-4 text-center">
                  <p className="text-2xl font-bold text-blue-600">{leaveBalance.cl.remaining.toFixed(1)}</p>
                </td>
              </tr>

              {/* Earned Leave Row */}
              <tr className="hover:bg-green-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="font-semibold text-gray-900">Earned Leave (EL)</p>
                      <p className="text-xs text-gray-500">{leaveBalance.el.perMonth} days/month (after 1 month)</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <p className="text-lg font-bold text-green-600">{leaveBalance.el.accumulated.toFixed(1)}</p>
                  <p className="text-xs text-gray-500">Accumulated</p>
                </td>
                <td className="px-6 py-4 text-center">
                  <p className="text-lg font-bold text-red-600">{leaveBalance.el.used.toFixed(1)}</p>
                </td>
                <td className="px-6 py-4 text-center">
                  <p className="text-lg font-bold text-yellow-600">{leaveBalance.el.pending.toFixed(1)}</p>
                </td>
                <td className="px-6 py-4 text-center">
                  <p className={`text-2xl font-bold ${isNegativeEL ? 'text-red-600' : 'text-green-600'}`}>
                    {leaveBalance.el.remaining.toFixed(1)}
                  </p>
                  {isNegativeEL && (
                    <p className="text-xs text-red-500 font-semibold mt-1">Deficit</p>
                  )}
                </td>
              </tr>

              {/* Half Day Row */}
              <tr className="hover:bg-orange-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <div>
                      <p className="font-semibold text-gray-900">Half Day</p>
                      <p className="text-xs text-gray-500">0.5 day per half day taken</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <p className="text-lg font-bold text-gray-600">0</p>
                  <p className="text-xs text-gray-500">No allocation</p>
                </td>
                <td className="px-6 py-4 text-center">
                  <p className="text-lg font-bold text-red-600">{leaveBalance.halfDay.used.toFixed(1)}</p>
                </td>
                <td className="px-6 py-4 text-center">
                  <p className="text-lg font-bold text-yellow-600">{leaveBalance.halfDay.pending.toFixed(1)}</p>
                </td>
                <td className="px-6 py-4 text-center">
                  <p className="text-2xl font-bold text-orange-600">
                    {leaveBalance.halfDay.remaining.toFixed(1)}
                  </p>
                  {leaveBalance.halfDay.remaining < 0 && (
                    <p className="text-xs text-orange-500 font-semibold mt-1">Deducted</p>
                  )}
                </td>
              </tr>

              {/* Leave Without Pay Row */}
              <tr className="hover:bg-red-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div>
                      <p className="font-semibold text-gray-900">Leave Without Pay (LWP)</p>
                      <p className="text-xs text-gray-500">1 day deducted per day taken</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <p className="text-lg font-bold text-gray-600">0</p>
                  <p className="text-xs text-gray-500">No allocation</p>
                </td>
                <td className="px-6 py-4 text-center">
                  <p className="text-lg font-bold text-red-600">{leaveBalance.lwp.used.toFixed(1)}</p>
                </td>
                <td className="px-6 py-4 text-center">
                  <p className="text-lg font-bold text-yellow-600">{leaveBalance.lwp.pending.toFixed(1)}</p>
                </td>
                <td className="px-6 py-4 text-center">
                  <p className="text-2xl font-bold text-red-600">
                    {leaveBalance.lwp.remaining.toFixed(1)}
                  </p>
                  {leaveBalance.lwp.remaining < 0 && (
                    <p className="text-xs text-red-500 font-semibold mt-1">Deducted</p>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Information Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>📅 CL (Casual Leave):</strong> You get 8 days per year from your joining date anniversary. Unused CL does not carry forward to next year.
          </p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-800">
            <strong>💰 EL (Earned Leave):</strong> You earn 2.5 days per month starting from your 2nd month. EL accumulates and carries forward indefinitely.
          </p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <p className="text-sm text-orange-800">
            <strong>🕐 Half Day:</strong> No allocated balance. Each half day taken deducts 0.5 days. Balance shows total deductions.
          </p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">
            <strong>💸 LWP (Leave Without Pay):</strong> No allocated balance. Each day taken deducts 1 day from your salary. Balance shows total deductions.
          </p>
        </div>
      </div>

      {isNegativeEL && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">
            <strong>⚠️ Negative EL Balance:</strong> You have used more EL than accumulated. 
            This deficit will be recovered from future monthly credits ({leaveBalance.el.perMonth} days/month).
          </p>
        </div>
      )}
    </div>
  );
}

export { calculateLeaveBalance };