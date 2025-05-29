export type User = {
  id: number;
  email: string;
  firstname: string;
  lastname: string;
  pseudo: string;
  gender?: string;
  isActive?: boolean;
  created_at?: string;
  updated_at?: string;
};
