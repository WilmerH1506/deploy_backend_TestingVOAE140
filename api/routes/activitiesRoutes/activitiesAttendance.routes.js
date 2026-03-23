import { Router } from "express";
import { verifyToken } from "../../middlewares/auth.middleware.js";
import { isSupervisor } from "../../middlewares/isSupervisor.middleware.js";
import { isAdmin } from "../../middlewares/isAdmin.middleware.js";
import { ActivitiesAttendanceController } from "../../controllers/ActivitiesController/activitiesAttendance.controller.js";

const activitiesAttendanceRouter = Router();

activitiesAttendanceRouter.post('/',verifyToken,isSupervisor,ActivitiesAttendanceController.createAttendance);

activitiesAttendanceRouter.get('/:activityid',verifyToken,isAdmin,ActivitiesAttendanceController.viewAttendancebyId);

activitiesAttendanceRouter.put('/:attendanceId/hours',verifyToken,isAdmin,ActivitiesAttendanceController.updateHoursAwarded);

export default activitiesAttendanceRouter;
