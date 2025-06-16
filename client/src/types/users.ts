export interface User {
  _id: string;
  name: string;
  fatherName: string;
  mobile: string;
  role: UserRole;
  verified: boolean;
  email?: string;
  occupation?: string;
  createdAt?: Date; // ISO date string
  profileUrl?: string; // URL for profile image
  membershipDate?: Date; // ISO date string
}

export type UserRole = 'member' | 'admin' | 'superadmin';
