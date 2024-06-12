import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateLearnerAnswerDto {
  @IsNotEmpty()
  @IsNumber()
  learnerId: number;

  @IsNotEmpty()
  @IsNumber()
  quizId: number;

  @IsNotEmpty()
  @IsNumber()
  questionId: number;

  @IsNotEmpty()
  @IsNumber()
  propositionId: number;
}
