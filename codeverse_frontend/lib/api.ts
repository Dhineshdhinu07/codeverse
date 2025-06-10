import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to handle authentication
api.interceptors.request.use(
  (config) => {
    // Ensure credentials are included
    config.withCredentials = true;
    
    // Log request details
    console.log('Making request:', {
      url: config.url,
      method: config.method,
      withCredentials: config.withCredentials,
      headers: config.headers
    });
    
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => {
    console.log('Response received:', {
      status: response.status,
      url: response.config.url
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
      // You might want to redirect to login or refresh token here
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

export async function submitCode({ problemId, code, language, isCorrect }: { problemId: string, code: string, language: string, isCorrect: boolean }) {
  const res = await api.post("/submissions", { problemId, code, language, isCorrect });
  return res.data;
}

export default api;
