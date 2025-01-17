export interface User {
  id: number;
  email: string;
  username: string;
  is_admin: boolean;
}

export interface LoginResponse {
  user: User;
  access_token: string;
} 