import express from "express";
import serverless from "serverless-http";

const app = express();

app.get("/", (req, res) => res.send("Servidor funcionando"));

export default function handler(req: any, res: any) {
  return serverless(app)(req, res);
}
