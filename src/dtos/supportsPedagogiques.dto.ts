import { IsString, IsNotEmpty, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSupportsPedagogiquesDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class ValidateSupportsPedagogiquesDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
