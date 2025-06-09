import axios from "axios"

const isLocalhost = window.location.hostname === "localhost"

const API_BASE_URL = isLocalhost ? "http://localhost:5000" : "https://aakasmik-nidhi-backend.onrender.com"
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// ✅ Attach token before every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// ✅ Handle expired/invalid tokens globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response &&
      error.response.status === 401 &&
      error.response.data?.message?.includes("token")
    ) {
      alert("Your session has expired. Please log in again.")
    }
    return Promise.reject(error)
  }
)

export default api