import {IsNotEmpty, IsString, IsNumber, ValidateNested, IsOptional} from 'class-validator';
import {Type} from "class-transformer";
import {CreatePropositionDto} from "@dtos/proposition.dto";
import {CreateAnswerDto} from "@dtos/answer.dto";

export class CreateQuestionDto {

  @IsNotEmpty()
  @IsString()
  libelle: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreatePropositionDto)
  propositions?: CreatePropositionDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateAnswerDto)
  answer?: CreateAnswerDto[];
}
