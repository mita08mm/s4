/** Class as returned by the API (`ClassResponse`). */
export type SchoolClass = {
  id: string;
  code: string;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};
