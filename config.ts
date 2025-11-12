// This file acts as the single source of truth for the backend API URL.
// All fetch requests in the frontend should use this constant.

export const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL?.trim())
  ? import.meta.env.VITE_API_URL.trim()
  : 'https://qssun-backend-api.onrender.com/api';
