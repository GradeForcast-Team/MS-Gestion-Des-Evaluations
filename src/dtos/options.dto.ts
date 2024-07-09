
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateOptionsDto {
    @IsString()
    @IsNotEmpty()
    name: string;
  }
  