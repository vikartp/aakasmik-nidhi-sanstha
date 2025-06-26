import axios from 'axios';

const isLocalhost = window.location.hostname === 'localhost';

const API_BASE_URL = isLocalhost
  ? 'http://localhost:5000'
  : 'https://aakasmik-nidhi-backend.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Always set the latest accessToken from localStorage before each request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  } else {
    delete config.headers['Authorization'];
  }
  return config;
});

export default api;
