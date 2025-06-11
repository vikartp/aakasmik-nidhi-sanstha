export interface User {
  _id: string;
  name: string;
  fatherName: string;
  mobile: string;
  role: UserRole;
  email?: string;
  occupation?: string;
  createdAt?: string; // ISO date string
}

export type UserRole = 'member' | 'admin' | 'superadmin';
