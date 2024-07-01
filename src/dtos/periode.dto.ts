import { IsNumber, IsString, IsNotEmpty, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePeriodeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsOptional()
  typeSchoolId?: number;

}

export class ValidatePeriodeDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
