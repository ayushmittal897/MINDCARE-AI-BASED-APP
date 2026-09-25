import type { AuthTokens, LoginRequest, User } from "@mindcare/types";
import { api } from "./client";

export async function login(body: LoginRequest): Promise<AuthTokens & { user: User; requiresEmailVerification?: boolean }> {
  const { data } = await api.post("/auth/login", body);
  return data;
}

export async function loginWithGoogle(body: { token: string }): Promise<AuthTokens & { user: User }> {
  const { data } = await api.post("/auth/google", body);
  return data;
}

export async function register(body: LoginRequest & { name?: string; role?: "patient" | "clinician" | "pending_clinician" | "admin"; credentialsInfo?: string }): Promise<AuthTokens & { user: User; requiresEmailVerification?: boolean }> {
  const { data } = await api.post("/auth/register", body);
  return data;
}

export async function logout(): Promise<void> {
  await api.post("/auth/logout");
}

export async function verifyEmail(body: { email: string; otp: string }): Promise<AuthTokens & { user: User }> {
  const { data } = await api.post("/auth/verify-email", body);
  return data;
}

export async function resendOtp(body: { email: string }): Promise<{ message: string }> {
  const { data } = await api.post("/auth/resend-otp", body);
  return data;
}

export async function forgotPassword(body: { email: string }): Promise<{ message: string }> {
  const { data } = await api.post("/auth/forgot-password", body);
  return data;
}

export async function resetPassword(body: { email: string; otp: string; newPassword: string }): Promise<{ message: string }> {
  const { data } = await api.post("/auth/reset-password", body);
  return data;
}

export async function requestClinicianAccess(body: { credentialsInfo?: string }): Promise<{ message: string }> {
  const { data } = await api.post("/auth/request-clinician-access", body);
  return data;
}
