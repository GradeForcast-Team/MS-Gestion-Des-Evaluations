import { IsString, IsOptional, IsDate, IsInt, IsEmail } from 'class-validator';

export class UpdateTeacherDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  surname?: string;

  @IsDate()
  @IsOptional()
  birthday?: Date;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @IsOptional()
  id_ecole?: number;

  @IsString()
  @IsOptional()
  sexe?: string;

  @IsString()
  @IsOptional()
  specialisations?: string;

  @IsInt()
  @IsOptional()
  experience?: number;

  @IsString()
  @IsOptional()
  photo?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsOptional()
  postal_code?: string;

  @IsInt()
  @IsOptional()
  StartDateTeaching?: number;

  @IsInt()
  @IsOptional()
  pool?: number;

  @IsString()
  @IsOptional()
  schools?: string; // Ajout de la propriété schools pour les identifiants des écoles
}
