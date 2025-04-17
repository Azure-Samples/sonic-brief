import * as yup from "yup";

// Define schema for Vite's built-in env variables
// These are always available and typed by Vite itself
const viteEnvSchema = yup.object({
  VITE_BASE_URL: yup.string().default("/").required("VITE_BASE_URL is required"),
});

// Validate and cast Vite's built-in environment variables
// Note: Vite guarantees these exist, so casting is mainly for type consistency
const parsedViteEnv = viteEnvSchema.cast(import.meta.env);

// Define the combined type for the validated environment variables
type ParsedViteEnv = yup.InferType<typeof viteEnvSchema>;
type ParsedEnv =  ParsedViteEnv;

// Export the validated and merged environment variables
export const env: ParsedEnv = {
  ...parsedViteEnv,
};