import {IsNotEmpty, IsString, IsDate, IsOptional, ValidateNested, IsDateString} from 'class-validator';
import {CreateQuizDto} from "@dtos/quizz.dto";
import {Type} from "class-transformer";

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
  @Type(() => CreateQuizDto) // Importez et utilisez le DTO approprié si nécessaire
  quizzes?: CreateQuizDto[];
}

export class GetSessionsBetweenDatesDto {
  @IsNotEmpty()
  @IsDateString()
  startDate: Date;

  @IsNotEmpty()
  @IsDateString()
  endDate: Date;

}

