import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JwtPayload } from "../types/types";
const secretKey = process.env.JWT_SECRET!;
const jwtAccessExpiresIn = process.env.JWT_EXPIRES_IN!;
const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET!;
import User from "../models/userModel"


export const authMiddleware = (  req: Request,  res: Response,  next: NextFunction) => {
  const token = req.cookies.accessToken;

  if (!token) {
    return validateRefreshToken(req, res, next);
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    (req as any).user = decoded;    //guardar los datos de la verificacion en la request

    return next();
  } catch (error) {
    return validateRefreshToken(req, res, next);
  }
};

const validateRefreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    return res.status(401).json({ message: "El token es requerido" });
  }

  try {
    const decoded = jwt.verify(token, jwtRefreshSecret) as JwtPayload;

    const foundUser = await User.findById(decoded.userId || decoded._id);

    if(!foundUser)
      return res.status(401).json({message: "Usuario no encontrado"});

    const newPayload = {
      userId: foundUser._id.toString(),
      permissions: foundUser.permissions,
      email: foundUser.email
    };

    const accessToken = jwt.sign(
    newPayload,
    secretKey,
    {
      expiresIn: "1d"
    }
  );

    // Generamos nuevo access token
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 60 * 1000, // 1 minuto
    });

    (req as any).user = newPayload;   

    return next();
  } catch (error) {
    return res.status(401).json({ message: "Refresh token inválido", error });
  }
};
