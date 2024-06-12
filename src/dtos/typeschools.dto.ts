import {IsString} from 'class-validator';

export class CreateTypeSchoolDto {
  @IsString()
  public name: string;

}
