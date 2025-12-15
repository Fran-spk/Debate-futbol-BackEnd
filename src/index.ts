import express from "express";
import serverless from "serverless-http";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const app = express();

/* ===== Mongo (Conexión Serverless Optimizada) ===== */
let isConnected = false;
async function connectDB() {
  if (isConnected && mongoose.connection.readyState === 1) {
    console.log("Usando conexión MongoDB existente.");
    return;
  }
  
  try {
    await mongoose.connect(process.env.MONGO_URI!, {
      // Opciones Serverless
      // @ts-ignore
      bufferCommands: false, 
      serverSelectionTimeoutMS: 5000, 
    });

    mongoose.connection.on('connected', () => {
        console.log("MongoDB conectado exitosamente.");
        isConnected = true;
    });

    mongoose.connection.on('disconnected', () => {
        console.log("MongoDB desconectado.");
        isConnected = false;
    });

  } catch (error) {
    console.error("Error conectando a MongoDB:", error);
    throw error;
  }
}

/* ===== Ruta de prueba ÚNICA (Solo Express) ===== */
app.get("/", (req, res) => {
  res.status(200).send("Servidor Mínimo + MongoDB Conectado.");
});

/* 🚨 REMOVER: Aquí NO hay app.use(cookieParser()), app.use(express.json()) ni app.use(cors()) */


/* ===== VERCEL Handler ===== */
export default async function handler(req: any, res: any) {
  try {
    // Paso 1: Intentar la conexión a la DB
    await connectDB(); 
    
    // Paso 2: Ejecutar la aplicación Express
    return serverless(app)(req, res);
  } catch (error) {
    console.error("Error en handler:", error);
    return res.status(500).json({ error: "Error de servidor durante el inicio." });
  }
}

// 🚨 REMOVER: Todo el bloque if (process.env.NODE_ENV !== "production") {} para esta prueba.