import {IsNumber, IsString} from "class-validator";

export class CreateStatusDto {
  @IsString()
  public name: string;

  @IsNumber()
  public  roleId: number;

}

