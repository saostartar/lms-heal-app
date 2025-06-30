"use client";

import { useState, useEffect } from "react";
import axios from "@/lib/axios";
import { toast } from "react-hot-toast";
import { useAuth } from "@/lib/context/auth-context";
import { Loader2 } from "lucide-react";

export default function InstructorProfile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bio: "",
    credentials: "",
    socialLinks: {
      website: "",
      twitter: "",
      linkedin: "",
      youtube: ""
    },
    notifications: {
      email: true,
      courseUpdates: true,
      studentMessages: true
    }
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get("/api/instructor/profile");
        
        // Pre-populate the form with the user data
        setFormData({
          name: data.data.name || "",
          email: data.data.email || "",
          bio: data.data.bio || "",
          credentials: data.data.credentials || "",
          socialLinks: {
            website: data.data.socialLinks?.website || "",
            twitter: data.data.socialLinks?.twitter || "",
            linkedin: data.data.socialLinks?.linkedin || "",
            youtube: data.data.socialLinks?.youtube || ""
          },
          notifications: {
            email: data.data.notifications?.email ?? true,
            courseUpdates: data.data.notifications?.courseUpdates ?? true,
            studentMessages: data.data.notifications?.studentMessages ?? true
          }
        });
      } catch (err) {
        toast.error(
          "Failed to load profile: " + (err.response?.data?.message || err.message)
        );
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSocialLinkChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      socialLinks: {
        ...formData.socialLinks,
        [name]: value
      }
    });
  };

  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      notifications: {
        ...formData.notifications,
        [name]: checked
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);
      await axios.put("/api/instructor/profile", formData);
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(
        "Failed to update profile: " + (err.response?.data?.message || err.message)
      );
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (limit to 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image file size must be less than 2MB");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("profileImage", file);
      
      setUpdating(true);
      await axios.post("/api/instructor/profile/image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      toast.success("Profile image updated successfully!");
      // Refresh the page to show the new image
      window.location.reload();
    } catch (err) {
      toast.error(
        "Failed to upload image: " + (err.response?.data?.message || err.message)
      );
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="pb-12">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-50 rounded-full blur-3xl opacity-70"></div>
        <div className="absolute top-1/2 -left-48 w-96 h-96 bg-secondary-50 rounded-full blur-3xl opacity-70"></div>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          <div className="h-8 w-1 bg-gradient-to-b from-primary-500 to-secondary-500 rounded-full mr-2"></div>
          Instructor Profile
        </h1>
        <p className="text-gray-600">Manage your public profile and account settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-lg">
            <div className="h-2 bg-gradient-to-r from-primary-500 to-primary-600"></div>
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Profile Overview</h2>
              
              <div className="flex flex-col items-center mb-6">
                <div className="relative">
                  <div className="h-24 w-24 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center text-white text-3xl font-bold shadow-md mb-4">
                    {user?.profileImage ? (
                      <img 
                        src={user.profileImage} 
                        alt={user.name} 
                        className="h-24 w-24 rounded-full object-cover"
                      />
                    ) : (
                      user?.name?.charAt(0) || "I"
                    )}
                  </div>
                  <label htmlFor="profile-image" className="absolute bottom-3 right-0 bg-white rounded-full p-1.5 shadow-md cursor-pointer hover:bg-gray-50 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </label>
                  <input 
                    type="file" 
                    id="profile-image" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={updating}
                  />
                </div>
                <h3 className="text-xl font-bold text-gray-800">{formData.name}</h3>
                <p className="text-primary-600 font-medium">Instructor</p>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="text-gray-600 font-medium">Email</p>
                    <p className="text-gray-800">{formData.email}</p>
                  </div>
                </div>
                
                {formData.bio && (
                  <div className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <div>
                      <p className="text-gray-600 font-medium">Bio</p>
                      <p className="text-gray-800 line-clamp-3">{formData.bio}</p>
                    </div>
                  </div>
                )}
              </div>
              
              <p className="text-gray-500 text-xs mt-6">
                Your profile information will be displayed on your course pages and is visible to students.
              </p>
            </div>
          </div>
        </div>
        
        {/* Edit Profile Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-lg">
            <div className="h-2 bg-gradient-to-r from-primary-500 to-primary-600"></div>
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6 text-gray-800">Edit Profile</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-800 border-b border-gray-100 pb-2">Personal Information</h3>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="text-black shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={formData.email}
                        className="text-black shadow-sm bg-gray-50 block w-full sm:text-sm border-gray-300 rounded-md cursor-not-allowed"
                        disabled
                      />
                      <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                    </div>
                    
                    <div>
                      <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                        Bio
                      </label>
                      <textarea
                        name="bio"
                        id="bio"
                        rows={4}
                        value={formData.bio}
                        onChange={handleChange}
                        className="text-black shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="Tell students about yourself, your expertise, and teaching experience..."
                      />
                      <p className="mt-1 text-xs text-gray-500">Write a brief description about yourself that will appear on your course pages (max 500 characters).</p>
                    </div>
                    
                    <div>
                      <label htmlFor="credentials" className="block text-sm font-medium text-gray-700 mb-1">
                        Credentials
                      </label>
                      <input
                        type="text"
                        name="credentials"
                        id="credentials"
                        value={formData.credentials}
                        onChange={handleChange}
                        className="text-black shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="e.g. PhD in Computer Science, Microsoft Certified Trainer"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Social Links */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-800 border-b border-gray-100 pb-2">Social Links</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                        Website URL
                      </label>
                      <input
                        type="url"
                        name="website"
                        id="website"
                        value={formData.socialLinks.website}
                        onChange={handleSocialLinkChange}
                        className="text-black shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="https://yourwebsite.com"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700 mb-1">
                        LinkedIn
                      </label>
                      <input
                        type="url"
                        name="linkedin"
                        id="linkedin"
                        value={formData.socialLinks.linkedin}
                        onChange={handleSocialLinkChange}
                        className="text-black shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="https://linkedin.com/in/yourprofile"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="twitter" className="block text-sm font-medium text-gray-700 mb-1">
                        Twitter
                      </label>
                      <input
                        type="url"
                        name="twitter"
                        id="twitter"
                        value={formData.socialLinks.twitter}
                        onChange={handleSocialLinkChange}
                        className="text-black shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="https://twitter.com/yourusername"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="youtube" className="block text-sm font-medium text-gray-700 mb-1">
                        YouTube
                      </label>
                      <input
                        type="url"
                        name="youtube"
                        id="youtube"
                        value={formData.socialLinks.youtube}
                        onChange={handleSocialLinkChange}
                        className="text-black shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="https://youtube.com/c/yourchannel"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Notification Preferences */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-800 border-b border-gray-100 pb-2">Notification Preferences</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="email"
                          name="email"
                          type="checkbox"
                          checked={formData.notifications.email}
                          onChange={handleNotificationChange}
                          className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="email" className="font-medium text-gray-700">Email Notifications</label>
                        <p className="text-gray-500">Receive email notifications about your account and courses.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="courseUpdates"
                          name="courseUpdates"
                          type="checkbox"
                          checked={formData.notifications.courseUpdates}
                          onChange={handleNotificationChange}
                          className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="courseUpdates" className="font-medium text-gray-700">Course Updates</label>
                        <p className="text-gray-500">Receive notifications about course-related events and system updates.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="studentMessages"
                          name="studentMessages"
                          type="checkbox"
                          checked={formData.notifications.studentMessages}
                          onChange={handleNotificationChange}
                          className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="studentMessages" className="font-medium text-gray-700">Student Messages</label>
                        <p className="text-gray-500">Receive notifications when students send you messages or ask questions.</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={updating}
                    className="btn btn-primary relative overflow-hidden group"
                  >
                    {updating ? (
                      <span className="flex items-center">
                        <Loader2 className="animate-spin mr-2 h-4 w-4" />
                        Saving...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        Save Changes
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}