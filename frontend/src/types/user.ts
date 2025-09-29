import { BaseInterface } from '.';

export interface User extends BaseInterface {
  id: number;
  name: string;
  surname: string;
  email: string;
  phone: string;
  jobId: number;
  locationName?: string;
  language?: string;
  timezone?: string;
  password?: string;
  confirmPassword?: string;
  status: 'active' | 'inactive' | 'suspended';
  departmentId: number;
  permissions: string[];
  updatedAt?: string;
}

export interface Job extends BaseInterface {
  id: number;
  title: string;
}

export interface Department extends BaseInterface {
  id?: number;
  name: string;
  description: string;
  managerName: string;
  createdAt: string;
}

export interface Permission extends BaseInterface {
  id: number;
  code: string;
  descriptionPt: string;
  descriptionEn: string;
  groupId: number;
  groupNamePt: string;
  groupNameEn: string;
}
