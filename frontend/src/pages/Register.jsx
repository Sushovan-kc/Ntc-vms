import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import FormInput from '../components/FormInput';
import PasswordInput from '../components/PasswordInput';
import RoleDropdown from '../components/RoleDropdown';
import Loader from '../components/Loader';
import registerservice from '../api/services/registerservice';

const Register = () => {
  const navigate = useNavigate();
  const { register } = registerservice;

  const initialFormState = {
    username: '', 
    email: '', 
    password: '',
    confirm_password: '', 
    first_name: '', 
    last_name: '', 
    requested_role: '', 
    phone_number: ''
  };

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (e) => {
    if (e && e.target) {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
      if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    } else if (typeof e === 'string') {
      setFormData(prev => ({ ...prev, requested_role: e }));
      if (errors.requested_role) setErrors(prev => ({ ...prev, requested_role: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (formData.password !== formData.confirm_password) newErrors.confirm_password = 'Passwords do not match';
    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
    if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required';
    if (!formData.requested_role) newErrors.requested_role = 'Please select a role';
    if (!formData.phone_number.trim()) newErrors.phone_number = 'Phone number is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrors({});
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    // 🟢 SAFE CONVERSION: Maps 'Employee' -> 'employee', 'Driver' -> 'driver', 'Admin' -> 'admin'
    const finalRole = formData.requested_role ? formData.requested_role.toLowerCase() : null;

    const payload = {
      username: formData.username.trim(),
      email: formData.email.trim(),
      password: formData.password,
      first_name: formData.first_name.trim(),
      last_name: formData.last_name.trim(),
      requested_role: finalRole, // Sends exact match to Django
      phone_number: formData.phone_number.trim()
    };

    try {
      const data = await register(payload);
      setSuccessMsg(data.message || 'Registration completed successfully!');
      setFormData(initialFormState);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      console.error("❌ Registration Error:", err);
      
      // If Django returns precise validation objects
      if (typeof err === 'object' && err !== null) {
        const formattedErrors = {};
        Object.keys(err).forEach((key) => {
          formattedErrors[key] = Array.isArray(err[key]) ? err[key] : err[key];
        });
        setErrors(formattedErrors);
      } else {
        setErrors({ general: err || 'Something went wrong during registration.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="bg-white rounded-xl shadow-[0_10px_30px_rgba(0,56,147,0.08)] w-full p-8 lg:p-10 mx-auto max-w-[95%]">
        <h2 className="text-[#212529] font-bold text-[1.75rem] mb-6 text-center leading-tight">Create Account</h2>
        
        {successMsg && (
          <div className="mb-4 p-3 bg-green-50 border border-emerald-500/20 text-emerald-700 rounded-lg text-sm font-medium">
            {successMsg}
          </div>
        )}
        {errors.general && (
          <div className="mb-4 p-3 bg-red-50 border border-red-500/20 text-[#dc3545] rounded-lg text-sm font-medium">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
            <FormInput label="First Name" name="first_name" value={formData.first_name} onChange={handleChange} error={errors.first_name} required />
            <FormInput label="Last Name" name="last_name" value={formData.last_name} onChange={handleChange} error={errors.last_name} required />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
            <FormInput label="Username" name="username" value={formData.username} onChange={handleChange} error={errors.username} required />
            <FormInput label="Phone Number" name="phone_number" value={formData.phone_number} onChange={handleChange} error={errors.phone_number} required />
          </div>
          
          <FormInput label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} error={errors.email} required />
          
          <div className="mb-4">
            <RoleDropdown value={formData.requested_role} onChange={handleChange} error={errors.requested_role} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
            <PasswordInput label="Password" name="password" value={formData.password} onChange={handleChange} error={errors.password} required />
            <PasswordInput label="Confirm Password" name="confirm_password" value={formData.confirm_password} onChange={handleChange} error={errors.confirm_password} required />
          </div>

          <button 
            type="submit" 
            className="w-full mt-4 block bg-[#003893] text-white p-3 rounded-lg font-semibold transition-all duration-300 hover:bg-[#002663] focus:bg-[#002663] active:bg-[#002663] hover:shadow-[0_4px_12px_rgba(0,56,147,0.2)] disabled:opacity-50 text-center" 
            disabled={isLoading}
          >
            {isLoading ? <Loader text="Registering..." /> : "Register Account"}
          </button>
          
          <Link 
            to="/"
            className="w-full mt-2 block bg-gray-100 text-gray-700 p-3 rounded-lg font-semibold transition-all duration-200 hover:bg-gray-200 text-center text-sm"
          >
            Already have an account? Log In
          </Link>
        </form>
      </div>
    </AuthLayout>
  );
};

export default Register;
