import {Question} from "@interfaces/question.interface";

export interface Quiz {
  id: number;
  name: string;
  questions?: Question[];
}
