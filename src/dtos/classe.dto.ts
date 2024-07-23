import { Type } from 'class-transformer';
import {IsInt, IsNotEmpty, IsNumber, IsOptional, IsString} from 'class-validator';

export class CreateClasseDto {
  @IsNumber()
  public  id: number;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsInt()
  ecoleId: number;

  
  @IsNotEmpty()
  @IsInt()
  niveauId: number;

  @IsNotEmpty()
  @IsInt({ each: true })
  @Type(() => Number)
  teachers: number[];

  @IsNotEmpty()
  @IsInt({ each: true })
  @Type(() => Number)
  learners: number[];

}

export class ValidateClasseDto {


  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsInt()
  ecoleId: number;

}

