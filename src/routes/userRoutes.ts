import {
  activeUser,
  deleteUser,
  getUserById,
  getUsers,
  updateUser,
} from "../controllers/userController";
import express from "express";

const router = express.Router();

router.get("/", getUsers);
router.get("/:id", getUserById);
router.delete("/:id", deleteUser);
router.patch("/:id/activate", activeUser);
router.put("/:id",updateUser);


export default router;
