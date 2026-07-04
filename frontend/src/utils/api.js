/**
 * In local dev, VITE_API_URL might be undefined, so it defaults to '' (using the Vite proxy).
 * In production (Vercel), you must set VITE_API_URL to the Render backend URL 
 * (e.g., https://my-backend.onrender.com).
 */
export const API_BASE_URL = import.meta.env.VITE_API_URL || '';
