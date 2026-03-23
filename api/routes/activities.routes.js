import { Router } from "express";
import activitiesDegreesRouter from "./activitiesRoutes/activitiesDegrees.routes.js";
import mainActivitiesRouter from "./activitiesRoutes/mainActivities.routes.js";
import activitiesAttendanceRouter from "./activitiesRoutes/activitiesAttendance.routes.js";
import activitiesInscriptionsRouter from "./activitiesRoutes/activitiesInscriptions.routes.js";
import activitiesFilesRouter from "./activitiesRoutes/activitiesfiles.routes.js";
import activitiesImportRouter from "./activitiesRoutes/activitiesImport.routes.js";

const activitiesRouter = Router();
activitiesRouter.use('/degrees', activitiesDegreesRouter);
activitiesRouter.use('/attendance', activitiesAttendanceRouter);
activitiesRouter.use('/import-file', activitiesImportRouter);
activitiesRouter.use('/', mainActivitiesRouter);
activitiesRouter.use('/', activitiesInscriptionsRouter);
activitiesRouter.use('/', activitiesFilesRouter);

export default activitiesRouter;
