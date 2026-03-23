import {Router} from 'express';
import multer from 'multer';
import { verifyToken } from "../../middlewares/auth.middleware.js";
import { isAdmin } from "../../middlewares/isAdmin.middleware.js";
import { ActivitiesAttendanceController } from "../../controllers/ActivitiesController/activitiesAttendance.controller.js";

const upload = multer({storage: multer.memoryStorage()});

const activitiesImportRouter = Router();

activitiesImportRouter.post('/:activityId',verifyToken,isAdmin,upload.single('file'), ActivitiesAttendanceController.importFile)

export default activitiesImportRouter;