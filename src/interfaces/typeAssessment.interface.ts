import { Note } from "./note.interface";

export interface TypeAssessment {
    id: number;
    name: string; // Utilisation de `name` au lieu de `Nom` pour suivre la convention de nommage en anglais
    periodeId?: number; // Facultatif
  }
  