import {
  getUser,
  googleLogin,
  login,
  logout,
  registerUser
} from "../controllers/userController";
import express, { response } from "express";
import validationMiddleware from "../middlewares/validationMiddleware";
import { CreateUserDto } from "../dto/create-user.dto";
import { authMiddleware } from "../middlewares/authMiddleware";
import { request } from "http";
import { isLikeByPost } from "../controllers/likesController";
const router = express.Router();

router.post("/register",validationMiddleware(CreateUserDto), registerUser);
router.post("/login",login);
router.post("/google",googleLogin);
router.post("/logout",logout);
router.get("/me", authMiddleware,getUser);
router.get("/isLike/:postId",authMiddleware, isLikeByPost);


export default router;
