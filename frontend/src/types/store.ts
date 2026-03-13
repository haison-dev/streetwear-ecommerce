import type { AuthUserLite } from "@/types/auth";

export interface AuthState {
  token: string | null;
  user: AuthUserLite | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    phone?: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
}
