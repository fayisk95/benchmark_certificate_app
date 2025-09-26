export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  user_code: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export enum UserRole {
  ADMIN = 'Admin',
  SUPERVISOR = 'Supervisor',
  INSTRUCTOR = 'Instructor',
  STAFF = 'Staff'
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  user_code?: string;
  is_active?: boolean;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: UserRole;
  user_code?: string;
  is_active?: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: User;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
}

export interface RolePermission {
  role: UserRole;
  permissions: string[];
}