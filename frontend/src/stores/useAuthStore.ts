import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "sonner";
import { authService } from "@/services/authService";
import type { AuthState } from "@/types/store";
import type { AuthUser, AuthUserLite } from "@/types/auth";

const mapMeUserToLite = (user: AuthUser): AuthUserLite => {
  const roles = (user.roles || []).map((role) => role._id);
  const roleNames = (user.roles || [])
    .map((role) => String(role?.name || "").toLowerCase())
    .filter(Boolean);

  return {
    id: user._id,
    email: user.email,
    displayName: user.displayName,
    roles,
    roleNames,
  };
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      loading: false,

      login: async (email, password) => {
        try {
          set({ loading: true });
          const data = await authService.login(email, password);
          set({ token: data.token, user: data.user });

          try {
            const me = await authService.me();
            if (me?.user) set({ user: mapMeUserToLite(me.user) });
          } catch (meError) {
            console.error("fetchMe after login failed", meError);
          }

          toast.success("Login successful");
        } catch (error) {
          console.error(error);
          toast.error("Login failed");
        } finally {
          set({ loading: false });
        }
      },

      register: async (email, password, firstName, lastName, phone) => {
        try {
          set({ loading: true });
          const data = await authService.register({
            email,
            password,
            firstName,
            lastName,
            phone,
          });
          set({ token: data.token, user: data.user });
          toast.success("Register successful");
        } catch (error) {
          console.error(error);
          toast.error("Register failed");
        } finally {
          set({ loading: false });
        }
      },

      logout: async () => {
        try {
          await authService.logout();
        } catch (error) {
          console.error(error);
        } finally {
          set({ token: null, user: null });
        }
      },

      fetchMe: async () => {
        try {
          set({ loading: true });
          const me = await authService.me();
          if (me?.user) {
            set({ user: mapMeUserToLite(me.user) });
          }
        } catch (error) {
          console.error(error);
          set({ token: null, user: null });
        } finally {
          set({ loading: false });
        }
      },
    }),
    { name: "auth-store" },
  ),
);

