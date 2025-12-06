//components/admin/admin-profile.tsx



'use client';
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { MdAdminPanelSettings, MdEmail, MdLock, MdCheckCircle } from 'react-icons/md';
import Image from 'next/image';
import { sendAdminOTPAction, verifyAdminOTPAction } from '@/actions/admin-auth';

const AdminLoginClient = () => {
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'otp' | 'success'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState('');
  const [tempToken, setTempToken] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const setInputRef = (index: number) => (el: HTMLInputElement | null) => {
    inputRefs.current[index] = el;
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('email', email);

    try {
      const result = await sendAdminOTPAction(formData);
      
      if (result.success) {
        setTempToken(result.tempToken || '');
        setStep('otp');
        setCountdown(300); // 5 minutes
      } else {
        setError(result.error || 'Failed to send verification code');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newOtp.every(digit => digit !== '') && index === 5) {
      handleOtpSubmit(newOtp.join(''));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').slice(0, 6);
    if (/^\d+$/.test(pasteData)) {
      const newOtp = pasteData.split('');
      setOtp([...newOtp, ...Array(6 - newOtp.length).fill('')]);
      inputRefs.current[Math.min(5, newOtp.length - 1)]?.focus();
    }
  };

  const handleOtpSubmit = async (submittedOtp?: string) => {
    const finalOtp = submittedOtp || otp.join('');
    if (finalOtp.length !== 6) return;

    setIsLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('tempToken', tempToken);
    formData.append('secret', finalOtp);

    try {
      const result = await verifyAdminOTPAction(formData);
      
      if (result.success) {
        setStep('success');
        setTimeout(() => {
          router.push(result.redirectPath || '/dashboard');
        }, 1500);
      } else {
        setError(result.error || 'Invalid verification code');
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const resendOtp = async () => {
    if (countdown > 0) return;
    
    setIsLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('email', email);

    try {
      const result = await sendAdminOTPAction(formData);
      
      if (result.success) {
        setTempToken(result.tempToken || '');
        setCountdown(300);
      } else {
        setError(result.error || 'Failed to resend verification code');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center mb-8"
        >
          <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/20">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Image src="/logo.png" alt="Admin Logo" width={48} height={48} className="rounded-lg" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Portal</h1>
          <p className="text-blue-200 text-sm">Restricted access - authorized personnel only</p>
        </motion.div>

        {/* Login Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 overflow-hidden"
        >
          <div className="p-8">
            {/* Security Badge */}
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center space-x-2 bg-red-500/20 px-3 py-1 rounded-full border border-red-400/30">
                <MdAdminPanelSettings className="text-red-400 w-4 h-4" />
                <span className="text-red-200 text-sm font-medium">SECURE ADMIN ACCESS</span>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-3 bg-red-500/20 border border-red-400/30 rounded-lg text-red-200 text-sm"
              >
                {error}
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              {/* Email Step */}
              {step === 'email' && (
                <motion.div
                  key="email"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center">
                    <h2 className="text-xl font-semibold text-white mb-2">
                      Admin Email Verification
                    </h2>
                    <p className="text-blue-200 text-sm">
                      Enter your admin email to receive a verification code
                    </p>
                  </div>

                  <form onSubmit={handleEmailSubmit} className="space-y-4">
                    <div className="relative">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@example.com"
                        className="w-full px-4 py-3 pl-11 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all backdrop-blur-sm"
                        required
                      />
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                        <MdEmail className="text-gray-400 w-5 h-5" />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || !email.includes('@')}
                      className="w-full py-3 px-4 bg-gradient-to-r from-red-600 to-purple-600 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-red-700 hover:to-purple-700 transition-all transform hover:scale-[1.02]"
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Verifying Access...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center space-x-2">
                          <MdLock className="w-5 h-5" />
                          <span>Send Verification Code</span>
                        </div>
                      )}
                    </button>
                  </form>
                </motion.div>
              )}

              {/* OTP Step */}
              {step === 'otp' && (
                <motion.div
                  key="otp"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center">
                    <h2 className="text-xl font-semibold text-white mb-2">
                      Enter Verification Code
                    </h2>
                    <p className="text-blue-200 text-sm">
                      Sent to <span className="text-white font-medium">{email}</span>
                    </p>
                    <p className="text-amber-300 text-sm mt-1">
                      Code expires in: {formatCountdown(countdown)}
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div
                      onPaste={handlePaste}
                      className="flex justify-center space-x-3"
                    >
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          ref={setInputRef(index)}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(e.target.value, index)}
                          onKeyDown={(e) => handleKeyDown(e, index)}
                          className="w-12 h-12 text-center bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all backdrop-blur-sm"
                        />
                      ))}
                    </div>

                    <div className="text-center space-y-4">
                      <button
                        onClick={() => handleOtpSubmit()}
                        disabled={isLoading || otp.some(digit => digit === '')}
                        className="w-full py-3 px-4 bg-gradient-to-r from-red-600 to-purple-600 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-red-700 hover:to-purple-700 transition-all transform hover:scale-[1.02]"
                      >
                        {isLoading ? (
                          <div className="flex items-center justify-center space-x-2">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Verifying...</span>
                          </div>
                        ) : (
                          'Verify Access'
                        )}
                      </button>

                      <div className="text-blue-200 text-sm">
                        {countdown > 0 ? (
                          <p>Resend code in {formatCountdown(countdown)}</p>
                        ) : (
                          <button
                            onClick={resendOtp}
                            disabled={isLoading}
                            className="text-amber-300 hover:text-amber-200 transition-colors disabled:opacity-50"
                          >
                            Resend verification code
                          </button>
                        )}
                      </div>

                      <button
                        onClick={() => setStep('email')}
                        className="text-blue-300 hover:text-blue-200 transition-colors text-sm"
                      >
                        ← Use different email
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Success Step */}
              {step === 'success' && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-6"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="w-16 h-16 bg-green-500/20 border border-green-400/30 rounded-full flex items-center justify-center mx-auto"
                  >
                    <MdCheckCircle className="text-2xl text-green-400" />
                  </motion.div>

                  <div>
                    <h2 className="text-xl font-semibold text-white mb-2">
                      Admin Access Granted
                    </h2>
                    <p className="text-blue-200 text-sm mb-4">
                      Redirecting to admin dashboard...
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-6"
        >
          <p className="text-blue-200 text-sm">Secure Admin Portal • OTP Authentication</p>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminLoginClient;