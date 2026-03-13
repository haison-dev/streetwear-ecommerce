export interface Address {
  name?: string;
  phone?: string;
  address?: string;
  city?: string;
  district?: string;
  ward?: string;
  isDefault?: boolean;
}

export interface Permission {
  _id: string;
  action: string;
  resource: string;
}

export interface Role {
  _id: string;
  name?: string;
  permissions?: Permission[];
}

export interface AuthUserLite {
  id: string;
  email: string;
  displayName?: string;
  roles: string[];
}

export interface AuthUser {
  _id: string;
  email: string;
  displayName?: string;
  phone?: string;
  roles?: Role[];
  addresses?: Address[];
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUserLite;
}

export interface RefreshResponse {
  accessToken: string;
}

export interface MeResponse {
  user: AuthUser;
}
