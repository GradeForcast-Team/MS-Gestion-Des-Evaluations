import {Schools} from "@interfaces/schools.interface";
import {Teacher} from "@interfaces/teachers.interface";
import {Learner} from "@interfaces/learner.interface";


export interface Classe {
  id: number;
  name: string;
  ecoleId: number;
  teachers: number[];
  learners: number[];
}
