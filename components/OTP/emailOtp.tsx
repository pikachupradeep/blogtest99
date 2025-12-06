
//components/OTP/emailOtp.tsx



'use client';
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { sendOTPAction, verifyOTPAction } from '@/actions/auth-actions';
import { MdEmail, MdPrivacyTip, MdLock, MdCheckCircle } from 'react-icons/md';
import Image from 'next/image';

const EmailOTPLogin = () => {
  const router = useRouter();
  const [step, setStep] = useState<'consent' | 'email' | 'otp' | 'success'>('consent');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState('');
  const [tempToken, setTempToken] = useState('');
  const [consentGiven, setConsentGiven] = useState(false);
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

  const handleConsent = () => {
    setConsentGiven(true);
    setStep('email');
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
      const result = await sendOTPAction(formData);
      
      if (result.success) {
        setTempToken(result.tempToken || '');
        setStep('otp');
        setCountdown(300);
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
      const result = await verifyOTPAction(formData);
      
      if (result.success) {
        // Simply use the redirect path provided by the server
        const redirectPath = result.redirectPath || '/authDashboard/posts';
        
        console.log('🔄 Redirecting to:', redirectPath);
        setStep('success');
        setTimeout(() => {
          router.push(redirectPath);
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
      const result = await sendOTPAction(formData);
      
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex pt-26 items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <Image className='h-[3rem] hidden dark:block w-auto object-cover' src="/logowhite.png" alt="logo" width={400} height={400} />
            <Image className='h-[3rem] dark:hidden w-auto object-cover' src="/logodark.png" alt="logo" width={400} height={400} />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Secure Login</h1>
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          <div className="p-6">
            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Progress Steps */}
            <div className="flex justify-center mb-6">
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4].map((num) => (
                  <React.Fragment key={num}>
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all duration-300 text-xs font-medium ${
                        (num === 1 && step === 'consent') ||
                        (num === 2 && step === 'email') ||
                        (num === 3 && step === 'otp') ||
                        (num === 4 && step === 'success')
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : num < (step === 'consent' ? 1 : step === 'email' ? 2 : step === 'otp' ? 3 : 4)
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {num < (step === 'consent' ? 1 : step === 'email' ? 2 : step === 'otp' ? 3 : 4) ? (
                        <MdCheckCircle className="w-3 h-3" />
                      ) : (
                        num
                      )}
                    </div>
                    {num < 4 && (
                      <div
                        className={`w-4 h-0.5 transition-all duration-300 ${
                          num < (step === 'consent' ? 1 : step === 'email' ? 2 : step === 'otp' ? 3 : 4)
                            ? 'bg-blue-600'
                            : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            <AnimatePresence mode="wait">
              {/* Consent Step */}
              {step === 'consent' && (
                <motion.div
                  key="consent"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MdPrivacyTip className="text-xl text-blue-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Privacy Notice
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      Please review our privacy practices before continuing
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-3">
                    <div className="flex items-start space-x-3">
                      <MdLock className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        We'll send a 6-digit verification code to your email address for authentication purposes only.
                      </p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <MdLock className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Your email will be used solely for login verification and will not be shared with third parties.
                      </p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <MdLock className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        The verification code expires after 5 minutes for security reasons.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => router.back()}
                      className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConsent}
                      className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      I Agree
                    </button>
                  </div>
                </motion.div>
              )}

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
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Enter Your Email
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      We'll send a 6-digit verification code to your email
                    </p>
                  </div>

                  <form onSubmit={handleEmailSubmit} className="space-y-4">
                    <div className="relative">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email address"
                        className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        required
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <MdEmail className="text-gray-400 w-5 h-5" />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || !email.includes('@')}
                      className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                      ) : (
                        'Send Verification Code'
                      )}
                    </button>
                  </form>

                  <button
                    onClick={() => setStep('consent')}
                    className="w-full text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  >
                    ← Back to privacy notice
                  </button>
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
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Enter Verification Code
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      Sent to <span className="text-blue-600 font-medium">{email}</span>
                    </p>
                    <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
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
                          className="w-12 h-12 text-center bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                      ))}
                    </div>

                    <div className="text-center space-y-4">
                      <button
                        onClick={() => handleOtpSubmit()}
                        disabled={isLoading || otp.some(digit => digit === '')}
                        className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
                      >
                        {isLoading ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                        ) : (
                          'Verify Code'
                        )}
                      </button>

                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {countdown > 0 ? (
                          <p>Resend code in {formatCountdown(countdown)}</p>
                        ) : (
                          <button
                            onClick={resendOtp}
                            disabled={isLoading}
                            className="text-blue-600 hover:text-blue-700 transition-colors disabled:opacity-50"
                          >
                            Resend code
                          </button>
                        )}
                      </div>

                      <button
                        onClick={() => setStep('email')}
                        className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                      >
                        ← Back to email entry
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
                    className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto"
                  >
                    <MdCheckCircle className="text-2xl text-green-600" />
                  </motion.div>

                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Login Successful
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                      Setting up your dashboard...
                    </p>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1 }}
                      className="text-blue-600 text-sm"
                    >
                      Redirecting...
                    </motion.p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-6 text-sm text-gray-500 dark:text-gray-400"
        >
          <p>Secure authentication system</p>
        </motion.div>
      </div>
    </div>
  );
};

export default EmailOTPLogin;