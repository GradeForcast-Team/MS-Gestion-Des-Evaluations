import {IsNotEmpty, IsString, IsNumber, ValidateNested, IsOptional} from 'class-validator';
import {Type} from "class-transformer";
import {CreateQuestionDto} from "@dtos/question.dto";

export class CreateQuizDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateQuestionDto) // Importez et utilisez le DTO approprié si nécessaire
  questions?: CreateQuestionDto[];
}
