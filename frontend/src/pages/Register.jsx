import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    contactName: '',
    contactPhone: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Basic Validation
    if (!formData.name || !formData.email || !formData.password || !formData.contactName || !formData.contactPhone) {
      setError('Please fill in all fields.');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }
    
    // Formatting data for backend structure constraints
    const payload = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      emergencyContacts: [
        {
          name: formData.contactName,
          phone: formData.contactPhone
        }
      ]
    };

    try {
      const response = await api.post('/auth/register', payload);
      // Optional: automatically login or redirect to login
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full space-y-8 bg-white p-10 rounded-3xl shadow-2xl border border-gray-100">
        <div>
          <div className="mx-auto h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center">
             <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
            Create an Account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-500">
            Join SafeRoute and navigate with peace of mind.
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/></svg>
              <p className="text-sm font-medium text-red-700">{error}</p>
            </div>
          )}
          
          <div className="space-y-6">
            <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                <h3 className="text-sm font-bold text-gray-800 mb-4 uppercase tracking-wider">Personal Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                    <input
                      name="name"
                      type="text"
                      required
                      placeholder="Jane Doe"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm shadow-sm bg-white"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                        <input
                          name="email"
                          type="email"
                          required
                          placeholder="you@example.com"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm shadow-sm bg-white"
                          value={formData.email}
                          onChange={handleChange}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                        <input
                          name="password"
                          type="password"
                          required
                          placeholder="Min 6 characters"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm shadow-sm bg-white"
                          value={formData.password}
                          onChange={handleChange}
                        />
                      </div>
                  </div>
                </div>
            </div>

            <div className="p-5 bg-red-50 rounded-2xl border border-red-100">
              <h3 className="text-sm font-bold text-red-800 mb-4 uppercase tracking-wider flex items-center">
                 <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"></path></svg>
                 Emergency Contact
              </h3>
              <p className="text-xs text-red-600 mb-4">This person will receive an SMS and your live GPS location if you trigger the SOS alarm.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-red-900 mb-1">Contact Name</label>
                    <input
                      name="contactName"
                      type="text"
                      required
                      placeholder="Family Member/Friend"
                      className="w-full px-4 py-3 border border-red-200 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm shadow-sm bg-white"
                      value={formData.contactName}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-red-900 mb-1">Contact Phone</label>
                    <input
                      name="contactPhone"
                      type="tel"
                      required
                      placeholder="+91..."
                      className="w-full px-4 py-3 border border-red-200 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm shadow-sm bg-white"
                      value={formData.contactPhone}
                      onChange={handleChange}
                    />
                  </div>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white shadow-lg transform transition-all duration-200 ${
                loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-0.5 hover:shadow-xl'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            >
              {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Creating Account...
                 </span>
              ) : 'Open Account'}
            </button>
          </div>
        </form>
        
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">
              Sign in securely
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
