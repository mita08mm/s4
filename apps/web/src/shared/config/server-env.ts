import "server-only";

/**
 * Server-side configuration. Read at request time, so the same image works in
 * any environment. Never import this module from a Client Component.
 */
export const serverEnv = {
  /** Base URL of the API inside the Docker network (e.g. http://api:8000). */
  apiInternalUrl: process.env.API_INTERNAL_URL ?? "http://localhost:8000",
};
