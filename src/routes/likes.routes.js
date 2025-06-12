import { Router } from "express";
import likesController from "../controllers/likes.controller.js";

const router = Router();

router.get("/posts/post/:id/likes", likesController.getLikes);
router.post("/posts/post/:id/like/create", likesController.createLike);
router.delete("/posts/post/:id/like/delete/", likesController.deleteLike);

export default router;
