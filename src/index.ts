import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";


dotenv.config();
const app = express();
const port = process.env.PORT;
const mongoUri = process.env.MONGO_URI!;

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true 
}));

app.use(express.json({ limit: "10mb" }));



app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

const connectToDb = async () => {
  try {
    await mongoose.connect(mongoUri, {});
    console.log("MongoDB conectado");
  } catch (error) {
    console.error(`Error de conexión a MongoDB: ${error}`);
  }
};
connectToDb();
