export interface Community {
  id: string;
  name: string;
  description?: string;
  isFree?: boolean;
  ownerId: string;
  members: string[];
  createdAt: Date;
}
