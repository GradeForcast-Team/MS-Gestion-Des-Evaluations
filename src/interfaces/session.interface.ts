import {Quiz} from "@interfaces/quizz.interface";

export interface Session {
  id: number;
  name: string;
  startDate: Date;
  endDate: Date;
  quizzes?: Quiz[];
}
