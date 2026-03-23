import { Router } from "express";
import { ActivitiesFilesController } from "../../controllers/ActivitiesController/activitiesFiles.controller.js";
import { verifyToken } from "../../middlewares/auth.middleware.js";
import { isAdmin } from "../../middlewares/isAdmin.middleware.js";
import multer from 'multer';
const upload = multer({ dest: 'uploads/' }); // carpeta temporal

const activitiesFilesRouter = Router();

activitiesFilesRouter.post('/images/upload',verifyToken, isAdmin, upload.single('file'), ActivitiesFilesController.postFilesController);

activitiesFilesRouter.get('/images/files',verifyToken, isAdmin, ActivitiesFilesController.getFilesController);

activitiesFilesRouter.delete('/images/delete',verifyToken, isAdmin, ActivitiesFilesController.deleteFilesController);

activitiesFilesRouter.post('/images/link',verifyToken,isAdmin,ActivitiesFilesController.linkImageToActivityController);

activitiesFilesRouter.get('/images/by-activity/:id',verifyToken,isAdmin,ActivitiesFilesController.getImageByActivityController);

activitiesFilesRouter.put('/images/by-activity/:id',verifyToken,isAdmin,ActivitiesFilesController.updateImageActivityController);

export default activitiesFilesRouter;
