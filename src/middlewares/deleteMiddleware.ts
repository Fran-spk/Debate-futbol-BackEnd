import { Model } from "mongoose";
import { Request, Response, NextFunction } from "express";

const deleteMiddleware = (ResourceModel: Model<any>) => {
    return async (req: Request, res: Response, next: NextFunction) =>{
        try {
            const {id} = req.params;
            const userLogueado = (req as any).user;

            if(!userLogueado)
                return res.status(401).json({message: "Usuario no autenticado"})

            const resource = await ResourceModel.findById(id); //trae el objeto(Post o Comment)

            if(!resource)
                return res.status(404).json({message: "Recurso no encontrado"});

            const isOwner = resource.user.toString() === userLogueado.userId;
            const isAdmin = userLogueado.permissions.includes("admin")

            if (isOwner || isAdmin){
                next();
            }
            else{
                return res.status(403).json({message: "No tiene permisos para realizar esta acción"})
            }
        } catch (error) {
            return res.status(500).json({error})
        }
    }
}

export default deleteMiddleware;