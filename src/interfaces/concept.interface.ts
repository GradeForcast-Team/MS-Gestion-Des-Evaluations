import { Quiz } from "./quizz.interface";

export interface Concept {
  id: number;
  name: string;
  quizz?: Quiz[];
}
