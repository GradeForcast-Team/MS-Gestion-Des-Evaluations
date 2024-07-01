import { IsNumber, IsString, IsNotEmpty, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTypeAssessmentDto {
  @IsString()
  @IsNotEmpty()
  name: string;

}

export class ValidateTypeAssessmentDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
