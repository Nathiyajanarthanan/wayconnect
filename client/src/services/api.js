import axios from 'axios';

// Get base URL from environment variable or default to localhost
let baseURL = process.env.REACT_APP_API_URL;

if (process.env.NODE_ENV === 'production') {
  baseURL = 'https://wayconnect-backend.onrender.com';
} else {
  baseURL = baseURL || 'http://localhost:5000';
}

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to attach Authorization header to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor to handle common errors (like 401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and handle logout logic if necessary
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

export default api;
