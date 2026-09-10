import axios from "axios";

export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({ baseURL: API });

export const fileUrl = (path) => `${BACKEND_URL}${path}`;

export const getToken = () => localStorage.getItem("andri_admin_token") || "";
export const setToken = (t) => localStorage.setItem("andri_admin_token", t);
export const clearToken = () => localStorage.removeItem("andri_admin_token");

export const adminApi = axios.create({ baseURL: API });
adminApi.interceptors.request.use((config) => {
  config.headers["X-Admin-Token"] = getToken();
  return config;
});
