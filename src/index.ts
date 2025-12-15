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

// Carga las variables de entorno
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
  
  // Intentar reconectar si la conexión anterior falló o no existe
  try {
    await mongoose.connect(process.env.MONGO_URI!, {
      // 🚨 CLAVE PARA SERVERLESS 🚨
      // Desactiva el buffering de comandos. Crucial para prevenir timeouts.
      // @ts-ignore
      bufferCommands: false, 
      serverSelectionTimeoutMS: 5000, 
    });

    // Configurar el listener para confirmar que la conexión está lista
    mongoose.connection.on('connected', () => {
        console.log("MongoDB conectado exitosamente.");
        isConnected = true;
    });
    
    // Configurar listener para reconexión en caso de desconexión
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

/* ===== Routes ===== */
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
/* ===== VERCEL =====         */
/* ================================== */
// Exporta la función handler para el entorno serverless de Vercel
export default async function handler(req: any, res: any) {
  try {
    // Asegura la conexión a la DB antes de procesar la solicitud
    await connectDB(); 
    
    // Usa serverless-http para envolver la app de Express
    return serverless(app)(req, res);
  } catch (error) {
    console.error("Error en handler:", error);
    return res.status(500).json({ error: "Error en el servidor." });
  }
}