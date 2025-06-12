import { Router } from "express";
import commentsControllers from "../controllers/comments.controller.js";

const router = Router();

router.get("/posts/post/:id/comments", commentsControllers.getComments);
router.get("/posts/post/:id/comment/:id", commentsControllers.getCommentById);
router.post(
  "/posts/post/:id/comments/create",
  commentsControllers.createComment
);
router.put(
  "/posts/post/:id/comments/comment/update/:id",
  commentsControllers.updateComment
);
router.delete(
  "/posts/post/:id/comments/comment/delete/:id",
  commentsControllers.deleteComment
);

export default router;
