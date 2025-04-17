import { BACKEND_API } from "../config-global";
// // create .env.local file and add the following vars, it should be in the root of the project and it should be ignored by git:
// export const BACKEND_API = import.meta.env.VITE_BACKEND_API;

export const REGISTER_API = `${BACKEND_API}/register`;
export const UPLOAD_API = `${BACKEND_API}/upload`;
export const JOBS_API = `${BACKEND_API}/jobs`;
export const LOGIN_API = `${BACKEND_API}/login`;
export const CATEGORIES_API = `${BACKEND_API}/categories`;
export const SUBCATEGORIES_API = `${BACKEND_API}/subcategories`;
export const PROMPTS_API = `${BACKEND_API}/retrieve_prompts`;
export const TRANSCRIPTION_API = `${BACKEND_API}/jobs/transcription`;
