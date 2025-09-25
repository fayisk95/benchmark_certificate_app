export interface MiscellaneousGroup {
  id: number;
  code: string;
  code_name: string;
  group_code: string;
  group_name: string;
  description?: string;
  records?: MiscellaneousRecord[];
  created_at: string;
  updated_at: string;
}

export interface MiscellaneousRecord {
  id: number;
  group_id: number;
  record_code: string;
  record_name: string;
  record_value?: string;
  description?: string;
  is_active: boolean;
  sort_order?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateGroupRequest {
  code_name: string;
  group_code: string;
  group_name: string;
  description?: string;
}

export interface UpdateGroupRequest {
  code_name?: string;
  group_code?: string;
  group_name?: string;
  description?: string;
}

export interface CreateRecordRequest {
  group_id: number;
  record_code: string;
  record_name: string;
  record_value?: string;
  description?: string;
  is_active?: boolean;
  sort_order?: number;
}

export interface UpdateRecordRequest {
  record_code?: string;
  record_name?: string;
  record_value?: string;
  description?: string;
  is_active?: boolean;
  sort_order?: number;
}