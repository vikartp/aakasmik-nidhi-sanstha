export interface User {
    _id: string;
    name: string;
    fatherName: string;
    mobile: string;
    role: 'member' | 'admin' | 'superadmin';
    email?: string;
    occupation?: string;
    createdAt?: string; // ISO date string
}