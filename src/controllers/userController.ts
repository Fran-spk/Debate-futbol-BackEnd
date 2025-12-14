import { Request, Response } from "express";
import User from "../models/userModel";
import { CreateUserDto } from "../dto/create-user.dto";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import {firebaseAuth} from "../config/firebase-admin";


dotenv.config();

export const registerUser = async (req: Request, res: Response) => {
  try {
    const user : CreateUserDto = req.body;
    const hashPassword = await bcrypt.hash(user.password, 10);

    const permission = req.body.permissions || ["user"]

    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: hashPassword,
      permissions: permission,
      team: req.body.team,
      active: req.body.active
    });
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

export const getUsers = async (req: Request, res: Response) => {
  try {

    const loggedUser = (req as any).user;
    let filter: any = { active: true };  

    if (loggedUser && loggedUser.permissions && loggedUser.permissions.includes("admin")) {
      filter = {}; 
    }
    const users = await User.find(filter);
    res.status(200).json(users);
  
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const targetUserId = req.params.id;    
    if (!targetUserId) {
        return res.status(400).json({ message: "ID de usuario requerido." });
    }
    const user = await User.findById(targetUserId).select('-password'); 
    if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado." });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    res.status(500).json({ error: "Error interno del servidor." }); 
  }
};

export const getUser = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId || (req as any).user._id;
     const user = await User.findById(userId);
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndUpdate(
      id,
      {active: false},
      {new: true}
    );

    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    res.json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

export const activeUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
        const user = await User.findByIdAndUpdate(
      id,
      {active: true},
      {new: true}
    );

    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    res.json({ message: "Usuario activado correctamente" });
  } catch (error) {
    res.status(500).json({ error: error });
  }
}


export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndUpdate(id, req.body, { new: true });

    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

export const login = async (req: Request, res: Response) =>{
  const {email, password} = req.body;
  const jwtAccesSecret = process.env.JWT_SECRET;
  const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;


  const findUser = await User.findOne({email});
  if(!findUser) return res.status(404).json({message:"Usuario no encontrado"});

  if(findUser.active == false)
    return res.status(403).json({message: "Esta cuenta fue desactivada"});
  

  const isMatch = await bcrypt.compare(password,findUser.password);
  if(!isMatch) return res.status(401).json({message:"Credenciales invalidas"});

  if(!jwtRefreshSecret || !jwtAccesSecret){
    return res.status(500).json({message: "JWT no fue definido"});
  }

const accessToken = jwt.sign(
    {
      userId: findUser._id.toString(),
      email: findUser.email,
      permissions: findUser.permissions
    },
    jwtAccesSecret,
    { expiresIn: "5m" }
  );

    const refreshToken = jwt.sign(
    { userId: findUser._id.toString() },
    jwtRefreshSecret,
    { expiresIn: "10d" }
  );

  res.cookie('accessToken', accessToken,{
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 1000 * 6
  });

    res.cookie('refreshToken', refreshToken,{
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 1000 * 60 * 24 * 7
  });

  return res.json({
    _id: findUser._id,
    name: findUser.name,
    userName: findUser.name,
    email: findUser.email,
    permissions: findUser.permissions,
    team: findUser.team,
    active: findUser.active
  })
};

export const logout = async(req: Request, res: Response) =>{
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  return res.json({message:"Logout existoso"});
};


export const googleLogin = async(req: Request, res: Response) =>{
  try {
    const jwtAccesSecret = process.env.JWT_SECRET;
    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
    
    const {firebaseToken} = req.body;

    if(!jwtRefreshSecret || !jwtAccesSecret){
      return res.status(500).json({message: "JWT no fue definido"});
    }


    if(!firebaseToken){
      return res.status(400).json({message: "Token de Firebase es requerido"});
    }


    const decodedToken = await firebaseAuth.verifyIdToken(firebaseToken);

    const {uid, email, name} = decodedToken;

    let user = await User.findOne({email});


  if(!user){
    user = await User.create({

      name: name,
      email: email,
      password: uid,
      permissions: ["user"],
      active: true
    }
  )};

    //lo mismo que en el login normal

  const accessToken = jwt.sign(
  {
    userId: user._id.toString(),
    email: user.email,
    permissions: user.permissions
  },
  jwtAccesSecret,
  { expiresIn: "5m" }
  );

  const refreshToken = jwt.sign(
  { userId: user._id.toString() },
  jwtRefreshSecret,
  { expiresIn: "10d" }
  );

  res.cookie('accessToken', accessToken,{
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 1000 * 6
  });

    res.cookie('refreshToken', refreshToken,{
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 1000 * 60 * 24 * 7
  });

  return res.json({
    _id: user._id,
    name: user.name,
    userName: user.name,
    email: user.email,
    permissions: user.permissions,
    team: user.team,
    active: user.active
  });
    
  } catch (error) {
    console.error('Social login error:', error);
    return res.status(401).json({ message: "Token inválido" });
  }
}