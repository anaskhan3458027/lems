"use client";

import { useState } from 'react';
import { X, Mail, Lock, KeyRound } from 'lucide-react';
import { useForgotPassword } from '@/contexts/management/AdminContext/LoginContext';

interface ForgotPasswordModalProps {
  userType: 'admin' | 'employee';
  onClose: () => void;
}

export default function ForgotPasswordModal({ userType, onClose }: ForgotPasswordModalProps) {
  const { sendOTP, verifyOTP, resetPassword, isLoading, error, successMessage } = useForgotPassword();
  
  const [step, setStep] = useState<'email' | 'otp' | 'password'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const colorScheme = userType === 'admin' 
    ? { from: 'from-blue-500', to: 'to-indigo-600', text: 'text-blue-600', ring: 'ring-blue-500' }
    : { from: 'from-green-500', to: 'to-teal-600', text: 'text-green-600', ring: 'ring-green-500' };

  const handleSendOTP = async () => {
    setLocalError('');
    if (!email) {
      setLocalError('Please enter your email');
      return;
    }

    const success = await sendOTP(email, userType);
    if (success) {
      setStep('otp');
    }
  };

  const handleVerifyOTP = async () => {
    setLocalError('');
    if (!otp) {
      setLocalError('Please enter OTP');
      return;
    }

    const success = await verifyOTP(email, otp, userType);
    if (success) {
      setStep('password');
    }
  };

  const handleResetPassword = async () => {
    setLocalError('');
    
    if (!newPassword || !confirmPassword) {
      setLocalError('Please fill all fields');
      return;
    }

    if (newPassword.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    const success = await resetPassword(email, userType, newPassword, otp);
    if (success) {
      setTimeout(() => onClose(), 2000);
    }
  };

  const displayError = error || localError;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mb-6">
          <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${colorScheme.from} ${colorScheme.to} rounded-full mb-4`}>
            <KeyRound className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Reset Password</h2>
          <p className="text-gray-500 mt-2">
            {step === 'email' && 'Enter your email to receive OTP'}
            {step === 'otp' && 'Enter the OTP sent to your email'}
            {step === 'password' && 'Create your new password'}
          </p>
        </div>

        <div className="space-y-4">
          {step === 'email' && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendOTP()}
                    className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:${colorScheme.ring} focus:border-transparent transition`}
                    placeholder="your@email.com"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {displayError && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {displayError}
                </div>
              )}

              <button
                onClick={handleSendOTP}
                disabled={isLoading}
                className={`w-full bg-gradient-to-r ${colorScheme.from} ${colorScheme.to} text-white py-3 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50`}
              >
                {isLoading ? 'Sending...' : 'Send OTP'}
              </button>
            </>
          )}

          {step === 'otp' && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Enter OTP</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    onKeyPress={(e) => e.key === 'Enter' && handleVerifyOTP()}
                    className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:${colorScheme.ring} focus:border-transparent transition text-center text-2xl tracking-widest`}
                    placeholder="000000"
                    maxLength={6}
                    disabled={isLoading}
                  />
                </div>
                <p className="text-xs text-gray-500 text-center">OTP is valid for 2 minutes</p>
              </div>

              {displayError && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {displayError}
                </div>
              )}

              {successMessage && (
                <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg text-sm">
                  {successMessage}
                </div>
              )}

              <button
                onClick={handleVerifyOTP}
                disabled={isLoading}
                className={`w-full bg-gradient-to-r ${colorScheme.from} ${colorScheme.to} text-white py-3 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50`}
              >
                {isLoading ? 'Verifying...' : 'Verify OTP'}
              </button>

              <button
                onClick={() => handleSendOTP()}
                disabled={isLoading}
                className={`w-full text-sm ${colorScheme.text} hover:underline`}
              >
                Resend OTP
              </button>
            </>
          )}

          {step === 'password' && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:${colorScheme.ring} focus:border-transparent transition`}
                    placeholder="••••••••"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleResetPassword()}
                    className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:${colorScheme.ring} focus:border-transparent transition`}
                    placeholder="••••••••"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {displayError && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {displayError}
                </div>
              )}

              {successMessage && (
                <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg text-sm">
                  {successMessage}
                </div>
              )}

              <button
                onClick={handleResetPassword}
                disabled={isLoading}
                className={`w-full bg-gradient-to-r ${colorScheme.from} ${colorScheme.to} text-white py-3 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50`}
              >
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}