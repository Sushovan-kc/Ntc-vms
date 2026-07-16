import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import FormInput from '../components/FormInput';
import PasswordInput from '../components/PasswordInput';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ username: '', password: '', rememberMe: false });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  setError('');

  try {
    const result = await login(formData.username.trim(), formData.password);

    if (result && result.success) {
      // Handle your successful dashboard navigation routing here
      return;
    }

    // 🟢 FIXED: Clean, direct string translation fallback
    if (result && !result.success) {
      setError(result.error || 'Please enter valid credentials.');
    }
  } catch (componentCrashError) {
    console.error("Login Page Error:", componentCrashError);
    setError('An internal login error occurred.');
  } finally {
    setIsLoading(false);
  }
};


  return (
    <AuthLayout>
      <div className="bg-white rounded-xl shadow-[0_10px_30px_rgba(0,56,147,0.08)] w-full max-w-md p-8 lg:p-10 m-auto">
        <div className="text-center mb-4">
          <h2 className="text-ntc-dark-text font-bold text-[1.75rem] mb-2 leading-tight">Welcome Back</h2>
          <p className="text-ntc-muted text-[0.95rem] mb-6">Sign in to your enterprise account</p>
        </div>

        {/* Global Error Banner Display Section */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-ntc-danger/20 text-ntc-danger rounded-lg text-sm font-medium animate-fade-in">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <FormInput label="Employee ID / Username" name="username" value={formData.username} onChange={handleChange} placeholder="Enter your ID or username" required />
          <PasswordInput label="Password" name="password" value={formData.password} onChange={handleChange} required />
          
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <input className="w-4 h-4 text-ntc-blue border-gray-300 rounded focus:ring-ntc-blue/15 cursor-pointer" type="checkbox" id="rememberMe" name="rememberMe" checked={formData.rememberMe} onChange={handleChange} />
              <label className="ml-2 text-ntc-muted cursor-pointer select-none text-[0.9rem]" htmlFor="rememberMe">
                Remember Me
              </label>
            </div>
            {/* Modified to match your standardized frontend layout formatting paths */}
            <Link to="/forgot-password" className="text-ntc-blue hover:text-ntc-blue-hover text-[0.9rem] font-medium no-underline hover:underline">
              Forgot Password?
            </Link>
          </div>

          <button type="submit" className="w-full mb-3 bg-ntc-blue text-white p-3 rounded-lg font-semibold transition-all duration-300 hover:bg-ntc-blue-hover focus:bg-ntc-blue-hover active:bg-ntc-blue-hover hover:shadow-[0_4px_12px_rgba(0,56,147,0.2)] disabled:opacity-50 text-center flex items-center justify-center min-h-[48px]" disabled={isLoading}>
            {isLoading ? <Loader text="Authenticating..." /> : "Secure Login"}
          </button>
        </form>

        <div className="text-center mt-4">
          <p className="text-ntc-muted text-[0.9rem]">
            Don't have an account?{' '}
            <Link to="/register" className="text-ntc-blue hover:text-ntc-blue-hover font-medium no-underline hover:underline">
              Register here
            </Link>
          </p>
        </div>

        <div className="mt-4 p-3 bg-ntc-gray rounded-lg text-center border border-gray-200">
          <small className="text-ntc-muted block text-[0.75rem] leading-relaxed">
            <strong className="text-ntc-dark-text">Security Notice:</strong> This is a secure enterprise portal. Unauthorized access is strictly prohibited.
          </small>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Login;
