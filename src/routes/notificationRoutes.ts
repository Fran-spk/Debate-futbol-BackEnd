import { Router } from "express";
import {
  createNotification,
  AllAsRead,
  getAllNotifications
} from "../controllers/notificationController";


const router = Router();

router.post("/",createNotification);
router.get("/",getAllNotifications);
router.patch("/readAll",AllAsRead);

export default router;
