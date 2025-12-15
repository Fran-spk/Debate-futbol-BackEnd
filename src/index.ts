import express from "express";
import serverless from "serverless-http";
import dotenv from "dotenv";

// 🚨 SOLO DEJA ESTAS IMPORTACIONES 🚨
// Las importaciones de cors, cookieParser, mongoose, userRoutes, authRoutes, etc. deben eliminarse o comentarse.

dotenv.config();

const app = express();

/* ===== Ruta de prueba ÚNICA ===== */
app.get("/", (req, res) => {
  res.status(200).send("Servidor ULTRA MÍNIMO FUNCIONANDO.");
});

// 🚨 SIN app.use para CORS, Middlewares, o Rutas de API 🚨

/* ===== VERCEL Handler ===== */
export default async function handler(req: any, res: any) {
  try {
    // Ejecuta la aplicación Express Pura
    return serverless(app)(req, res);
  } catch (error) {
    console.error("Error en handler:", error);
    return res.status(500).json({ error: "Error de servidor inesperado." });
  }
}