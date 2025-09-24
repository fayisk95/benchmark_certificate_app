export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  created_at: Date;
  updated_at: Date;
  is_active: boolean;
}

export enum UserRole {
  ADMIN = 'Admin',
  SUPERVISOR = 'Supervisor',
  INSTRUCTOR = 'Instructor',
  STAFF = 'Staff'
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