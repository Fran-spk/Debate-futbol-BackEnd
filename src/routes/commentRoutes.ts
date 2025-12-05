import express from "express"
import { createComment, deleteComment, getComments } from "../controllers/commentController";
import { authMiddleware } from "../middlewares/authMiddleware";
import Comment from "../models/commentModel"
import deleteMiddleware from "../middlewares/deleteMiddleware";

const router = express.Router();

//público
router.get("/:postId", getComments);

//necesita estar logueado
router.post("/", authMiddleware, createComment);
router.delete("/:id", authMiddleware, deleteMiddleware(Comment), deleteComment);

export default router;