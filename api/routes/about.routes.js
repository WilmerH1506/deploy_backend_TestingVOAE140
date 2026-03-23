import { Router } from "express";
import { AboutController } from "../controllers/about.controller.js";
import { isAdmin } from "../middlewares/isAdmin.middleware.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const aboutRouter = Router();

aboutRouter.get("/sections", AboutController.getSectionsController);
aboutRouter.put("/sections",verifyToken,isAdmin, AboutController.updateSectionsController);

// About Posts
aboutRouter.get("/posts", AboutController.getPostsController);
aboutRouter.get("/posts/admin",verifyToken,isAdmin, AboutController.getAdminPostsController);
aboutRouter.post("/posts",verifyToken,isAdmin, AboutController.createPostController);
aboutRouter.put("/posts/:id",verifyToken,isAdmin, AboutController.updatePostController);
aboutRouter.delete("/posts/:id",verifyToken,isAdmin, AboutController.deletePostController);
aboutRouter.patch("/posts/:id/visibility",verifyToken,isAdmin, AboutController.togglePostVisibilityController);
aboutRouter.patch("/posts/:id/pin",verifyToken,isAdmin, AboutController.togglePostPinController);

// About Posts Vistas
aboutRouter.post("/posts/:postid/view", AboutController.incrementPostViewsController);

export default aboutRouter ;