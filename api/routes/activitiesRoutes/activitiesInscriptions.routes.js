import { Router } from "express";
import { verifyToken } from "../../middlewares/auth.middleware.js";
import { isStudent } from "../../middlewares/isStudent.middleware.js";
import { isSupervisor } from "../../middlewares/isSupervisor.middleware.js";
import { ActivitiesInscriptionsController } from "../../controllers/ActivitiesController/activitiesInscriptions.controller.js";
import jwt from "jsonwebtoken";

const isAdminOrSupervisor = (req, res, next) => {
	const { authorization } = req.headers || {};
	if (!authorization) return res.status(401).json({ message: "Token requerido" });
	try {
		const token = authorization.split(" ")[1];
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		if (decoded.role === "admin" || decoded.role === "supervisor") {
			return next();
		}
		return res.status(401).json({ message: `Solo Administradores o Supervisores tienen acceso a esta ruta ${req.url}` });
	} catch (error) {
		return res.status(403).json({ message: "Error con el JWT", error });
	}
};

const activitiesInscriptionsRouter = Router();

activitiesInscriptionsRouter.post('/:activityid/register/:id' ,verifyToken,isStudent,ActivitiesInscriptionsController.registeStudentinActivity)

activitiesInscriptionsRouter.get('/:activityid/register' ,verifyToken,isAdminOrSupervisor,ActivitiesInscriptionsController.getStudentsbyActivityID)

activitiesInscriptionsRouter.put('/register/end/:id',verifyToken,isSupervisor,ActivitiesInscriptionsController.closeInscriptions)

activitiesInscriptionsRouter.put('/finish/:id',verifyToken,isSupervisor,ActivitiesInscriptionsController.closeActivity);

export default activitiesInscriptionsRouter;
