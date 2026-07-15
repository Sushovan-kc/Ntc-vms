import React, { useState, useEffect } from 'react'; 
import { useNavigate, Link } from 'react-router-dom'; 
import { useAuth } from '../../context/AuthContext'; 
// ✅ Hook to fetch dynamically populated backend branches
import { useBranches } from '../../context/BranchContext'; 
import apiClient from '../../api/client'; 
import { MapPin, Calendar, ClipboardCheck, AlertCircle } from 'lucide-react'; 

const RequestForm = () => { 
  const navigate = useNavigate(); 
  const { user } = useAuth(); 
  // ✅ Extract global branches array from Context
  const { branches } = useBranches(); 

  const [startLocation, setStartLocation] = useState(''); 
  const [endLocation, setEndLocation] = useState(''); 
  const [startTime, setStartTime] = useState(''); 
  const [endTime, setEndTime] = useState(''); 
  const [purpose, setPurpose] = useState(''); 
  const [errorBanner, setErrorBanner] = useState(''); 
  const [successBanner, setSuccessBanner] = useState(''); 
  const [isSubmitting, setIsSubmitting] = useState(false); 
  const [showPickupDropdown, setShowPickupDropdown] = useState(false); 
  const [showDestDropdown, setShowDestDropdown] = useState(false); 

  useEffect(() => { 
    if (user?.userbranch) { 
      setStartLocation(user.userbranch); 
    } else if (user?.branch && branches.length > 0) { 
      // ✅ Look up string name from dynamic global branch set using user's branch ID
      const branchObj = branches.find(b => b.id === Number(user.branch) || b.id === user.branch); 
      setStartLocation(branchObj ? branchObj.name : user.branch); 
    } 
  }, [user, branches]); 

  const handleSubmit = async (e) => { 
    e.preventDefault(); 
    setErrorBanner(''); 
    setSuccessBanner(''); 
    
    if (!user) { 
      setErrorBanner('Session invalid. Please logout and login again.'); 
      return; 
    } 
    if (!startLocation || !endLocation || !startTime || !purpose) { 
      setErrorBanner('Please fill out all required booking form fields.'); 
      return; 
    } 
    
    setIsSubmitting(true); 
    
    const payload = { 
      start_location: startLocation.trim(), 
      end_location: endLocation.trim(), 
      start_time: startTime, 
      end_time: endTime || null, 
      purpose: purpose.trim() 
    }; 
    
    try { 
      const response = await apiClient.post('api/booking/new/', payload); 
      const data = response.data; 
      setSuccessBanner(data.message || 'Booking successful. Awaiting system admin approval.'); 
      setEndLocation(''); 
      setStartTime(''); 
      setEndTime(''); 
      setPurpose(''); 
      setTimeout(() => navigate('/dashboard/my-requests'), 2500); 
    } catch (error) { 
      console.error('❌ Booking Creation Failure:', error); 
      const serverErrorMessage = error.error || error.message || 'Server rejected the request.'; 
      setErrorBanner(serverErrorMessage); 
    } finally { 
      setIsSubmitting(false); 
    } 
  }; 

  return ( 
    <div className="w-full max-w-2xl bg-white/95 backdrop-blur-md border border-white/50 p-6 md:p-8 rounded-2xl shadow-xs font-sans mt-4 mx-auto"> 
      {errorBanner && ( 
        <div className="mb-6 p-4 bg-ntc-danger/10 border border-ntc-danger/20 text-ntc-danger rounded-xl text-sm font-medium flex items-center gap-2"> 
          <AlertCircle size={18} className="shrink-0" /> 
          <span>{errorBanner}</span> 
        </div> 
      )} 
      {successBanner && ( 
        <div className="mb-6 p-4 bg-ntc-success/10 border border-ntc-success/20 text-ntc-success rounded-xl text-sm font-medium flex items-center gap-2"> 
          <ClipboardCheck size={18} className="shrink-0" /> 
          <span>{successBanner}</span> 
        </div> 
      )} 
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-5"> 
        {/* Pickup Location Field */}
        <div className="relative"> 
          <label className="block text-sm font-semibold text-ntc-dark-text mb-1.5 flex items-center gap-1"> 
            <MapPin size={14} className="text-ntc-blue" /> Pickup Location * 
          </label> 
          <input 
            type="text" 
            className="w-full p-3 border border-gray-300 rounded-lg text-sm transition-all duration-200 outline-none focus:border-ntc-blue focus:ring-4 focus:ring-ntc-blue/15 text-gray-900" 
            placeholder="Select branch or type custom location..." 
            value={startLocation} 
            onChange={(e) => setStartLocation(e.target.value)} 
            onFocus={() => setShowPickupDropdown(true)} 
            onBlur={() => setTimeout(() => setShowPickupDropdown(false), 200)} 
            required 
          /> 
          {showPickupDropdown && ( 
            <ul className="absolute left-0 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto z-50 divide-y divide-gray-50"> 
              {branches && branches.filter(b => b.name.toLowerCase().includes(startLocation.toLowerCase())).map(b => ( 
                <li key={b.id}> 
                  <button 
                    type="button" 
                    className="w-full text-left px-4 py-2.5 text-sm text-ntc-dark-text hover:bg-ntc-gray/60 transition-colors duration-150" 
                    onMouseDown={() => setStartLocation(b.name)} 
                  > 
                    {b.name} 
                  </button> 
                </li> 
              ))} 
              {(!branches || branches.filter(b => b.name.toLowerCase().includes(startLocation.toLowerCase())).length === 0) && ( 
                <li className="px-4 py-2.5 text-xs text-ntc-muted italic bg-ntc-gray/30"> 
                  Custom location entry detected. Press enter to apply. 
                </li> 
              )} 
            </ul> 
          )} 
        </div> 

        {/* Destination Location Field */}
        <div className="relative"> 
          <label className="block text-sm font-semibold text-ntc-dark-text mb-1.5 flex items-center gap-1"> 
            <MapPin size={14} className="text-ntc-danger" /> Destination * 
          </label> 
          <input 
            type="text" 
            className="w-full p-3 border border-gray-300 rounded-lg text-sm transition-all duration-200 outline-none focus:border-ntc-blue focus:ring-4 focus:ring-ntc-blue/15 text-gray-900" 
            placeholder="Select branch or type target destination..." 
            value={endLocation} 
            onChange={(e) => setEndLocation(e.target.value)} 
            onFocus={() => setShowDestDropdown(true)} 
            onBlur={() => setTimeout(() => setShowDestDropdown(false), 200)} 
            required 
          /> 
          {showDestDropdown && ( 
            <ul className="absolute left-0 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto z-50 divide-y divide-gray-50"> 
              {branches && branches.filter(b => b.name.toLowerCase().includes(endLocation.toLowerCase())).map(b => ( 
                <li key={b.id}> 
                  <button 
                    type="button" 
                    className="w-full text-left px-4 py-2.5 text-sm text-ntc-dark-text hover:bg-ntc-gray/60 transition-colors duration-150" 
                    onMouseDown={() => setEndLocation(b.name)} 
                  > 
                    {b.name} 
                  </button> 
                </li> 
              ))} 
              {(!branches || branches.filter(b => b.name.toLowerCase().includes(endLocation.toLowerCase())).length === 0) && ( 
                <li className="px-4 py-2.5 text-xs text-ntc-muted italic bg-ntc-gray/30"> 
                  Custom destination entry detected. Press enter to apply. 
                </li> 
              )} 
            </ul> 
          )} 
        </div> 

        {/* Remaining Form Layout Elements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> 
          <div> 
            <label className="block text-sm font-semibold text-ntc-dark-text mb-1.5 flex items-center gap-1"> 
              <Calendar size={14} className="text-ntc-muted" /> Scheduled Start Time * 
            </label> 
            <input type="datetime-local" className="w-full p-3 border border-gray-300 rounded-lg text-sm transition-all duration-200 outline-none focus:border-ntc-blue focus:ring-4 focus:ring-ntc-blue/15 text-gray-900" value={startTime} onChange={(e) => setStartTime(e.target.value)} required /> 
          </div> 
          <div> 
            <label className="block text-sm font-semibold text-ntc-dark-text mb-1.5 flex items-center gap-1"> 
              <Calendar size={14} className="text-ntc-muted" /> Expected End Time (Optional) 
            </label> 
            <input type="datetime-local" className="w-full p-3 border border-gray-300 rounded-lg text-sm transition-all duration-200 outline-none focus:border-ntc-blue focus:ring-4 focus:ring-ntc-blue/15 text-gray-900" value={endTime} onChange={(e) => setEndTime(e.target.value)} /> 
          </div> 
        </div> 

        <div> 
          <label className="block text-sm font-semibold text-ntc-dark-text mb-1.5"> Travel Purpose / Justification * </label> 
          <textarea className="w-full p-3 border border-gray-300 rounded-lg text-sm transition-all duration-200 outline-none focus:border-ntc-blue focus:ring-4 focus:ring-ntc-blue/15 text-gray-900 resize-none" placeholder="Provide explicit operational reasons for vehicle allocation..." rows="3" value={purpose} onChange={(e) => setPurpose(e.target.value)} required /> 
        </div> 

        {/* ✅ Fixed: Wrapped text in valid buttons and navigation links */}
        <div className="flex flex-col gap-2"> 
          <button 
            type="submit" 
            disabled={isSubmitting} 
            className="w-full bg-ntc-blue text-white py-3 px-5 rounded-xl font-bold text-sm tracking-wide transition-all duration-300 hover:bg-ntc-blue-hover focus:bg-ntc-blue-hover active:scale-98 hover:shadow-lg disabled:opacity-50 disabled:pointer-events-none select-none text-center"
          > 
            {isSubmitting ? 'Processing Transaction...' : 'Submit Trip Request'} 
          </button> 
          
          <Link 
            to="/dashboard" 
            className="w-full bg-gray-100 text-gray-700 py-3 px-5 rounded-xl font-bold text-sm tracking-wide transition-all duration-200 hover:bg-gray-200 active:scale-98 text-center"
          > 
            Back to Dashboard 
          </Link> 
        </div> 
      </form> 
    </div> 
  ); 
}; 

export default RequestForm;
