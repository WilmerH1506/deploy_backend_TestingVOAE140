import {Router} from "express"
import AuthController from "../controllers/auth.controller.js"
import {verifyToken} from "../middlewares/auth.middleware.js"
import { isAdmin } from "../middlewares/isAdmin.middleware.js"

const AuthRouter = Router()

AuthRouter.post("/register",AuthController.RegisterUser)
AuthRouter.post("/login",AuthController.LoginUser)
AuthRouter.get("/check-status",verifyToken,AuthController.checkStatusUser)
AuthRouter.put("/password/:id",verifyToken,AuthController.UpdatePassword)
AuthRouter.put("/data/:id",verifyToken,AuthController.UpdateData)
AuthRouter.delete("/delete/:id",verifyToken,isAdmin,AuthController.DeleteUser)

export default AuthRouter
