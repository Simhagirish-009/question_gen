import axios from "axios";

const API = axios.create({
  baseURL: "https://question-gen-v3cj.onrender.com",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
