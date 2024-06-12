import {User} from "@interfaces/users.interface";
import {TypeSchools} from "@interfaces/types_schools.interface";
import {Classe} from "@interfaces/classe.interface";

export interface Schools {
  id: number;
  name: string;
  telephone?: string | null;
  typeSchoolId: number;
}
