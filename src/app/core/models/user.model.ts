

export enum UserRole {
  ADMIN = 'Admin',
  SUPERVISOR = 'Supervisor',
  INSTRUCTOR = 'Instructor',
  STAFF = 'Staff'
}

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