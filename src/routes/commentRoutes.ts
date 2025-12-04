import express from "express"
import { createComment, deleteComment, getComments } from "../controllers/commentController";
import { authMiddleware } from "../middlewares/authMiddleware";


const router = express.Router();

//público
router.get("/:postId", getComments);

//necesita estar logueado
router.post("/", authMiddleware, createComment);
router.delete("/:id", authMiddleware, deleteComment);

export default router;