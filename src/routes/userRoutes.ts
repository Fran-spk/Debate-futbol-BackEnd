import {
  registerUser,
  deleteUser,
  getUser,
  getUsers,
  updateUser,
  login,
} from "../controllers/userController";
import express from "express";
import validationMiddleware from "../middlewares/middleware";

import { UpdateUserDto } from "../dto/update-user.dto";

const router = express.Router();

router.get("/", getUsers);
router.get("/:id", getUser);
router.delete("/:id", deleteUser);
router.put("/:id", validationMiddleware(UpdateUserDto), updateUser);


export default router;
