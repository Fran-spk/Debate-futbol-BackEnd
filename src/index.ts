import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import mongoose from "mongoose";
import dotenv from "dotenv";
import { IncomingMessage, ServerResponse } from 'http'; 

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

/* ===== Mongo (Conexión Serverless Optimizada) ===== */
let isConnected = false;
async function connectDB() {
  if (isConnected && mongoose.connection.readyState === 1) {
    console.log("Usando conexión MongoDB existente.");
    return;
  }
  try {
    await mongoose.connect(process.env.MONGO_URI!, {
      // Opciones CLAVE para serverless:
      // @ts-ignore
      bufferCommands: false, 
      serverSelectionTimeoutMS: 5000, 
    });
    
    mongoose.connection.once('connected', () => {
        console.log("MongoDB conectado exitosamente.");
        isConnected = true;
    });

  } catch (error) {
    console.error("Error conectando a MongoDB:", error);
    throw error;
  }
}

/* ===== Ruta de prueba ===== */
app.get("/", (req, res) => {
  res.send("Servidor funcionando (FINAL)");
});

/* ===== Routes (Tus rutas de API) ===== */
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/notifications", authMiddleware, notificationRoutes);

/* ===== LOCAL & VERCEL Handlers ===== */

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;

  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`API running on http://localhost:${PORT}`);
    });
  });
}

/* ========================================= */
/* ===== VERCEL HANDLER (MÉTODO NATIVO) ===== */
/* ========================================= */
// Vercel llama a esta función. Ejecuta la lógica de Express nativamente.
export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    // 1. Asegura la conexión a la DB
    await connectDB(); 
    
    // 2. Delega el control de la solicitud a Express
    // Esto reemplaza la función de serverless-http
    app(req, res);
  } catch (error) {
    console.error("Error en handler o DB:", error);
    // Si la conexión a la DB falla, devuelve 500
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: "Error interno del servidor. Revisar logs." }));
  }
}