import axios from "axios";

// Uvek imamo rezervni URL ako je env promenljiva prazna pri build-u
export const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL || "https://projekat-jcts.vercel.app";

export const API = `${BACKEND_URL.replace(/\/$/, "")}/api`;

export const getToken = () => localStorage.getItem("andri_admin_token") || "";
export const setToken = (t) => localStorage.setItem("andri_admin_token", t);
export const clearToken = () => localStorage.removeItem("andri_admin_token");

// Običan API klijent
export const api = axios.create({
  baseURL: API,
  headers: {
    "Content-Type": "application/json",
  },
});

// Admin API klijent sa presretačem za token
export const adminApi = axios.create({
  baseURL: API,
  headers: {
    "Content-Type": "application/json",
  },
});

// Kada šaljemo FormData (upload fajla), uklanjamo ručno postavljeni
// "application/json" header da bi axios/browser sam postavio ispravan
// "multipart/form-data; boundary=..." header — bez ovoga backend ne može
// da pročita fajl i vraća 422.
adminApi.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers["X-Admin-Token"] = token;
  }
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }
  return config;
});

api.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }
  return config;
});

export const fileUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${BACKEND_URL}${path.startsWith("/") ? "" : "/"}${path}`;
};
