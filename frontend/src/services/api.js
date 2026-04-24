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
    const message = error?.response?.data?.message || error.message || 'Request failed'
    return Promise.reject(new Error(message))
  },
)

export default api

