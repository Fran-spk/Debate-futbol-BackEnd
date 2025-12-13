import { Router } from "express";
import {
  createNotification,
  AllAsRead,
  getAllNotifications
} from "../controllers/notificationController";


const router = Router();

router.post("/:postId/:userId/:type",createNotification);
router.get("/getNotifications",getAllNotifications);
router.patch("/readAll",AllAsRead);

export default router;
