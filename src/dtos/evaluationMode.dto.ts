import { IsString, IsNotEmpty, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateEvaluationModeDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class ValidateEvaluationModeDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
