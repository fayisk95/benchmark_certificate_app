export interface MiscellaneousGroup {
  id: number;
  misc_code: string;
  misc_name: string;
  misc_group_code: string;
  misc_group_name: string;
  misc_description?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateGroupRequest {
  misc_code: string;
  misc_name: string;
  misc_group_code: string;
  misc_group_name: string;
  misc_description?: string;
}

export interface UpdateGroupRequest {
  misc_code: string;
  misc_name: string;
  misc_group_code: string;
  misc_group_name: string;
  misc_description?: string;
}

