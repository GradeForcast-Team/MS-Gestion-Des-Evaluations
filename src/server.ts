import { App } from '@/app';
import { AuthRoute } from '@routes/auth.route';
import { ValidateEnv } from '@utils/validateEnv';
import {SchoolRoute} from "@routes/school.route";
import {TypeschoolRoute} from "@routes/typeschool.route";
import {ClasseRoute} from "@routes/classe.route";
import {RoleRoute} from "@routes/role.route";
import {StatusRoute} from "@routes/status.route";
import {SyllabusRoute} from "@routes/syllabus.route";
import {SessionRoute} from "@routes/session.route";
import {QuizzRoute} from "@routes/quizz.route";
import {QuestionRoute} from "@routes/question.route";
import {LearnerAnswerRoute} from "@routes/learnerAnswer.route";
import {AutoAssessmentRoute} from "@routes/autoAssessment.route";
import {AssessmentRoute} from "@routes/assessment.route";
import { SyllabusClasseRoute } from './routes/syllabusClasse.route';
import { ConceptAutoAssessmentRoute } from './routes/conceptAutoAssessment.route';

ValidateEnv();

const app = new App([
  new AuthRoute(),
  new SchoolRoute(),
  new TypeschoolRoute(),
  new ClasseRoute(),
  new RoleRoute(),
  new StatusRoute(),
  new SyllabusRoute(),
  new SessionRoute(),
  new QuizzRoute(),
  new QuestionRoute(),
  new LearnerAnswerRoute(),
  new AutoAssessmentRoute(),
  new ConceptAutoAssessmentRoute(),
  new AssessmentRoute(),
  new SyllabusClasseRoute()
]);
app.listen();

// export const socketInstance = app.getSocketInstance();
