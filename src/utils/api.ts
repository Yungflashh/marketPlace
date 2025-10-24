// src/utils/api.ts
import axios from 'axios';

// Use environment variable for base URL
// In .env file, you can set REACT_APP_API_URL=http://localhost:9000
const API_BASE_URL = "https://marketplc-be.onrender.com"

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Optionally set token dynamically
export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export default api;
