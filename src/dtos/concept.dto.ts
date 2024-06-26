import {IsNotEmpty, IsString, IsNumber, ValidateNested, IsOptional} from 'class-validator';
import {Type} from "class-transformer";
import { CreateQuizDto } from './quizz.dto';

export class CreateConceptDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateQuizDto) // Importez et utilisez le DTO approprié si nécessaire
  quizz?: CreateQuizDto[];
}
