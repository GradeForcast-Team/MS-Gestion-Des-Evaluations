import {User} from "@interfaces/users.interface";

export interface Teacher extends User {
  id: number;
  userId: number;
  StartDateTeaching: number | null;
  pool: number | null;
  est_membre: boolean;
  typeTeacherId: number | null;
}
