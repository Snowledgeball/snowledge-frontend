export type Vote = {
  id: number;
  title: string;
  description: string;
  format?: string;
  comments?: string;
  isContributor?: boolean;
  createdAt: Date;
  updatedAt: Date;
};
