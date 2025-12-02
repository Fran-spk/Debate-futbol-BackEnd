import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JwtPayload } from "../types/types";
const secretKey = process.env.JWT_SECRET!;
const jwtAccessExpiresIn = process.env.JWT_EXPIRES_IN!;
const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET!;

export const authMiddleware = (  req: Request,  res: Response,  next: NextFunction) => {
  const token = req.cookies.accessToken;

  if (!token) {
    return validateRefreshToken(req, res, next);
  }

  try {
    jwt.verify(token, secretKey);
    return next();
  } catch (error) {
    return validateRefreshToken(req, res, next);
  }
};

const validateRefreshToken = (
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
    const accessToken = jwt.sign(
    { _id: decoded._id },
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

    return next();
  } catch (error) {
    return res.status(401).json({ message: "Refresh token inválido", error });
  }
};
