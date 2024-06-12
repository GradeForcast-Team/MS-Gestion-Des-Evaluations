import {Session} from "@interfaces/session.interface";

export interface Syllabus {
  name: string;
  nbhr: number;
  semestre: string;
  creditCoef: number;
  year: number;
  description_cours: string;
  objectif_general: string;
  objectif_specifique: string;
  methodeId: number;
  supportId: number;
  modeId: number;
  session?: Session[];
}
