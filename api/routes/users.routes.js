import { Router } from "express";
import UserController from "../controllers/users.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/isAdmin.middleware.js";

const UserRouter= Router()

UserRouter.get("/:id/activities",verifyToken,isAdmin,UserController.GetUserActivity)
UserRouter.get("/:id/fields",verifyToken,isAdmin,UserController.ActivitiesScope)
UserRouter.get("/students",verifyToken,isAdmin, UserController.getStudents)
UserRouter.get("/supervisors",verifyToken,isAdmin,UserController.getSupervisors)
UserRouter.put("/supervisor/:accountNumber/disable",verifyToken,isAdmin, UserController.disableSupervisor)
UserRouter.put("/supervisor/:accountNumber/enable",verifyToken,isAdmin, UserController.enableSupervisor)
UserRouter.get("/careers",verifyToken,isAdmin,UserController.getCareers)
UserRouter.post("/:id/registerActivity/:activityId", verifyToken,isAdmin, UserController.registerActivityForStudent);

export default UserRouter
