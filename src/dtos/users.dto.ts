// createUser.dto.ts
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  IsUUID,
  IsInt,
  IsOptional,
  IsNumber
} from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  public email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(32)
  public password: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(32)
  public name: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(32)
  public surname: string;

  @IsNotEmpty()
  public birthday?: Date;

  @IsNotEmpty()
  public sexe?: string;

  @IsString()
  @IsNotEmpty()
  public phone?: string;

  @IsString()
  @IsNotEmpty()
  public description?: string;

  @IsNumber()
  @IsOptional()
  public levelEducationId?: number;

  @IsNumber()
  public id_ecole?: number;
}

export class  CreateTeacherDto{
  @IsNumber()
  @IsNotEmpty()
  public salaire: number;

  @IsNumber()
  @IsNotEmpty()
  public experience: number;
}
export class ValidateAccountDto {
  @IsString()
  @IsUUID()
  public token: string;
}

export class ForgetPasswordDto {
  @IsEmail()
  public email: string;
}

export class UpdateUserDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(9)
  @MaxLength(32)
  public password: string;

  @IsEmail()
  public email: string;
}
