import { Request, Response } from "express";
import Post from "../models/postModel";
import Like from "../models/likeModel";

export const likePost = async (req: Request, res: Response) => {
  try {
    const authUser = (req as any).user;  
    const postId = req.params.id;

    if (!authUser?.userId) {
      return res.status(401).json({ msg: "Usuario no autenticado" });
    }

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ msg: "Post no encontrado" });


    const exists = await Like.findOne({ user: authUser.userId, post: postId });
    if (exists) return res.status(400).json({ msg: "Ya diste like" });
    await Like.create({ user: authUser.userId, post: postId });

    return res.json({ msg: "Like agregado" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Error interno" });
  }
};

export const unlikePost = async (req: Request, res: Response) => {
  try {
    const authUser = (req as any).user;
    const postId = req.params.id;

    if (!authUser?.userId) {
      return res.status(401).json({ msg: "Usuario no autenticado" });
    }

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ msg: "Post no encontrado" });

    const like = await Like.findOne({ user: authUser.userId, post: postId });
    if (!like) {
      return res.status(400).json({ msg: "No habías dado like a este post" });
    }

    await Like.deleteOne({ _id: like._id });

    return res.json({ msg: "Like eliminado" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Error interno" });
  }
};



export const getLikesCount = async (req: Request, res: Response) => {
  try {
    const { id: postId } = req.params;

    const count = await Like.countDocuments({ post: postId });

    return res.json({ count });
  } catch (error) {
    console.error("Error obteniendo cantidad de likes:", error);
    return res.status(500).json({ error: "Error al obtener cantidad de likes" });
  }
};

export const isLikeByPost = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId || (req as any).user._id;
    const { postId } = req.params; 
    if (!userId || !postId) {
      return res.status(400).json({ error: "Faltan parámetros userId o postId" });
    }
    const like = await Like.findOne({ user: userId, post: postId });
    return res.json({ liked: !!like });
  } catch (error) {
    console.error("Error verificando like:", error);
    return res.status(500).json({ error: "Error al verificar like" });
  }
};

