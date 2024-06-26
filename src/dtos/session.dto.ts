import {IsNotEmpty, IsString, IsDate, IsOptional, ValidateNested, IsDateString} from 'class-validator';
import {CreateQuizDto} from "@dtos/quizz.dto";
import {Type} from "class-transformer";
import { CreateConceptDto } from './concept.dto';

export class CreateSessionDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsDateString()
  startDate: Date;

  @IsNotEmpty()
  @IsDateString()
  endDate: Date;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateConceptDto) // Importez et utilisez le DTO approprié si nécessaire
  concepts?: CreateConceptDto[];
}

export class GetSessionsBetweenDatesDto {
  @IsNotEmpty()
  @IsDateString()
  startDate: Date;

  @IsNotEmpty()
  @IsDateString()
  endDate: Date;

}

