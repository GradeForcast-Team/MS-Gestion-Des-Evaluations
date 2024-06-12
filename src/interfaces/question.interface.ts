export interface Question {
  id: number;
  libelle: string;
  propositions: Proposition[];
  answer: Answer[];

}
