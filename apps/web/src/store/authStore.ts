import type { User } from "@mindcare/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  accessToken: string | null;
  user: User | null;
  setSession: (token: string, user: User) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      setSession: (accessToken, user) => set({ accessToken, user }),
      clear: () => set({ accessToken: null, user: null }),
    }),
    { name: "mindcare-auth" },
  ),
);
