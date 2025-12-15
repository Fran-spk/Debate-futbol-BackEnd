// index.ts (TEMPORAL para la prueba)

/**
 * Esta es una función serverless mínima de Vercel.
 * Si esto funciona, el problema está en tu configuración de Express/serverless-http.
 * Si esto NO funciona, el problema está en la configuración del build de Vercel.
 */
export default async function handler(req: any, res: any) {
  // Configura las cabeceras para prevenir problemas de CORS o caché
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "text/plain");

  // Envía una respuesta simple con código 200
  res.status(200).send("¡Servidor de prueba Vercel funcionando correctamente!");
}

// Nota: Asegúrate de eliminar o comentar cualquier otra exportación
// como 'connectDB' o las llamadas a 'app.listen' para evitar conflictos.