import {Session} from "@interfaces/session.interface";

export interface Syllabus {
  name: string;
  nbhr: number;
  creditCoef: number;
  courseDescription: string;
  generalObjective: string;
  specificObjective: string;
  methodeId: number;
  supportId: number;
  modeId: number;
  periodeId: number;
  session?: Session[];
}
