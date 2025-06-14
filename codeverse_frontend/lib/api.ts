import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor
api.interceptors.request.use(
  (config) => {
    // Log request details
    console.log('Making request to:', `${API_URL}${config.url}`, {
      method: config.method,
      headers: config.headers,
      withCredentials: config.withCredentials,
      data: config.data
    });

    // Ensure credentials are included
    config.withCredentials = true;
    
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor
api.interceptors.response.use(
  (response) => {
    // Log successful response
    console.log('Response received:', {
      status: response.status,
      url: response.config.url,
      hasSetCookie: !!response.headers['set-cookie']
    });

    return response;
  },
  (error) => {
    if (error.code === 'ERR_NETWORK') {
      console.error('Network Error: Please make sure the backend server is running');
      throw new Error('Unable to connect to the server. Please check if the backend is running.');
    }
    
    // Handle authentication errors
    if (error.response?.status === 401) {
      console.error('Authentication error:', {
        url: error.config?.url,
        message: error.response?.data?.error || 'Authentication failed'
      });
      throw new Error('Authentication failed. Please log in again.');
    }
    
    // Log detailed error information
    console.error('Response error:', {
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method
    });
    
    return Promise.reject(error);
  }
);

export default api;
