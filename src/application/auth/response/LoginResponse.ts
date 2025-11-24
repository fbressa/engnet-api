export interface UserResponse {
  id: string;
  name: string;
  email: string;
  role?: string;
}

export interface LoginResponse {
  access_token: string;
  user: UserResponse;
}