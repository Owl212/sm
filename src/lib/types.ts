export interface Student {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  date_of_birth: string | null;
  program: string | null;
  year: number;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  created_at: string;
}

export interface StudentFormData {
  first_name: string;
  last_name: string;
  email: string;
  date_of_birth?: string;
  program?: string;
  year?: number;
}
