import { api } from "./client";

export interface FeatureFlag {
  flagKey: string;
  enabled: boolean;
  description: string | null;
  updatedAt: string;
}

export interface DoctorRequest {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  credentialsInfo: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  reviewedAt: string | null;
  reviewerNote: string | null;
  user: {
    name: string | null;
    email: string;
  };
}

export async function getFeatureFlags(): Promise<FeatureFlag[]> {
  const { data } = await api.get("/admin/feature-flags");
  return data;
}

export async function updateFeatureFlag(flagKey: string, enabled: boolean): Promise<FeatureFlag> {
  const { data } = await api.patch(`/admin/feature-flags/${flagKey}`, { enabled });
  return data;
}

export async function getDoctorRequests(): Promise<DoctorRequest[]> {
  const { data } = await api.get("/admin/doctor-requests");
  return data;
}

export async function processDoctorRequest(id: string, action: 'approve' | 'reject', reviewerNote?: string): Promise<{ message: string, request: DoctorRequest }> {
  const { data } = await api.post(`/admin/doctor-requests/${id}/process`, { action, reviewerNote });
  return data;
}

export async function grantAdmin(email: string): Promise<{ message: string }> {
  const { data } = await api.post(`/admin/grant-admin`, { email });
  return data;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  adminGrantedAt: string | null;
}

export async function getAdmins(): Promise<AdminUser[]> {
  const { data } = await api.get("/admin/admins");
  return data;
}

export async function revokeAdmin(email: string): Promise<{ message: string }> {
  const { data } = await api.post("/admin/revoke-admin", { email });
  return data;
}
