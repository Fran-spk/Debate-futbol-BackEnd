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

/* ===== Mongo ===== */
let isConnected = false;
async function connectDB() {
  if (isConnected) return;
  try {
    await mongoose.connect("mongodb+srv://franspk:fran2214@clusterspk.ddxmn5b.mongodb.net/debate_futbol_db?appName=ClusterSpk");
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
