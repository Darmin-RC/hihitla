import { Router } from "express";
import userControllers from "../controllers/users.controller.js";

const router = Router();

router.get("/users", userControllers.getUsers);
router.get("/users/user/:id", userControllers.getUserById);
router.put("/users/update/:id", userControllers.updateUser);
router.delete("/users/delete/:id", userControllers.deleteUser);
router.post("/users/create", userControllers.createUser);

export default router;
