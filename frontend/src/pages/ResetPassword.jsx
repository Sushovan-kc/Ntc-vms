import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom'; // Added for URL token parameters
import { KeyRound, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import PasswordInput from '../components/PasswordInput';
import Loader from '../components/Loader';
import registerservice from '../api/services/registerservice'; // Import the service for API calls

const ResetPassword = () => {
  // Capture dynamic tokens from the email link URL structure
  const { uidb64, token } = useParams();

  const [formData, setFormData] = useState({ 
    password: '', 
    confirmPassword: '' 
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError('');
  };


const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (formData.password.length < 8) {
    setError('Password must be at least 8 characters long.');
    return;
  }
  if (formData.password !== formData.confirmPassword) {
    setError('Passwords do not match.');
    return;
  }

  setIsLoading(true);
  setError('');

  try {
    // 1. Call your API client abstraction function
    await confirmResetPassword(uidb64, token, formData.password);
    setSuccess(true);
  } catch (err) {
    // 2. 'err' here is EXACTLY 'error.response.data' thrown from your service file
    console.log("Extracted Backend Error payload:", err);

    if (err && typeof err === 'object') {
      // Pull explicit error keys out of the DRF response dictionary
      const backendMessage = err.error || err.password || err.confirm_password || err.detail;
      
      // If Django returns an array (like password validation lists), grab the first item string
      setError(Array.isArray(backendMessage) ? backendMessage[0] : backendMessage || 'The link is invalid or has expired.');
    } else {
      setError('An unexpected connection error occurred.');
    }
  } finally {
    setIsLoading(false);
  }
};



  return (
    <AuthLayout>
      {/* Rebuilt Form Wrapper Container using clean glassmorphism card theme */}
      <div className="w-full max-w-md bg-white/95 backdrop-blur-md border border-white/50 p-6 md:p-8 rounded-2xl shadow-xl font-sans mx-auto">
        
        {/* Header Branding Section */}
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 bg-blue-50 text-ntc-blue rounded-xl flex items-center justify-center mb-3 border border-blue-100/50">
            <KeyRound size={24} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Create New Password</h2>
          <p className="text-xs text-gray-500 mt-1.5 leading-relaxed px-2">
            Your new password must be secure and different from previously used credentials.
          </p>
        </div>

        {/* Global Error Tracking notification alert */}
        {error && (
          <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200/60 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fade-in">
            <AlertCircle size={16} className="shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          /* Verification Success state rendering wrapper */
          <div className="text-center space-y-5 animate-fade-in">
            <div className="p-4 bg-emerald-50 border border-emerald-200/60 text-emerald-800 rounded-xl text-left space-y-2">
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
                <h5>Password Reset Complete!</h5>
              </div>
              <p className="text-xs text-emerald-700/90 leading-relaxed font-medium">
                Your credentials have been successfully updated. You can now use your new password to sign into the system.
              </p>
            </div>
            <Link 
              to="/login" 
              className="w-full block bg-ntc-blue hover:bg-ntc-blue-hover text-white py-3 px-4 rounded-xl font-bold text-sm tracking-wide transition-all duration-300 shadow-sm text-center active:scale-98"
            >
              Continue to Login
            </Link>
          </div>
        ) : (
          /* Active interaction form container workspace */
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            
            <PasswordInput 
              label="New Password" 
              name="password" 
              value={formData.password} 
              onChange={handleChange} 
              required 
              showStrength={true}
              className="w-full text-sm text-gray-900 placeholder:text-gray-400"
            />
            
            <PasswordInput 
              label="Confirm New Password" 
              name="confirmPassword" 
              value={formData.confirmPassword} 
              onChange={handleChange} 
              placeholder="Confirm your new password" 
              required 
              className="w-full text-sm text-gray-900 placeholder:text-gray-400"
            />

            <button 
              type="submit" 
              disabled={isLoading} 
              className="w-full bg-ntc-blue hover:bg-ntc-blue-hover text-white py-3 px-4 rounded-xl font-bold text-sm tracking-wide transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-ntc-blue/15 disabled:opacity-50 disabled:pointer-events-none select-none text-center shadow-sm active:scale-98 flex items-center justify-center min-h-[44px]"
            >
              {isLoading ? (
                <Loader text="Updating password..." />
              ) : (
                "Update Password"
              )}
            </button>

            {/* Back action link utility element */}
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

export default ResetPassword;
