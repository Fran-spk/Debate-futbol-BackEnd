// index.ts - FASE 1: ULTRA MÍNIMO

export default async function handler(req: any, res: any) {
  res.status(200).send("FASE 1: Handler Puro Funciona.");
}

// 🚨 Asegúrate de que tu Build Command en Vercel sea 'npm run build' y Output Directory sea 'dist'.