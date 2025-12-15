import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import serverless from "serverless-http";
import mongoose from "mongoose";
import dotenv from "dotenv";

// 🚨 NO DEBE HABER INICIALIZACIÓN DE FIREBASE ADMIN AQUÍ 🚨
// Si usas Firebase, debes inicializarlo dentro de las funciones que lo requieran (inicialización perezosa).

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
  // Usamos readyState === 1 para asegurar que la conexión está abierta
  if (isConnected && mongoose.connection.readyState === 1) {
    console.log("Usando conexión MongoDB existente.");
    return;
  }
  
  try {
    await mongoose.connect(process.env.MONGO_URI!, {
      // Opciones CLAVE para serverless:
      // Desactiva el buffering de comandos para prevenir timeouts
      // @ts-ignore
      bufferCommands: false, 
      // Tiempo límite estricto para la selección del servidor
      serverSelectionTimeoutMS: 5000, 
    });

    // Se establece como conectado solo cuando el evento 'connected' se dispara
    mongoose.connection.once('connected', () => {
        console.log("MongoDB conectado exitosamente.");
        isConnected = true;
    });

    // Manejo de desconexión
    mongoose.connection.on('disconnected', () => {
        console.log("MongoDB desconectado.");
        isConnected = false;
    });

  } catch (error) {
    console.error("Error conectando a MongoDB:", error);
    throw error;
  }
}

/* ===== Ruta de prueba ===== */
app.get("/", (req, res) => {
  res.send("Servidor funcionando");
});

/* ===== Routes (Todas tus rutas activas) ===== */
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/notifications", authMiddleware, notificationRoutes);

/* ================================== */
/* ===== LOCAL =====         */
/* ================================== */
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;

  // En local, conectamos la DB y luego escuchamos el puerto
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`API running on http://localhost:${PORT}`);
    });
  });
}

/* ================================== */
/* ===== VERCEL HANDLER =====         */
/* ================================== */
export default async function handler(req: any, res: any) {
  try {
    // Paso 1: Asegurar que la DB esté conectada
    await connectDB(); 
    
    // Paso 2: Ejecutar la aplicación Express a través del wrapper serverless
    return serverless(app)(req, res);
  } catch (error) {
    console.error("Error en handler:", error);
    return res.status(500).json({ error: "Error interno del servidor. Revisar logs." });
  }
}