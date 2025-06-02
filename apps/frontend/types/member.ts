export type Member = {
  id: number;
  user: {
    id: number;
    firstname: string;
    lastname: string;
    email: string;
  };
  isContributor: boolean;
  created_at: string;
};
