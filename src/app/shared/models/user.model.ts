export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  lastLogin?: Date;
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