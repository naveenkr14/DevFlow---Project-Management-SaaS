export type AuthUser = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
};

export type AuthMeResponse = {
  success: boolean;
  data: AuthUser;
};