import { useMutation } from "@tanstack/react-query";
import * as authApi from "@/api/auth";
import { useAuthStore } from "@/store/authStore";
import { useAnalysisStore } from "@/store/analysisStore";
export function useLogin() {
  const setSession = useAuthStore((s) => s.setSession);
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => setSession(data.accessToken, data.user),
  });
}

export function useLoginWithGoogle() {
  const setSession = useAuthStore((s) => s.setSession);
  return useMutation({
    mutationFn: authApi.loginWithGoogle,
    onSuccess: (data) => setSession(data.accessToken, data.user),
  });
}

export function useRegister() {
  const setSession = useAuthStore((s) => s.setSession);
  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      if (data.accessToken) {
        setSession(data.accessToken, data.user);
      }
    },
  });
}

export function useLogout() {
  const clear = useAuthStore((s) => s.clear);
  return useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      clear();
      useAnalysisStore.getState().clear();
    },
  });
}

export function useVerifyEmail() {
  const setSession = useAuthStore((s) => s.setSession);
  return useMutation({
    mutationFn: authApi.verifyEmail,
    onSuccess: (data) => setSession(data.accessToken, data.user),
  });
}

export function useResendOtp() {
  return useMutation({
    mutationFn: authApi.resendOtp,
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: authApi.forgotPassword,
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: authApi.resetPassword,
  });
}

export function useRequestClinicianAccess() {
  const setSession = useAuthStore((s) => s.setSession);
  const token = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: authApi.requestClinicianAccess,
    onSuccess: () => {
      // Optimistically update the local user state to pending_clinician
      if (token && user) {
        setSession(token, { ...user, role: "pending_clinician" });
      }
    }
  });
}
