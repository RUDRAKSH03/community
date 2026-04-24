import axios from 'axios'

const api = axios.create({
  baseURL: "https://community-backend-8pqm.onrender.com",
  timeout: 15000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API ERROR:", error);
    const data = error?.response?.data;
    let message = data?.message || error.message || 'Request failed';
    if (data?.details && Array.isArray(data.details)) {
      message = `${message}: ${data.details.join(', ')}`;
    }
    return Promise.reject(new Error(message));
  },
)

export default api

