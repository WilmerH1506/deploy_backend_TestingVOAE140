import { Router } from "express";
import { verifyToken } from "../../middlewares/auth.middleware.js";
import { isSupervisor } from "../../middlewares/isSupervisor.middleware.js";
import { isAdmin } from "../../middlewares/isAdmin.middleware.js";
import { ActivitiesController } from "../../controllers/ActivitiesController/activities.controller.js";

const mainActivitiesRouter = Router();

mainActivitiesRouter.get('/', verifyToken,ActivitiesController.getActivityController);

mainActivitiesRouter.get('/deleted', verifyToken,isAdmin,ActivitiesController.getDeletedActivitiesController);

mainActivitiesRouter.get('/:id',verifyToken,ActivitiesController.getActivityByIdController);

mainActivitiesRouter.get('/supervisor/:id',verifyToken,isSupervisor,ActivitiesController.getActivitiesForSupervisorId);

mainActivitiesRouter.post('/', verifyToken,isAdmin,ActivitiesController.createActivityController);

mainActivitiesRouter.post('/external', verifyToken,isAdmin,ActivitiesController.createExternalActivityController);

mainActivitiesRouter.put('/:id', verifyToken,isAdmin,ActivitiesController.putActivityByIdController);

mainActivitiesRouter.put('/disableEneable/:id', verifyToken,isAdmin,ActivitiesController.putActivityDisableEneable);
mainActivitiesRouter.get('/disableEneable/:id',verifyToken,isAdmin,ActivitiesController.getActivityDisableEneable);
mainActivitiesRouter.put('/:id/status',verifyToken,isAdmin,ActivitiesController.handleStatusActivitiesManual);

mainActivitiesRouter.delete('/:id',verifyToken,isAdmin,ActivitiesController.deleteActivityByIdController);
mainActivitiesRouter.put('/restore/:id',verifyToken,isAdmin,ActivitiesController.restoreDeletedActivityController);

export default mainActivitiesRouter;
