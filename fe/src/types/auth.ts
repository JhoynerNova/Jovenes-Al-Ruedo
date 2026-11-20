/**
 * Archivo: types/auth.ts
 * Descripción: Tipos e interfaces TypeScript para el sistema de autenticación.
 */

// ════════════════════════════════════════
// 📥 Tipos de REQUEST (datos que envía el frontend al backend)
// ════════════════════════════════════════

export interface RegisterRequest {
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: string;
  sector?: string;
  color_palette?: string;
  birth_date?: string;
  artistic_area?: string;
  password: string;
  accepted_terms: boolean;
}
export interface LoginRequest {
  email: string;
  password: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  new_password: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

// ════════════════════════════════════════
// 📤 Tipos de RESPONSE (datos que retorna el backend al frontend)
// ════════════════════════════════════════

export interface UserResponse {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: string;
  color_palette?: string;
  customization?: Record<string, any> | null;
  sector: string | null;
  birth_date: string | null;
  artistic_area: string | null;
  bio: string | null;
  location: string | null;
  profile_pic_url: string | null;
  cover_pic_url: string | null;
  social_links: Record<string, string> | null;
  artistic_disciplines: string[] | null;
  looking_for_disciplines: string[] | null;
  company_legal_name: string | null;
  company_nit: string | null;
  company_size: string | null;
  onboarding_completed: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaginatedUsersResponse {
  items: UserResponse[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface MessageResponse {
  message: string;
}

// ════════════════════════════════════════
// 🔧 Tipos internos del frontend
// ════════════════════════════════════════

export interface AuthState {
  user: UserResponse | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthContextType extends AuthState {
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  changePassword: (data: ChangePasswordRequest) => Promise<void>;
  forgotPassword: (data: ForgotPasswordRequest) => Promise<void>;
  resetPassword: (data: ResetPasswordRequest) => Promise<void>;
  updateUser: (user: UserResponse) => void;
}

export interface ApiError {
  detail: string | ValidationError[];
}

export interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}
