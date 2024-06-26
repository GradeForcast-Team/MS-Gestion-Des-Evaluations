import {IsString, IsNumber, IsOptional, ValidateNested, IsNotEmpty} from 'class-validator';
import {Type} from "class-transformer";

export class CreateSyllabusClasseDto {
 @IsNotEmpty()
 @IsNumber()
 classeId: number;

 @IsNotEmpty()
 @IsNumber()
 syllabusId: number;

 @IsNotEmpty()
 @IsString()
 linkSyllabusClasse: string;

}
