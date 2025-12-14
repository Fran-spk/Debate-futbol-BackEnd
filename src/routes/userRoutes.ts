import { isLikeByPost } from "../controllers/likesController";
import {
  activeUser,
  deleteUser,
  getUserById,
  getUsers,
  updateUser,
} from "../controllers/userController";
import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = express.Router();

//info pública
router.get("/:id", getUserById);


router.use(authMiddleware);
router.get("/", getUsers);
router.delete("/:id", deleteUser);
router.patch("/:id/activate", activeUser);
router.put("/:id",updateUser);


export default router;
