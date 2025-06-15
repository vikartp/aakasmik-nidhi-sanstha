import axios from 'axios';

const isLocalhost = window.location.hostname === 'localhost';

const API_BASE_URL = isLocalhost
  ? 'http://localhost:5000'
  : 'https://aakasmik-nidhi-backend.onrender.com';
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // for cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
