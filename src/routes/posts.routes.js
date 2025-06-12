import { Router } from "express";
import postControllers from "../controllers/posts.controller.js";

const router = Router();

router.get("/posts", postControllers.getPosts);
router.get("/posts/post/:id", postControllers.getPostById);
router.put("/posts/update/:id", postControllers.updatePost);
router.delete("/posts/delete/:id", postControllers.deletePost);
router.post("/posts/create", postControllers.createPost);

export default router;
