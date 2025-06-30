'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from '../axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  // Check if user is logged in on initial load
  useEffect(() => {
    const checkUserLoggedIn = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const { data } = await axios.get('/api/auth/me');
          setUser(data.data);
        }
      } catch (error) {
        console.error('Session verification error:', error);
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
      } finally {
        setLoading(false);
      }
    };
    
    checkUserLoggedIn();
  }, []);
  
  // Login function
  const login = async (email, password) => {
    try {
      console.log('Attempting login to:', axios.defaults.baseURL);
      const { data } = await axios.post('/api/auth/login', {
        email,
        password
      });
      
      if (data.success) {
        localStorage.setItem('token', data.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        setUser(data.user);
        
        console.log('Login successful, user role:', data.user.role);
        
        // Redirect based on user role
        if (data.user.role === 'admin') {
          console.log('Redirecting to admin dashboard');
          // Ensure this route exists in your Next.js app structure
          router.push('/admin/dashboard');
        } else if (data.user.role === 'instructor') {
          router.push('/instructor/courses');
        } else {
          router.push('/learner/courses');
        }
        
        return { success: true };
      }
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };
  
  // Register function
  const register = async (userData) => {
    try {
      const { data } = await axios.post('/api/auth/register', userData);
      
      if (data.success) {
        localStorage.setItem('token', data.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        setUser(data.user);
        
        // Redirect based on user role
        if (data.user.role === 'instructor') {
          router.push('/instructor/courses');
        } else {
          router.push('/learner/courses');
        }
        
        return { success: true };
      }
    } catch (error) {
      console.error('Registration error:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      };
    }
  };
  
  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    router.push('/');
  };
  
  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);