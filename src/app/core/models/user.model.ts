export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export type UserRole = 'Admin' | 'Supervisor' | 'Instructor' | 'Staff';

export interface CreateUserRequest {
  name: string;
  email: string;
  role: UserRole;
  password: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: UserRole;
  isActive?: boolean;
}