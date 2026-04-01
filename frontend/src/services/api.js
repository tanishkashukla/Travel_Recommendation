import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.trim() || "http://localhost:5000";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

export function recommendTravel(payload) {
  // Contract endpoint: POST http://localhost:5000/recommend
  return api.post("/recommend", payload).then((r) => r.data);
}

