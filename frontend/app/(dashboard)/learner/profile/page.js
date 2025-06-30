'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../../lib/context/auth-context';
import axios from '../../../../lib/axios';

export default function LearnerProfile() {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    interests: '',
    notifications: {
      email: true,
      courseUpdates: true,
      newCourses: true
    }
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeTab, setActiveTab] = useState('personal');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        bio: user.bio || '',
        interests: user.interests || '',
        notifications: {
          email: user.notifications?.email !== false,
          courseUpdates: user.notifications?.courseUpdates !== false,
          newCourses: user.notifications?.newCourses !== false
        }
      });
      setLoading(false);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [name]: checked
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setMessage({ type: '', text: '' });

    try {
      const { data } = await axios.put('/api/learner/profile', {
        name: formData.name,
        bio: formData.bio,
        interests: formData.interests,
        notifications: formData.notifications
      });
      
      // Update the user in the auth context
      updateUser(data.data);
      
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: 'Failed to update profile: ' + (err.response?.data?.message || err.message) 
      });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex justify-center items-center">
        <div className="relative">
          <div className="h-24 w-24 rounded-full border-t-4 border-b-4 border-primary-600 animate-spin"></div>
          <div className="h-16 w-16 rounded-full border-r-4 border-l-4 border-secondary-500 animate-spin absolute top-4 left-4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-purple-300 rounded-full opacity-10 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-80 h-80 bg-blue-300 rounded-full opacity-10 blur-3xl"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-200 rounded-full opacity-5 blur-3xl"></div>

      <div className="max-w-5xl mx-auto">
        {/* Header Section with Avatar and Stats */}
        <div className="relative mb-12 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-purple-600 rounded-3xl opacity-90"></div>
          <div className="relative z-10 px-8 py-10 flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="relative">
              <div className="h-32 w-32 rounded-2xl bg-white/20 backdrop-blur-sm shadow-xl flex items-center justify-center overflow-hidden border-2 border-white/30">
                {user?.profileImage ? (
                  <img 
                    src={user.profileImage}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-6xl font-bold text-white">
                    {user?.name?.charAt(0) || "?"}
                  </span>
                )}
              </div>
              <div className="absolute -bottom-3 -right-3 bg-white rounded-lg shadow-lg p-2">
                <div className="h-8 w-8 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-md flex items-center justify-center text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                {formData.name || 'Your Profile'}
              </h1>
              <p className="mt-2 text-indigo-100 max-w-xl">
                Manage your personal information and preferences to enhance your learning experience
              </p>
              
              <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-4">
                <div className="px-4 py-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                  <div className="text-xs uppercase tracking-wide text-indigo-100">Learning since</div>
                  <div className="text-white font-semibold">{new Date(user?.createdAt || Date.now()).toLocaleDateString('en-US', {year: 'numeric', month: 'short'})}</div>
                </div>
                
                <div className="px-4 py-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                  <div className="text-xs uppercase tracking-wide text-indigo-100">Email verified</div>
                  <div className="text-white font-semibold flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-green-300" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Verified
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
            <button
              onClick={() => setActiveTab('personal')}
              className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                activeTab === 'personal' 
                  ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-purple-500/30' 
                  : 'bg-white/80 text-gray-600 hover:bg-white hover:shadow-md'
              }`}
            >
              Personal Information
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                activeTab === 'notifications' 
                  ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-purple-500/30' 
                  : 'bg-white/80 text-gray-600 hover:bg-white hover:shadow-md'
              }`}
            >
              Notifications
            </button>
          </div>
        </div>
        
        {/* Success/Error Message */}
        {message.text && (
          <div className={`mb-8 rounded-xl p-4 ${
            message.type === 'success' 
              ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 text-emerald-700' 
              : 'bg-gradient-to-r from-rose-50 to-red-50 border border-rose-100 text-rose-700'
          } animate-fade-in-down`}>
            <div className="flex items-center">
              <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                message.type === 'success' ? 'bg-emerald-100' : 'bg-rose-100'
              }`}>
                {message.type === 'success' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
              <div className="ml-4">
                <p className="font-medium">{message.text}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Main Form Container */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-indigo-50">
          <form onSubmit={handleSubmit}>
            {/* Personal Information */}
            <div className={`transition-all duration-300 ease-in-out ${activeTab === 'personal' ? 'block' : 'hidden'}`}>
              <div className="p-8">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  Personal Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="shadow-inner bg-indigo-50/50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent block w-full rounded-xl border-0 p-3 text-gray-800 placeholder-gray-400"
                      placeholder="Your full name"
                      required
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={formData.email}
                      disabled
                      className="shadow-inner bg-indigo-50/50 block w-full rounded-xl border-0 p-3 text-gray-500 opacity-80"
                    />
                    <p className="text-xs text-gray-500 mt-1 ml-1">Email cannot be changed</p>
                  </div>
                  
                  <div className="space-y-1 md:col-span-2">
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                      Bio
                    </label>
                    <textarea
                      name="bio"
                      id="bio"
                      rows={4}
                      value={formData.bio}
                      onChange={handleChange}
                      className="shadow-inner bg-indigo-50/50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent block w-full rounded-xl border-0 p-3 text-gray-800 placeholder-gray-400"
                      placeholder="Tell us a bit about yourself, your background and what you hope to achieve..."
                    />
                  </div>
                  
                  <div className="space-y-1 md:col-span-2">
                    <label htmlFor="interests" className="block text-sm font-medium text-gray-700">
                      Learning Interests
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <textarea
                        name="interests"
                        id="interests"
                        rows={3}
                        value={formData.interests}
                        onChange={handleChange}
                        className="shadow-inner bg-indigo-50/50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent block w-full rounded-xl border-0 pl-10 p-3 text-gray-800 placeholder-gray-400"
                        placeholder="What topics are you interested in learning? (e.g., Data Science, Web Development, Design, Business)"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1 ml-1">Helps us recommend courses suited to your interests</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Notification Preferences */}
            <div className={`transition-all duration-300 ease-in-out ${activeTab === 'notifications' ? 'block' : 'hidden'}`}>
              <div className="p-8">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                    </svg>
                  </div>
                  Notification Preferences
                </h3>
                
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-violet-50 to-indigo-50 rounded-xl p-4 shadow-sm border border-violet-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <label htmlFor="email" className="font-medium text-gray-800">Email Notifications</label>
                        <p className="text-gray-600 text-sm mt-1">Receive email notifications about your account and courses</p>
                      </div>
                      <div className="relative">
                        <input
                          type="checkbox"
                          id="email"
                          name="email"
                          checked={formData.notifications.email}
                          onChange={handleNotificationChange}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-fuchsia-50 to-pink-50 rounded-xl p-4 shadow-sm border border-fuchsia-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <label htmlFor="courseUpdates" className="font-medium text-gray-800">Course Updates</label>
                        <p className="text-gray-600 text-sm mt-1">Be notified when enrolled courses have new content or updates</p>
                      </div>
                      <div className="relative">
                        <input
                          type="checkbox"
                          id="courseUpdates"
                          name="courseUpdates"
                          checked={formData.notifications.courseUpdates}
                          onChange={handleNotificationChange}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 shadow-sm border border-blue-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <label htmlFor="newCourses" className="font-medium text-gray-800">New Courses</label>
                        <p className="text-gray-600 text-sm mt-1">Receive notifications about new courses in your areas of interest</p>
                      </div>
                      <div className="relative">
                        <input
                          type="checkbox"
                          id="newCourses"
                          name="newCourses"
                          checked={formData.notifications.newCourses}
                          onChange={handleNotificationChange}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Form Footer with Submit Button */}
            <div className="bg-gray-50/80 backdrop-blur-sm px-8 py-5 flex justify-end">
              <button
                type="submit"
                disabled={updating}
                className="relative inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-violet-600 to-purple-700 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/40 hover:from-violet-500 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden"
              >
                <span className="absolute w-0 h-0 transition-all duration-300 ease-out bg-white rounded-full group-hover:w-32 group-hover:h-32 opacity-10"></span>
                {updating ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating Profile...
                  </div>
                ) : (
                  <div className="flex items-center">
                    Save Changes
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}