import {Learner} from "@interfaces/learner.interface";
import {Teacher} from "@interfaces/teachers.interface";

export interface Note {
  id: number;
  score: number;
  learner?: Learner;
  learnerId: number;
  teacher?: Teacher;
  teacherId: number;
}
