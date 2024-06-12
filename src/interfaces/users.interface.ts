export interface User {
  id: number;
  name: string;
  surname: string;
  birthday?: Date;
  sexe?: string;
  email: string;
  phone?: string;
  description?: string;
  id_ecole?: number;
  reset_password_token: string;
  reset_password_expires: Date;
  validate_account_token: string;
  validate_account_expires: Date;
  created_at: Date;
  roleId: number;
  password: string;
  levelEducationId?: number;
}
