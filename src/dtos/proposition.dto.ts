import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreatePropositionDto {
  @IsNotEmpty()
  @IsString()
  valeur: string;

  @IsNumber()
  numbQuestion: number;
}
