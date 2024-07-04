import { IsNumber, IsNotEmpty, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateSyllabusDto } from './syllabus.dto';
import { CreateNoteDto } from './note.dto';

export class CreateAcademicYearDto {

  @IsNumber()
  @IsNotEmpty()
  startYear: number;

  @IsNumber()
  @IsNotEmpty()
  endYear: number;
}

export class ValidateAcademicYearDto {
    @IsNumber()
    @IsNotEmpty()
    startYear: number;
  
    @IsNumber()
    @IsNotEmpty()
    endYear: number;
  }