import {
  getUser,
  login,
  logout,
  registerUser
} from "../controllers/userController";
import express, { response } from "express";
import validationMiddleware from "../middlewares/validationMiddleware";
import { CreateUserDto } from "../dto/create-user.dto";
import { authMiddleware } from "../middlewares/authMiddleware";
import { request } from "http";
const router = express.Router();

router.post("/register",validationMiddleware(CreateUserDto), registerUser);
router.post("/login",login);
router.post("/logout",logout);
router.get("/me", authMiddleware,getUser);


export default router;
