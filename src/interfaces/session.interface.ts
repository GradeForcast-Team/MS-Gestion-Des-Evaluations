import {Quiz} from "@interfaces/quizz.interface";
import { Concept } from "./concept.interface";

export interface Session {
  id: number;
  name: string;
  startDate: Date;
  endDate: Date;
  concept?: Concept[];
}
