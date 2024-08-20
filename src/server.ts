import { App } from '@/app';
import { AuthRoute } from '@routes/auth.route';
import { ValidateEnv } from '@utils/validateEnv';
import { SchoolRoute } from '@routes/school.route';
import { TypeschoolRoute } from '@routes/typeschool.route';
import { ClasseRoute } from '@routes/classe.route';
import { RoleRoute } from '@routes/role.route';
import { StatusRoute } from '@routes/status.route';
import { SyllabusRoute } from '@routes/syllabus.route';
import { SessionRoute } from '@routes/session.route';
import { QuizzRoute } from '@routes/quizz.route';
import { QuestionRoute } from '@routes/question.route';
import { LearnerAnswerRoute } from '@routes/learnerAnswer.route';
import { AutoAssessmentRoute } from '@routes/autoAssessment.route';
import { AssessmentRoute } from '@routes/assessment.route';
import { SyllabusClasseRoute } from './routes/syllabusClasse.route';
import { ConceptAutoAssessmentRoute } from './routes/conceptAutoAssessment.route';
import { ConceptRoute } from './routes/concept.route';
import { AcademicYearRoute } from './routes/academycYear.route';
import { EvaluationModeRoute } from './routes/evaluationMode.route';
import { PedagogicalMethodRoute } from './routes/pedagogicalMethod.route';
import { SupportsPedagogiquesRoute } from './routes/supportPedagogic.route';
import { PeriodeRoute } from './routes/typeAssessment.route';
import { OptionsRoute } from './routes/options.route';
import { NiveauRoute } from './routes/niveau.route';
import { StatitiqueRoute } from './routes/statistique.route';

ValidateEnv();

// Initialisez l'application sans les routes
const app = new App([]);

// Obtenez l'instance de SocketServer
const io = app.getSocketInstance();

// Ajoutez les routes avec l'instance de SocketServer
app.initializeRoutes([
  new AuthRoute(),
  new SchoolRoute(),
  new TypeschoolRoute(),
  new ClasseRoute(io),
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
  new SyllabusClasseRoute(),
  new ConceptRoute(),
  new AcademicYearRoute(),
  new PeriodeRoute(),
  new PedagogicalMethodRoute(),
  new SupportsPedagogiquesRoute(),
  new EvaluationModeRoute(),
  new OptionsRoute(),
  new NiveauRoute(),
  new StatitiqueRoute()
]);

app.listen();
app.initializeSocket();
export const socketInstance = app.getSocketInstance();