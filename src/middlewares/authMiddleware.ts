import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JwtPayload } from "../types/types";
const secretKey = process.env.JWT_SECRET!;

const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET!;
import User from "../models/userModel"


export const authMiddleware = (  req: Request,  res: Response,  next: NextFunction) => {
  let token = req.cookies.accessToken;
  console.log(token)
  const authHeader = req.headers.authorization;
  if(!token && authHeader && authHeader.startsWith("Bearer ")){
    token = authHeader.split("")[1];
  }

  if (!token) {
    return validateRefreshToken(req, res, next);
  }


  try {
    const decoded = jwt.verify(token, secretKey);
    (req as any).user = decoded;    

    return next();
  } catch (error) {
    return validateRefreshToken(req, res, next);
  }
};

const validateRefreshToken = async (req: Request,res: Response,next: NextFunction) => {
  const token = req.cookies.refreshToken;
  const jwtAccesSecret = process.env.JWT_SECRET!;

  if (!token) {
    return res.status(401).json({ message: "El token es requerido" });
  }
  try {
     const decoded = jwt.verify(token, jwtRefreshSecret) as JwtPayload;
    const foundUser = await User.findById(decoded.userId || decoded._id);
    if(!foundUser)
      return res.status(401).json({message: "Usuario no encontrado"});

    const user = {
      _id: foundUser._id.toString(),
      permissions: foundUser.permissions,
      email: foundUser.email
    };
    const accessToken = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
        permissions: user.permissions
      },
      jwtAccesSecret,
      { expiresIn: "5m" }
    );

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 60 * 1000 * 10, 
    });

    (req as any).user = user;   

    return next();

  } catch (error) {
    console.log(error);
  }
   
};
