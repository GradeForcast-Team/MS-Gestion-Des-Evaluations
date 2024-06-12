import {IsString, IsNumber, IsOptional, ValidateNested, IsNotEmpty} from 'class-validator';
import {Type} from "class-transformer";
import {CreateSessionDto} from "@dtos/session.dto";

export class CreateSyllabusDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  nbhr: number;

  @IsString()
  @IsOptional()
  semestre: string;

  @IsNumber()
  @IsOptional()
  creditCoef: number;

  @IsNumber()
  @IsOptional()
  year: number;

  @IsString()
  @IsNotEmpty()
  description_cours: string;

  @IsString()
  @IsOptional()
  objectif_general: string;

  @IsString()
  @IsOptional()
  objectif_specifique: string;

  @IsNumber()
  @IsOptional()
  methodeId: number;

  @IsNumber()
  @IsOptional()
  supportId: number;

  @IsNumber()
  @IsOptional()
  modeId: number;

  @ValidateNested()
  @Type(() => CreateSessionDto)
  session: CreateSessionDto[];

}
