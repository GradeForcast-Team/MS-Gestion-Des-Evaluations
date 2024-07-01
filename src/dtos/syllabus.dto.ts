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

  @IsNumber()
  @IsOptional()
  creditCoef: number;

  @IsString()
  @IsNotEmpty()
  courseDescription: string;

  @IsString()
  @IsOptional()
  generalObjective: string;

  @IsString()
  @IsOptional()
  specificObjective: string;

  @IsNumber()
  @IsOptional()
  methodeId: number;

  @IsNumber()
  @IsOptional()
  supportId: number;

  @IsNumber()
  @IsOptional()
  modeId: number;

  @IsNumber()
  @IsOptional()
  academicYearId: number;

  @IsNumber()
  @IsOptional()
  periodId: number;

  @ValidateNested()
  @Type(() => CreateSessionDto)
  sessions: CreateSessionDto[];

}
