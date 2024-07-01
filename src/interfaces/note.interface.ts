export interface Note {
  id: number;
  score: number; // Utilisation de `number` pour `Float`
  learnerId: number;
  teacherId: number;
  syllabusId: number;
  typeAssessmentId: number;
  academicYearId: number;
}
