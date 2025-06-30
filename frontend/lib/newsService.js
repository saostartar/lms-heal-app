import axiosInstance from './axios';

// Admin functions
export const getAllNews = async (page = 1, limit = 10, filters = {}) => {
  try {
    const queryParams = new URLSearchParams({
      page,
      limit,
      ...filters
    });
    
    const response = await axiosInstance.get(`/api/news/admin?${queryParams}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getNewsById = async (id) => {
  try {
    const response = await axiosInstance.get(`/api/news/admin/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createNews = async (formData) => {
  try {
    const response = await axiosInstance.post('/api/news/admin', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateNews = async (id, formData) => {
  try {
    const response = await axiosInstance.put(`/api/news/admin/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteNews = async (id) => {
  try {
    const response = await axiosInstance.delete(`/api/news/admin/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Public functions
export const getPublicNews = async (page = 1, limit = 10, category) => {
  try {
    const queryParams = new URLSearchParams({ page, limit });
    if (category) {
      queryParams.append('category', category);
    }
    
    const response = await axiosInstance.get(`/api/news?${queryParams}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getPublicNewsById = async (id) => {
  try {
    const response = await axiosInstance.get(`/api/news/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching news with ID ${id}:`, error);
    // Return a structured error that's easier to handle
    throw {
      response: error.response,
      message: error.message || 'Failed to fetch article'
    };
  }
};