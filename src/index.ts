import express from "express";
// 🚨 NO IMPORTAR serverless-http 🚨
// Importamos el Request y Response de Node para el handler de Vercel
import { IncomingMessage, ServerResponse } from 'http'; 

const app = express();

/* ===== Ruta de prueba ÚNICA ===== */
app.get("/", (req, res) => {
  res.status(200).send("FASE 2: Express Sin Wrapper Funciona.");
});

/* ===== VERCEL Handler - Método Nativo Vercel/Node ===== */

// Usamos el tipo de Vercel para el handler (el Request y Response nativos de Node)
export default function handler(req: IncomingMessage, res: ServerResponse) {
    // Le pasamos el control del routing directamente a la app de Express.
    // Express internamente utiliza los objetos req y res de Node para manejar la solicitud.
    app(req, res); 
}