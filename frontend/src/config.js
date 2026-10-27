const PRODUCTION_API = "https://rate-kr-8ym4-gb35elu9m-khuzaima-s-projects2.vercel.app/api";
const LOCAL_API = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

export const API_URL = import.meta.env.PROD ? PRODUCTION_API : LOCAL_API;