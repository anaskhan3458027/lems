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

  // ✅ Check if user is JRF or YP
  const isJRF = user.position?.toLowerCase().includes('jrf');
  const isYP = user.position?.toLowerCase().includes('yp');

  // =====================================================
  // ✅ NORMAL LEAVE CALCULATION (For YP Position Only)
  // =====================================================
  const normalLeaveStartDate = new Date('2026-01-01'); // Jan 1, 2026
  const nlPerMonth = 1.5;
  let nlBalance = 0;
  const nlHistory: Array<{
    month: string;
    credit: number;
    used: number;
    balance: number;
  }> = [];

  if (isYP) {
    // Calculate months from Jan 2026 to today
    const nlStartYear = normalLeaveStartDate.getFullYear();
    const nlStartMonth = normalLeaveStartDate.getMonth();

    // Only calculate if today is after Jan 1, 2026
    if (today >= normalLeaveStartDate) {
      const monthsSinceNLStart =
        (currentYear - nlStartYear) * 12 + (currentMonth - nlStartMonth) + 1;

      for (let i = 0; i < monthsSinceNLStart; i++) {
        const monthDate = new Date(nlStartYear, nlStartMonth + i, 1);
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

        // Credit Normal Leave every month
        nlBalance += nlPerMonth;

        // Deduct approved Normal Leave taken in this month
        const nlUsedThisMonth = approvedLeaves
          .filter((leave) => {
            if (leave.leave_type !== 'NormalLeave' && leave.leave_type !== 'normalleave') return false;
            const leaveDate = new Date(leave.from_date);
            return leaveDate >= monthStart && leaveDate <= monthEnd;
          })
          .reduce((sum, leave) => sum + (leave.total_days || 0), 0);

        // ✅ Deduct Half Days taken from Jan 2026 onwards (0.5 per half day)
        const halfDayUsedThisMonth = approvedLeaves
          .filter((leave) => {
            if (leave.leave_type !== 'HalfDay' && leave.leave_type !== 'halfday') return false;
            const leaveDate = new Date(leave.from_date);
            return leaveDate >= normalLeaveStartDate && leaveDate >= monthStart && leaveDate <= monthEnd;
          })
          .reduce((sum, leave) => sum + (leave.total_days || 0) * 0.5, 0);

        nlBalance -= (nlUsedThisMonth + halfDayUsedThisMonth);

        nlHistory.push({
          month: monthDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
          }),
          credit: nlPerMonth,
          used: nlUsedThisMonth + halfDayUsedThisMonth,
          balance: nlBalance,
        });
      }
    }
  }

  const totalNLAccumulated = isYP && today >= normalLeaveStartDate
    ? ((currentYear - normalLeaveStartDate.getFullYear()) * 12 + (currentMonth - normalLeaveStartDate.getMonth()) + 1) * nlPerMonth
    : 0;

  const usedNL = isYP
    ? approvedLeaves
        .filter((leave) => leave.leave_type === 'NormalLeave' || leave.leave_type === 'normalleave')
        .reduce((sum, leave) => sum + (leave.total_days || 0), 0)
    : 0;

  // ✅ Half days taken from Jan 2026 onwards deduct from Normal Leave
  const usedHalfDayAsNL = isYP
    ? approvedLeaves
        .filter((leave) => {
          if (leave.leave_type !== 'HalfDay' && leave.leave_type !== 'halfday') return false;
          const leaveDate = new Date(leave.from_date);
          return leaveDate >= normalLeaveStartDate;
        })
        .reduce((sum, leave) => sum + (leave.total_days || 0) * 0.5, 0)
    : 0;

  const remainingNL = isYP ? nlBalance : 0;

  const pendingNL = isYP
    ? pendingLeaves
        .filter((leave) => leave.leave_type === 'NormalLeave' || leave.leave_type === 'normalleave')
        .reduce((sum, leave) => sum + (leave.total_days || 0), 0)
    : 0;

  // ✅ Pending half days from Jan 2026 onwards
  const pendingHalfDayForNL = isYP
    ? pendingLeaves
        .filter((leave) => {
          if (leave.leave_type !== 'HalfDay' && leave.leave_type !== 'halfday') return false;
          const leaveDate = new Date(leave.from_date);
          return leaveDate >= normalLeaveStartDate;
        })
        .reduce((sum, leave) => sum + (leave.total_days || 0) * 0.5, 0)
    : 0;

  const totalPendingNL = pendingNL + pendingHalfDayForNL;

  // =====================================================
  // EL Calculation - Starts after 1 month of joining (2.5/month)
  // ✅ For JRF: EL is not applicable
  // ✅ For YP: EL shows historical data only
  // =====================================================
  let elBalance = 0;
  const elHistory: Array<{
    month: string;
    credit: number;
    used: number;
    balance: number;
  }> = [];

  const elStartMonth = 1; // Start crediting from month 2 (index 1)

  if (!isJRF && !isYP) {
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
  }

  const totalELAccumulated = !isJRF && !isYP ? Math.max(0, monthsSinceJoining - elStartMonth) * elPerMonth : 0;
  const usedEL = approvedLeaves
    .filter((leave) => leave.leave_type === 'EL' || leave.leave_type === 'el')
    .reduce((sum, leave) => sum + (leave.total_days || 0), 0);

  // remainingEL will be calculated after half day logic

  const pendingEL = pendingLeaves
    .filter((leave) => leave.leave_type === 'EL' || leave.leave_type === 'el')
    .reduce((sum, leave) => sum + (leave.total_days || 0), 0);

  // =====================================================
  // ✅ CL Calculation - 8 days per year from joining date
  // For JRF: Half days before Jan 2026 are deducted from CL (0.5 per half day)
  // For YP: CL shows historical data only (before Jan 2026)
  // =====================================================
  const usedCLThisYear = approvedLeaves
    .filter((leave) => {
      if (leave.leave_type !== 'CL' && leave.leave_type !== 'cl') return false;
      const leaveDate = new Date(leave.from_date);
      return leaveDate >= currentLeaveYearStart && leaveDate < nextLeaveYearStart;
    })
    .reduce((sum, leave) => sum + (leave.total_days || 0), 0);

  // ✅ For JRF: Add half day deductions to CL usage
  // ✅ For YP: Half days before Jan 2026 deduct from CL
  // ✅ For Others: Half days deduct from CL first (calculated later in half day section)
  let usedHalfDayThisYear = 0;
  if (isJRF) {
    usedHalfDayThisYear = approvedLeaves
      .filter((leave) => {
        if (leave.leave_type !== 'HalfDay' && leave.leave_type !== 'halfday') return false;
        const leaveDate = new Date(leave.from_date);
        return leaveDate >= currentLeaveYearStart && leaveDate < nextLeaveYearStart;
      })
      .reduce((sum, leave) => sum + (leave.total_days || 0) * 0.5, 0);
  } else if (isYP) {
    // For YP: Only half days taken BEFORE Jan 2026 deduct from CL
    usedHalfDayThisYear = approvedLeaves
      .filter((leave) => {
        if (leave.leave_type !== 'HalfDay' && leave.leave_type !== 'halfday') return false;
        const leaveDate = new Date(leave.from_date);
        return leaveDate < normalLeaveStartDate && leaveDate >= currentLeaveYearStart && leaveDate < nextLeaveYearStart;
      })
      .reduce((sum, leave) => sum + (leave.total_days || 0) * 0.5, 0);
  }
  // Note: For non-JRF/non-YP, half day deduction from CL will be calculated after we know total CL usage

  const totalCLUsedBeforeHalfDay = usedCLThisYear + usedHalfDayThisYear;
  const remainingCLBeforeHalfDay = Math.max(0, totalCLPerYear - totalCLUsedBeforeHalfDay);

  const pendingCL = pendingLeaves
    .filter((leave) => leave.leave_type === 'CL' || leave.leave_type === 'cl')
    .reduce((sum, leave) => sum + (leave.total_days || 0), 0);

  // ✅ For JRF: Add pending half days to pending CL
  // ✅ For YP: Pending half days before Jan 2026 to pending CL
  let pendingHalfDayForCL = 0;
  if (isJRF) {
    pendingHalfDayForCL = pendingLeaves
      .filter((leave) => leave.leave_type === 'HalfDay' || leave.leave_type === 'halfday')
      .reduce((sum, leave) => sum + (leave.total_days || 0) * 0.5, 0);
  } else if (isYP) {
    pendingHalfDayForCL = pendingLeaves
      .filter((leave) => {
        if (leave.leave_type !== 'HalfDay' && leave.leave_type !== 'halfday') return false;
        const leaveDate = new Date(leave.from_date);
        return leaveDate < normalLeaveStartDate;
      })
      .reduce((sum, leave) => sum + (leave.total_days || 0) * 0.5, 0);
  }

  const totalPendingCL = pendingCL + pendingHalfDayForCL;

  // =====================================================
  // ✅ HalfDay Calculation
  // For JRF: Half days are counted in CL
  // For YP: Half days before Jan 2026 go to CL, after Jan 2026 go to Normal Leave
  // For Others: Half days deduct from CL first, then from EL if CL exhausted
  // =====================================================
  const usedHalfDay = approvedLeaves
    .filter((leave) => leave.leave_type === 'HalfDay' || leave.leave_type === 'halfday')
    .reduce((sum, leave) => sum + (leave.total_days || 0) * 0.5, 0);

  // ✅ For YP: Split half days into before/after Jan 2026
  let usedHalfDayBeforeNL = 0;
  let usedHalfDayAfterNL = 0;
  let usedHalfDayFromCL = 0;
  let usedHalfDayFromEL = 0;

  if (isYP) {
    usedHalfDayBeforeNL = approvedLeaves
      .filter((leave) => {
        if (leave.leave_type !== 'HalfDay' && leave.leave_type !== 'halfday') return false;
        const leaveDate = new Date(leave.from_date);
        return leaveDate < normalLeaveStartDate;
      })
      .reduce((sum, leave) => sum + (leave.total_days || 0) * 0.5, 0);

    usedHalfDayAfterNL = usedHalfDayAsNL; // Already calculated above
  } else if (!isJRF) {
    // ✅ For non-JRF and non-YP: Split half days between CL and EL
    // First deduct from CL, then from EL if CL is exhausted
    
    if (usedHalfDay <= remainingCLBeforeHalfDay) {
      // All half days fit within CL
      usedHalfDayFromCL = usedHalfDay;
      usedHalfDayFromEL = 0;
    } else {
      // Some half days spill over to EL
      usedHalfDayFromCL = remainingCLBeforeHalfDay;
      usedHalfDayFromEL = usedHalfDay - remainingCLBeforeHalfDay;
    }
  }

  // ✅ Now recalculate final CL and EL with half day deductions
  const totalCLUsed = isJRF || isYP 
    ? totalCLUsedBeforeHalfDay 
    : totalCLUsedBeforeHalfDay + usedHalfDayFromCL;
  
  const remainingCL = Math.max(0, totalCLPerYear - totalCLUsed);

  // ✅ Update EL balance with half day deductions (for non-JRF/non-YP only)
  if (!isJRF && !isYP && usedHalfDayFromEL > 0) {
    elBalance -= usedHalfDayFromEL;
  }
  const remainingEL = !isJRF && !isYP ? elBalance : 0;

  const remainingHalfDay = isJRF || isYP ? 0 : -usedHalfDay;

  const pendingHalfDay = pendingLeaves
    .filter((leave) => leave.leave_type === 'HalfDay' || leave.leave_type === 'halfday')
    .reduce((sum, leave) => sum + (leave.total_days || 0) * 0.5, 0);

  // LWP Calculation - Starts at 0, deducts 1 for each day
  const usedLWP = approvedLeaves
    .filter((leave) => leave.leave_type === 'LWP' || leave.leave_type === 'lwp')
    .reduce((sum, leave) => sum + (leave.total_days || 0), 0);

  const remainingLWP = -usedLWP;

  const pendingLWP = pendingLeaves
    .filter((leave) => leave.leave_type === 'LWP' || leave.leave_type === 'lwp')
    .reduce((sum, leave) => sum + (leave.total_days || 0), 0);

  return {
    nl: {
      perMonth: nlPerMonth,
      accumulated: totalNLAccumulated,
      used: usedNL + usedHalfDayAsNL,
      usedNLOnly: usedNL,
      usedHalfDayAsNL: usedHalfDayAsNL,
      remaining: remainingNL,
      pending: totalPendingNL,
      history: nlHistory.slice(-6),
      startDate: normalLeaveStartDate,
    },
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
      used: totalCLUsed,
      usedCLOnly: usedCLThisYear,
      usedHalfDayAsCL: usedHalfDayThisYear,
      remaining: remainingCL,
      pending: totalPendingCL,
      yearStart: currentLeaveYearStart,
      yearEnd: nextLeaveYearStart,
    },
    halfDay: {
      used: usedHalfDay,
      usedBeforeNL: usedHalfDayBeforeNL,
      usedAfterNL: usedHalfDayAfterNL,
      usedFromCL: usedHalfDayFromCL,
      usedFromEL: usedHalfDayFromEL,
      remaining: remainingHalfDay,
      pending: pendingHalfDay,
      deductedFromCL: isJRF,
      deductedFromNL: isYP,
      deductedFromCLAndEL: !isJRF && !isYP,
    },
    lwp: {
      used: usedLWP,
      remaining: remainingLWP,
      pending: pendingLWP,
    },
    monthsSinceJoining,
    yearsSinceJoining,
    isJRF,
    isYP,
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
  const isJRF = leaveBalance.isJRF;
  const isYP = leaveBalance.isYP;

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

      {/* ✅ JRF Notice */}
      {isJRF && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-amber-800 mb-1">
                JRF Position Notice
              </p>
              <p className="text-sm text-amber-700 mb-2">
                As a JRF (Junior Research Fellow), you are <strong>not eligible to apply for Earned Leave (EL)</strong>. 
                Historical EL data is shown below for reference only.
              </p>
              <p className="text-sm text-amber-700">
                <strong>Important:</strong> Half days are deducted from your Casual Leave (CL) balance at 0.5 days per half day taken.
                You can only apply for: <strong>CL, Half Day, and LWP</strong>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ✅ YP Notice */}
      {isYP && (
        <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-blue-800 mb-1">
                YP Position Notice
              </p>
              <p className="text-sm text-blue-700 mb-2">
                As a YP (Young Professional), you are allocated <strong>Normal Leave (NL)</strong> starting from <strong>January 1, 2026</strong> at <strong>1.5 days per month</strong>.
              </p>
              <p className="text-sm text-blue-700 mb-2">
                <strong>Half Day Rules:</strong>
                <br />• Half days taken <strong>before Jan 2026</strong> deduct from <strong>Casual Leave (CL)</strong> at 0.5 days each
                <br />• Half days taken <strong>from Jan 2026 onwards</strong> deduct from <strong>Normal Leave (NL)</strong> at 0.5 days each
              </p>
              <p className="text-sm text-blue-700">
                You can only apply for: <strong>Normal Leave, Half Day, and LWP</strong>.
                <br />CL and EL shown below are historical data only.
              </p>
            </div>
          </div>
        </div>
      )}

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
              {/* ✅ Normal Leave Row (For YP Only) */}
              {isYP && (
                <tr className="hover:bg-teal-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                      <div>
                        <p className="font-semibold text-gray-900 flex items-center gap-2">
                          Normal Leave (NL)
                          <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-medium">
                            From Jan 2026
                          </span>
                        </p>
                        <p className="text-xs text-gray-500">{leaveBalance.nl.perMonth} days/month</p>
                        {leaveBalance.nl.usedHalfDayAsNL > 0 && (
                          <p className="text-xs text-teal-600 mt-1">
                            NL: {leaveBalance.nl.usedNLOnly.toFixed(1)} | Half Days: {leaveBalance.nl.usedHalfDayAsNL.toFixed(1)}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <p className="text-lg font-bold text-teal-600">{leaveBalance.nl.accumulated.toFixed(1)}</p>
                    <p className="text-xs text-gray-500">Accumulated</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <p className="text-lg font-bold text-red-600">{leaveBalance.nl.used.toFixed(1)}</p>
                    {leaveBalance.nl.usedHalfDayAsNL > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        ({leaveBalance.nl.usedNLOnly.toFixed(1)} + {leaveBalance.nl.usedHalfDayAsNL.toFixed(1)} HD)
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <p className="text-lg font-bold text-yellow-600">{leaveBalance.nl.pending.toFixed(1)}</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <p className="text-2xl font-bold text-teal-600">{leaveBalance.nl.remaining.toFixed(1)}</p>
                  </td>
                </tr>
              )}

              {/* Casual Leave Row */}
              <tr className={`hover:bg-blue-50 transition-colors ${isYP ? 'opacity-60' : ''}`}>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="font-semibold text-gray-900 flex items-center gap-2">
                        Casual Leave (CL)
                        {isJRF && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                            Includes Half Days
                          </span>
                        )}
                        {isYP && (
                          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                            Historical Only
                          </span>
                        )}
                        {!isJRF && !isYP && leaveBalance.halfDay.usedFromCL > 0 && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                            Includes Half Days
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500">
                        {isYP ? 'Before Jan 2026 only' : `${leaveBalance.cl.perYear} days/year`}
                      </p>
                      {(isJRF || isYP) && leaveBalance.cl.usedHalfDayAsCL > 0 && (
                        <p className="text-xs text-blue-600 mt-1">
                          CL: {leaveBalance.cl.usedCLOnly.toFixed(1)} | Half Days: {leaveBalance.cl.usedHalfDayAsCL.toFixed(1)}
                        </p>
                      )}
                      {!isJRF && !isYP && leaveBalance.halfDay.usedFromCL > 0 && (
                        <p className="text-xs text-blue-600 mt-1">
                          CL: {leaveBalance.cl.usedCLOnly.toFixed(1)} | Half Days: {leaveBalance.halfDay.usedFromCL.toFixed(1)}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <p className="text-lg font-bold text-blue-600">{leaveBalance.cl.perYear}</p>
                  <p className="text-xs text-gray-500">Per year</p>
                </td>
                <td className="px-6 py-4 text-center">
                  <p className="text-lg font-bold text-red-600">{leaveBalance.cl.used.toFixed(1)}</p>
                  {(isJRF || isYP) && leaveBalance.cl.usedHalfDayAsCL > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      ({leaveBalance.cl.usedCLOnly.toFixed(1)} + {leaveBalance.cl.usedHalfDayAsCL.toFixed(1)} HD)
                    </p>
                  )}
                  {!isJRF && !isYP && leaveBalance.halfDay.usedFromCL > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      ({leaveBalance.cl.usedCLOnly.toFixed(1)} + {leaveBalance.halfDay.usedFromCL.toFixed(1)} HD)
                    </p>
                  )}
                </td>
                <td className="px-6 py-4 text-center">
                  <p className="text-lg font-bold text-yellow-600">{leaveBalance.cl.pending.toFixed(1)}</p>
                </td>
                <td className="px-6 py-4 text-center">
                  <p className="text-2xl font-bold text-blue-600">{leaveBalance.cl.remaining.toFixed(1)}</p>
                </td>
              </tr>

              {/* Earned Leave Row */}
              <tr className={`hover:bg-green-50 transition-colors ${isJRF || isYP ? 'opacity-60' : ''}`}>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="font-semibold text-gray-900 flex items-center gap-2">
                        Earned Leave (EL)
                        {(isJRF || isYP) && (
                          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                            Not Eligible
                          </span>
                        )}
                        {!isJRF && !isYP && leaveBalance.halfDay.usedFromEL > 0 && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                            Includes Half Days
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500">
                        {isJRF || isYP ? 'Historical data only' : `${leaveBalance.el.perMonth} days/month (after 1 month)`}
                      </p>
                      {!isJRF && !isYP && leaveBalance.halfDay.usedFromEL > 0 && (
                        <p className="text-xs text-green-600 mt-1">
                          EL: {leaveBalance.el.used.toFixed(1)} | Half Days: {leaveBalance.halfDay.usedFromEL.toFixed(1)}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <p className="text-lg font-bold text-green-600">{leaveBalance.el.accumulated.toFixed(1)}</p>
                  <p className="text-xs text-gray-500">Accumulated</p>
                </td>
                <td className="px-6 py-4 text-center">
                  <p className="text-lg font-bold text-red-600">
                    {!isJRF && !isYP 
                      ? (leaveBalance.el.used + leaveBalance.halfDay.usedFromEL).toFixed(1)
                      : leaveBalance.el.used.toFixed(1)
                    }
                  </p>
                  {!isJRF && !isYP && leaveBalance.halfDay.usedFromEL > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      ({leaveBalance.el.used.toFixed(1)} + {leaveBalance.halfDay.usedFromEL.toFixed(1)} HD)
                    </p>
                  )}
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
              <tr className={`hover:bg-orange-50 transition-colors ${isJRF || isYP ? 'opacity-60' : ''}`}>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <div>
                      <p className="font-semibold text-gray-900 flex items-center gap-2">
                        Half Day
                        {isJRF && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                            Deducted from CL
                          </span>
                        )}
                        {isYP && (
                          <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-medium">
                            CL or NL
                          </span>
                        )}
                        {!isJRF && !isYP && (
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                            CL then EL
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500">
                        {isJRF
                          ? 'Counted in CL above (0.5 day each)'
                          : isYP
                          ? 'Before 2026: CL | From 2026: NL'
                          : 'Deducts from CL first, then EL (0.5 day each)'}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <p className="text-lg font-bold text-gray-600">{isJRF || isYP ? 'N/A' : '0'}</p>
                  <p className="text-xs text-gray-500">
                    {isJRF ? 'Part of CL' : isYP ? 'Part of CL/NL' : 'No allocation'}
                  </p>
                </td>
                <td className="px-6 py-4 text-center">
                  <p className="text-lg font-bold text-orange-600">{leaveBalance.halfDay.used.toFixed(1)}</p>
                  {isYP && (leaveBalance.halfDay.usedBeforeNL > 0 || leaveBalance.halfDay.usedAfterNL > 0) && (
                    <p className="text-xs text-gray-500 mt-1">
                      CL: {leaveBalance.halfDay.usedBeforeNL.toFixed(1)} | NL: {leaveBalance.halfDay.usedAfterNL.toFixed(1)}
                    </p>
                  )}
                  {!isJRF && !isYP && (leaveBalance.halfDay.usedFromCL > 0 || leaveBalance.halfDay.usedFromEL > 0) && (
                    <p className="text-xs text-gray-500 mt-1">
                      CL: {leaveBalance.halfDay.usedFromCL.toFixed(1)} | EL: {leaveBalance.halfDay.usedFromEL.toFixed(1)}
                    </p>
                  )}
                  {isJRF && (
                    <p className="text-xs text-blue-600 mt-1">See CL row</p>
                  )}
                </td>
                <td className="px-6 py-4 text-center">
                  <p className="text-lg font-bold text-yellow-600">{leaveBalance.halfDay.pending.toFixed(1)}</p>
                </td>
                <td className="px-6 py-4 text-center">
                  <p className="text-2xl font-bold text-orange-600">
                    {isJRF ? 'See CL' : isYP ? 'See CL/NL' : 'See CL/EL'}
                  </p>
                  {!isJRF && !isYP && leaveBalance.halfDay.remaining < 0 && (
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
        {/* ✅ Normal Leave Note (YP Only) */}
        {isYP && (
          <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
            <p className="text-sm text-teal-800">
              <strong>🌟 NL (Normal Leave):</strong> For YP position, you get 1.5 days per month starting from Jan 1, 2026. Half days taken from Jan 2026 onwards deduct 0.5 days from NL balance.
            </p>
          </div>
        )}

        <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${isYP ? 'opacity-60' : ''}`}>
          <p className="text-sm text-blue-800">
            <strong>📅 CL (Casual Leave):</strong> {isYP ? 'Historical data only. You got 8 days per year before Jan 2026.' : 'You get 8 days per year from your joining date anniversary.'} 
            {isJRF && <span className="font-bold"> For JRF: Half days are deducted from this balance at 0.5 days each.</span>}
            {isYP && <span className="font-bold"> For YP: Half days before Jan 2026 deducted from CL.</span>}
          </p>
        </div>

        <div className={`bg-green-50 border border-green-200 rounded-lg p-4 ${isJRF || isYP ? 'opacity-60' : ''}`}>
          <p className="text-sm text-green-800">
            <strong>💰 EL (Earned Leave):</strong> {isJRF || isYP ? `${isYP ? 'YP' : 'JRF'} position is not eligible for EL. Historical data shown for reference only.` : 'You earn 2.5 days per month starting from your 2nd month. EL accumulates and carries forward indefinitely.'}
          </p>
        </div>

        <div className={`bg-orange-50 border border-orange-200 rounded-lg p-4 ${isJRF || isYP ? 'opacity-60' : ''}`}>
          <p className="text-sm text-orange-800">
            <strong>🕐 Half Day:</strong> {isJRF ? 'For JRF: Each half day is deducted from your CL balance at 0.5 days. Check CL row for total usage.' : isYP ? 'For YP: Half days before Jan 2026 deduct from CL, from Jan 2026 onwards deduct from NL (0.5 days each).' : 'No allocated balance. Each half day (0.5 days) is deducted from CL first. If CL is exhausted, remaining half days are deducted from EL.'}
          </p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">
            <strong>💸 LWP (Leave Without Pay):</strong> No allocated balance. Each day taken deducts 1 day from your salary. Balance shows total deductions.
          </p>
        </div>
      </div>

      {isNegativeEL && !isJRF && !isYP && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">
            <strong>⚠️ Negative EL Balance:</strong> You have used more EL than accumulated. 
            This deficit will be recovered from future monthly credits ({leaveBalance.el.perMonth} days/month).
          </p>
        </div>
      )}

      {/* ✅ YP NL Breakdown */}
      {isYP && (leaveBalance.nl.usedNLOnly > 0 || leaveBalance.nl.usedHalfDayAsNL > 0) && (
        <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
          <p className="text-sm text-teal-800">
            <strong>📊 Your Normal Leave (NL) Usage Breakdown:</strong>
          </p>
          <div className="mt-2 space-y-1 text-sm text-teal-700">
            <p>• Full Day NL Used: <strong>{leaveBalance.nl.usedNLOnly.toFixed(1)}</strong> days</p>
            <p>• Half Days Used (from Jan 2026): <strong>{(leaveBalance.nl.usedHalfDayAsNL * 2).toFixed(0)}</strong> half days = <strong>{leaveBalance.nl.usedHalfDayAsNL.toFixed(1)}</strong> days deducted from NL</p>
            <p className="pt-2 border-t border-teal-300">
              • <strong>Total NL Used:</strong> {leaveBalance.nl.used.toFixed(1)} days (of {leaveBalance.nl.accumulated.toFixed(1)} accumulated)
            </p>
            <p>• <strong>Remaining NL:</strong> {leaveBalance.nl.remaining.toFixed(1)} days</p>
          </div>
        </div>
      )}

      {/* ✅ YP CL Breakdown (if any CL was used before Jan 2026) */}
      {isYP && (leaveBalance.cl.usedCLOnly > 0 || leaveBalance.cl.usedHalfDayAsCL > 0) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>📊 Your CL Usage Breakdown (Before Jan 2026):</strong>
          </p>
          <div className="mt-2 space-y-1 text-sm text-blue-700">
            <p>• Full Day CL Used: <strong>{leaveBalance.cl.usedCLOnly.toFixed(1)}</strong> days</p>
            <p>• Half Days Used (before Jan 2026): <strong>{(leaveBalance.halfDay.usedBeforeNL * 2).toFixed(0)}</strong> half days = <strong>{leaveBalance.cl.usedHalfDayAsCL.toFixed(1)}</strong> days deducted from CL</p>
            <p className="pt-2 border-t border-blue-300">
              • <strong>Total CL Used:</strong> {leaveBalance.cl.used.toFixed(1)} days (of {leaveBalance.cl.perYear} allocated)
            </p>
            <p>• <strong>Remaining CL:</strong> {leaveBalance.cl.remaining.toFixed(1)} days</p>
          </div>
        </div>
      )}

      {/* ✅ Regular Position CL/EL Breakdown (if half days were used) */}
      {!isJRF && !isYP && (leaveBalance.halfDay.usedFromCL > 0 || leaveBalance.halfDay.usedFromEL > 0) && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-sm text-purple-800">
            <strong>📊 Your Half Day Usage Breakdown:</strong>
          </p>
          <div className="mt-2 space-y-1 text-sm text-purple-700">
            <p>• Total Half Days Taken: <strong>{(leaveBalance.halfDay.used * 2).toFixed(0)}</strong> half days = <strong>{leaveBalance.halfDay.used.toFixed(1)}</strong> days</p>
            {leaveBalance.halfDay.usedFromCL > 0 && (
              <p>• Deducted from CL: <strong>{leaveBalance.halfDay.usedFromCL.toFixed(1)}</strong> days</p>
            )}
            {leaveBalance.halfDay.usedFromEL > 0 && (
              <p>• Deducted from EL (after CL exhausted): <strong>{leaveBalance.halfDay.usedFromEL.toFixed(1)}</strong> days</p>
            )}
            <p className="pt-2 border-t border-purple-300 text-xs italic">
              Half days are deducted from CL first. Once CL is exhausted, remaining half days are deducted from EL.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export { calculateLeaveBalance };