import { IsNotEmpty } from 'class-validator';

export class CreateAnswerDto {
  @IsNotEmpty()
  valeur: number;
}
