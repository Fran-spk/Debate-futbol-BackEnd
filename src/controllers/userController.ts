import { Request, Response } from "express";
import User from "../models/userModel";
import { CreateUserDto } from "../dto/create-user.dto";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

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
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

export const getUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
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

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndUpdate(id, req.body);

    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

export const login = async (req: Request, res: Response) =>{
  const {email, password} = req.body;
  const jwtAccesSecret = process.env.JWT_SECRET;
  const jwtAccesExpiresIn = process.env.JWT_EXPIRES_IN;
  const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
  const jwtRefreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN;

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
    {userId: findUser.id.toString(), email: findUser.email},
    jwtAccesSecret,
    {expiresIn: '1h'}
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
    maxAge: 60* 1000
  });

    res.cookie('refreshToken', refreshToken,{
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 1000 * 60 * 24 * 7
  });

  return res.json({
    id: findUser._id,
    name: findUser.name,
    userName: findUser.name,
    email: findUser.email,
    permissionLevel: findUser.permissions,
    team: findUser.team,
    active: findUser.active
  })
};

export const logout = async(req: Request, res: Response) =>{
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  return res.json({message:"Logout existoso"});
};