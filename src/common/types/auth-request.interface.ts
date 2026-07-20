export interface AuthUser {
  uuid: string;
  email: string;
  role: string;
  employeeId?: string;
}

export interface AuthRequest {
  user: AuthUser;
  userCompanyId?: string;
}
