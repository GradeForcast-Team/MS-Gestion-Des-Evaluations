import {User} from "@interfaces/users.interface";
import {Classe} from "@interfaces/classe.interface";
import {Note} from "@interfaces/note.interface";

export interface Learner {
  id: number;
  userId: number;
  user: User;
  est_membre: boolean;
  classe?: Classe;
  classeId: number;
  notes: Note[];
}
