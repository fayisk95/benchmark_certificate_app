export interface Permission {
  id: string;
  name: string;
  description: string;
}

export interface RolePermission {
  roleId: string;
  roleName: string;
  permissions: string[];
}

export const PERMISSIONS = {
  MANAGE_USERS: 'Manage Users',
  MANAGE_BATCHES: 'Manage Batches',
  ISSUE_CERTIFICATES: 'Issue Certificates',
  VIEW_REPORTS: 'View Reports',
  MANUAL_NUMBER_ENTRY: 'Manual Number Entry',
  DASHBOARD_ACCESS: 'Dashboard Access',
  MISCELLANEOUS_ACCESS: 'Miscellaneous Access',
} as const;