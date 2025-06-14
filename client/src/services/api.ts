import axios from 'axios';
// import { toast } from 'react-toastify';

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

// Handle expired token
// api.interceptors.response.use(
//   res => res,
//   async error => {
//     const originalRequest = error.config;

//     // If token expired and it's the first retry
//     if (
//       error.response?.status === 401 &&
//       !originalRequest._retry &&
//       error.response?.data?.message?.includes('token')
//     ) {
//       originalRequest._retry = true;
//       try {
//         const res = await axios.get(`${API_BASE_URL}/auth/refresh-token`, {
//           withCredentials: true,
//         });

//         const newAccessToken = res.data.token;
//         localStorage.setItem('token', newAccessToken);
//         originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

//         return api(originalRequest); // retry original request
//       } catch (refreshError) {
//         toast('Session expired. Please log in again.');
//         return Promise.reject(refreshError);
//       }
//     }

//     return Promise.reject(error);
//   }
// );

export default api;
