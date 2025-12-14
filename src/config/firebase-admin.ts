import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

const serviceAccount = require("./debate-futbol-firebase-admin.json");
try {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount)
    });
    console.log("Firebase andando");
    
} catch (error) {
    console.error("Error al inicializar Firebase:", error);    
}

export const firebaseAuth = admin.auth();
