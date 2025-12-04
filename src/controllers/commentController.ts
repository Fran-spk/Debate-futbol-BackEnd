import { Request, Response } from "express";
import Comment from "../models/commentModel";

export const getComments = async (req:Request, res: Response) =>{
    try{
        const {postId} = req.params;

        const comments = await Comment.find({postId: postId})
            .sort({createdAt: -1})
            .populate('user', 'name team active')

        res.status(200).json(comments);
    } catch (error){
        res.status(500).json({error: error})

    }
};

export const createComment = async (req: Request, res: Response) => {
    try {
        const comment = await Comment.create(req.body);
        res.status(201).json(comment);

    } catch (error) {
        res.status(500).json({message: 'Error al crear comentario', error})        
    }
}

export const deleteComment = async (req: Request, res: Response) => {
    try {
        const {id} = req.params
        const comment = await Comment.findByIdAndDelete(id);
        if(!comment)
            return res.status(404).json({error: 'Comentario no encontrado'})
        res.json({message: 'Comentario  eliminado correctamente'})
    } catch (error) {
        res.status(500).json({error: error})
    }
}