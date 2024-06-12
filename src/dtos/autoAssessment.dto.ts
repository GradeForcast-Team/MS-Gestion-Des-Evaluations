import {IsBoolean, IsNotEmpty, IsNumber} from "class-validator";

export class CreateAutoAssessmentDTO {

  @IsNotEmpty()
  @IsNumber()
  sessionId: number;

  @IsNotEmpty()
  @IsNumber()
  quizzId: number;

  @IsNotEmpty()
  @IsNumber()
  learnerId: number;

  @IsNotEmpty()
  @IsBoolean()
  mastered: boolean;

}
