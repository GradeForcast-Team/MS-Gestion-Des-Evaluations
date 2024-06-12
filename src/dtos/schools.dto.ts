import {IsArray, IsNotEmpty, isNumber, IsNumber, IsOptional, IsString, ValidateNested} from "class-validator";
import {Type} from "class-transformer";

export class CreateSchoolDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  telephone?: string;

  @IsNumber()
  @IsNotEmpty()
  public typeSchoolId: number;

}

export  class  ValidateSchoolDto {

  @IsNumber()
  @IsOptional()
  public  id: number;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  telephone?: string;

  @IsNumber()
  @IsNotEmpty()
  public typeSchoolId: number;

}
