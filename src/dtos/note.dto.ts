import { IsNumber, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateNoteDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @IsNumber()
  @IsNotEmpty()
  score: number;

  @IsNumber()
  @IsOptional()
  learnerId?: number;

  @IsNumber()
  @IsOptional()
  teacherId?: number;

  @IsNumber()
  @IsOptional()
  syllabusId?: number;

  @IsNumber()
  @IsOptional()
  typeAssessmentId?: number;

  @IsNumber()
  @IsNotEmpty()
  academicYearId: number;
}
