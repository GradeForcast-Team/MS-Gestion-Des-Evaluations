import {IsNumber, IsString} from "class-validator";

export class CreateNiveauDto {

  @IsString()
  public name: string;
  
  
  @IsNumber()
  public  typeSchoolId: number;

}

