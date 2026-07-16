import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { KeyRound, Mail, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import FormInput from '../components/FormInput';
import Loader from '../components/Loader';
import registerservice from '../api/services/registerservice';

const ForgotPassword = () => {
  const [identifier, setIdentifier] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async(e) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError('Please enter your Employee ID or Email Address.');
      return;
    }
    
    setIsLoading(true);
    setError('');

    try{
      const response = await registerservice.sendResetPasswordEmail(identifier.trim());
      setIsLoading(false);
      setIsSent(true);
    } catch (err) {
      setIsLoading(false);
      setError('Failed to send reset link. Please try again.');
    }
  };

  return (
    <AuthLayout>
      {/* Rebuilt Form Wrapper Container using structural glassmorphism card theme */}
      <div className="w-full max-w-md bg-white/95 backdrop-blur-md border border-white/50 p-6 md:p-8 rounded-2xl shadow-xl font-sans mx-auto">
        
        {/* Header branding and layout area */}
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 bg-blue-50 text-ntc-blue rounded-xl flex items-center justify-center mb-3 border border-blue-100/50">
            <KeyRound size={24} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Reset Password</h2>
          <p className="text-xs text-gray-500 mt-1.5 leading-relaxed px-2">
            Enter your Employee ID or registered email address, and we'll send you instructions to reset your password.
          </p>
        </div>

        {/* Global Error Tracking notification alert */}
        {error && (
          <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200/60 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fade-in">
            <AlertCircle size={16} className="shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {isSent ? (
          /* Verification Success state rendering wrapper */
          <div className="text-center space-y-5 animate-fade-in">
            <div className="p-4 bg-emerald-50 border border-emerald-200/60 text-emerald-800 rounded-xl text-left space-y-2">
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
                <h5>Reset Link Sent!</h5>
              </div>
              <p className="text-xs text-emerald-700/90 leading-relaxed font-medium">
                If an account exists for <strong className="text-emerald-950 font-bold font-mono bg-emerald-100/60 px-1 py-0.5 rounded">{identifier}</strong>, you will receive a password reset link shortly. Please check your inbox and spam folder.
              </p>
            </div>
            
            <Link 
              to="/login" 
              className="w-full block bg-ntc-blue hover:bg-ntc-blue-hover text-white py-3 px-4 rounded-xl font-bold text-sm tracking-wide transition-all duration-300 shadow-sm text-center active:scale-98"
            >
              Return to Login
            </Link>
          </div>
        ) : (
          /* Active interaction form container workspace */
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div className="relative">
              <FormInput 
                label="Username" 
                name="identifier" 
                value={identifier} 
                onChange={(e) => { 
                  setIdentifier(e.target.value); 
                  setError(''); 
                }} 
                placeholder="Eg.Employee1" 
                required 
                className="w-full text-sm text-gray-900 placeholder:text-gray-400"
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading} 
              className="w-full bg-ntc-blue hover:bg-ntc-blue-hover text-white py-3 px-4 rounded-xl font-bold text-sm tracking-wide transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-ntc-blue/15 disabled:opacity-50 disabled:pointer-events-none select-none text-center shadow-sm active:scale-98 flex items-center justify-center min-h-[44px]"
            >
              {isLoading ? (
                <Loader text="Sending link..." />
              ) : (
                <span className="flex items-center gap-1.5 justify-center">
                  <Mail size={16} /> Send Reset Link
                </span>
              )}
            </button>

            {/* Back action link utility element matching previous styles */}
            <div className="text-center pt-2">
              <Link 
                to="/login" 
                className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-ntc-blue transition-colors duration-200 font-semibold"
              >
                <ArrowLeft size={14} /> Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </AuthLayout>
  );
};

export default ForgotPassword;
