import { IsString, IsNotEmpty, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePedagogicalMethodDto {
  @IsString()
  @IsNotEmpty()
  name: string;

}

export class ValidatePedagogicalMethodDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
