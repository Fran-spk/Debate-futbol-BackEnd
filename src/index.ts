import express from "express";
import serverless from "serverless-http";

const app = express();

/* ===== Ruta de prueba ÚNICA ===== */
app.get("/", (req, res) => {
  res.status(200).send("FASE 2: Express y serverless-http Funcionan.");
});

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