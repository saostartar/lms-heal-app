import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token
instance.interceptors.request.use(
  (config) => {
    let token;

    // Cek jika kode berjalan di SERVER (saat build)
    if (typeof window === 'undefined') {
      token = process.env.API_AUTH_TOKEN;
    }
    // Cek jika kode berjalan di BROWSER (client-side)
    else {
      token = localStorage.getItem('token');
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token expiration (hanya untuk client-side)
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // Penanganan error 401 hanya perlu dilakukan di browser untuk redirect
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        // Redirect ke halaman login jika token tidak valid/kadaluarsa
        window.location.href = '/login?session=expired';
      }
    }
    
    // Log error untuk debugging di server dan client
    console.error('API Error:', error.response?.data?.message || error.message);
    return Promise.reject(error);
  }
);

export default instance;