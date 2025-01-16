export interface User {
  id: number;
  email: string;
  username: string;
  is_admin: boolean;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
} 