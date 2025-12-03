import { createPost, deletePost, getPost, getPosts, updatePost } from "../controllers/postController"
import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = express.Router();

//público
router.get("/", getPosts);
router.get("/:id", getPost);

//necesita estar logueado
router.post("/",authMiddleware,createPost);
router.delete("/:id",authMiddleware, deletePost);
router.put("/:id",authMiddleware, updatePost);

export default router;
