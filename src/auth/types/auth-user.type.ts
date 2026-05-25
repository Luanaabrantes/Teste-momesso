export type AuthUser = {
  id: string;
  email: string;
  role: 'ADMIN' | 'USER';
  companyId: string;
};