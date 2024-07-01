import { IsNumber, IsNotEmpty, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateSyllabusDto } from './syllabus.dto';
import { CreateNoteDto } from './note.dto';

export class CreateAcademicYearDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @IsNumber()
  @IsNotEmpty()
  startYear: number;

  @IsNumber()
  @IsNotEmpty()
  endYear: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSyllabusDto)
  syllabus: CreateSyllabusDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateNoteDto)
  note: CreateNoteDto[];
}

export class ValidateAcademicYearDto {
    @IsNumber()
    @IsNotEmpty()
    startYear: number;
  
    @IsNumber()
    @IsNotEmpty()
    endYear: number;
  }