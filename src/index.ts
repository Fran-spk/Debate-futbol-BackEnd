import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import serverless from "serverless-http";
import mongoose from "mongoose";
import dotenv from "dotenv";

import userRoutes from "./routes/userRoutes";
import authRoutes from "./routes/authRoutes";
import postRoutes from "./routes/postRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import commentRoutes from "./routes/commentRoutes";
import { authMiddleware } from "./middlewares/authMiddleware";

dotenv.config();

const app = express();

/* ===== CORS ===== */
const allowedOrigins: string[] = [
  "http://localhost:5173",
  process.env.CLIENT_URL
].filter((o): o is string => Boolean(o));

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

/* ===== Middlewares ===== */
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));

/* ===== Mongo ===== */
let isConnected = false;
async function connectDB() {
  if (isConnected) return;
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log("MongoDB conectado");
    isConnected = true;
  } catch (error) {
    console.error("Error conectando a MongoDB:", error);
    throw error;
  }
}

/* ===== Ruta de prueba ===== */
app.get("/", (req, res) => {
  res.send("Servidor funcionando");
});

/* ===== Routes ===== */
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/notifications", authMiddleware, notificationRoutes);

/* ===== LOCAL ===== */
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;

  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`API running on http://localhost:${PORT}`);
    });
  });
}

/* ===== VERCEL ===== */
export default async function handler(req: any, res: any) {
  try {
    await connectDB();
    return serverless(app)(req, res);
  } catch (error) {
    console.error("Error en handler:", error);
    return res.status(500).json({ error: "Error conectando a la DB" });
  }
}
