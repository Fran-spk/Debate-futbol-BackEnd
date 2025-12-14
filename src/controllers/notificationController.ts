import { Request, Response } from "express";
import Post from "../models/postModel";
import  Notification  from "../models/notificationModel";
import notificationModel from "../models/notificationModel";

export const getAllNotifications = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    if (!user?.userId) {
      return res.status(401).json({ msg: "Usuario no autenticado" });
    }

    const notifications = await Notification.find({
      userRecive: user.userId,
      read: false
    })
      .populate("userSend", "name")
      .populate("post", "content")
      .sort({ createdAt: -1 });

    const response = notifications.map((n) => ({
      id: n._id,
      userSend: n.userSend,   
      post: n.post,       
      date: n.createdAt,
      type:
        n.type === "Like"
          ? "Like"
          : "Comment"         
    }));

    return res.json(response);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Error interno" });
  }
};


export const createNotification = async (req: Request, res: Response) => {
  try {
    const userSend = (req as any).user;
    const { postId: postId, userId: userRecive, type } = req.body;

    if (!userSend?.userId) {
      return res.status(401).json({ msg: "Usuario no autenticado" });
    }

    if (!["Like", "Comment"].includes(type)) {
      return res.status(400).json({ msg: "Tipo inválido" });
    }
    console.log(
      'notificaicon'
    );
    if (userSend.userId === userRecive) { //un mg o comentario a mi mismo
      return res.status(200).json({ msg: "Acción propia ignorada" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ msg: "Post no encontrado" });
    }

    if (type === "Like") {
      const existsLike = await Notification.findOne({
        userSend: userSend.userId,
        userRecive,
        post: postId,
        type: "Like"
      });

      if (existsLike) {
        return res.status(400).json({ msg: "Ya diste like" });
      }
    }

    await Notification.create({
      userSend: userSend.userId,
      userRecive,
      post: postId,
      type
    });

    return res.json({ msg: "Notificación creada" });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Error interno" });
  }
};


export const AllAsRead = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    if (!user?.userId) {
      return res.status(401).json({ msg: "Usuario no autenticado" });
    }

    const result = await Notification.updateMany({
         userRecive: user.userId, read: false},
        {read: true}
    );

    return res.json({
      msg: "Notificaciones marcadas como leídas",
      modified: result.modifiedCount
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Error interno" });
  }
};
