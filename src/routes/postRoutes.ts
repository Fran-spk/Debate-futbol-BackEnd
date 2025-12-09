import { createPost, deletePost, getPost, getPosts, getPostsByUser} from "../controllers/postController"
import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import deleteMiddleware from "../middlewares/deleteMiddleware";
import Post from "../models/postModel";
import { likePost, unlikePost } from "../controllers/likesController";

const router = express.Router();

//público
router.get("/", getPosts);
router.get("/:id", getPost);
router.get("/user/:userId", getPostsByUser);


//necesita estar logueado
router.post("/",authMiddleware, createPost);
router.delete("/:id",authMiddleware,deleteMiddleware(Post), deletePost);
router.post("/:id/like", authMiddleware, likePost);
router.delete("/:id/like", authMiddleware, unlikePost);
export default router;
