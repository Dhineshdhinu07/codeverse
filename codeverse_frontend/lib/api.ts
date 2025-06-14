import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Flag to track refresh attempts
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any = null, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Add request interceptor
api.interceptors.request.use(
  (config) => {
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
    return response;
  },
  (error) => {
    // Log the actual error object
    console.error('Response error:', error);

    // Create a more detailed error object
    const errorDetails = {
      message: error?.message || 'Unknown error',
      status: error?.response?.status,
      data: error?.response?.data,
      code: error?.code,
      config: {
        url: error?.config?.url,
        method: error?.config?.method,
        baseURL: error?.config?.baseURL
      }
    };

    // If it's a network error
    if (error?.message === 'Network Error') {
      return Promise.reject(new Error('Unable to connect to the server. Please check your internet connection.'));
    }

    // If it's a timeout error
    if (error?.code === 'ECONNABORTED') {
      return Promise.reject(new Error('Request timed out. Please try again.'));
    }

    // If we have a response with an error message
    if (error?.response?.data?.error) {
      return Promise.reject(new Error(error.response.data.error));
    }

    // If we have a status code but no error message
    if (error?.response?.status) {
      return Promise.reject(new Error(`Request failed with status ${error.response.status}`));
    }

    // Default error
    return Promise.reject(new Error(errorDetails.message));
  }
);

export default api;
