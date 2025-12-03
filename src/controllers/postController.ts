import {Request, Response} from "express";
import Post from "../models/postModel";


export const getPosts = async (req: Request, res: Response)=>{
    try {
        const {team} = req.query;
        const filter: any ={};
        if(team){
            filter.team = team;
        }

        const posts = await Post.find(filter)   //filtra
            .populate('user', 'name team')  //trae el nombre de usuario y el equipo 
            .sort({createdAt: -1});  //ordena del mas nuevo al mas viejo

        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({error: error})
    }
};

export const getPost = async (req: Request, res: Response) =>{
    try {
        const post = await Post.findById(req.params.id)
            .populate('user','name team');
        if (!post) {
            return res.status(404).json({ error: 'Post no encontrado' });
        }

        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({error: error})
    }
};

export const createPost = async (req: Request, res: Response) => {
    try {
        const post = await Post.create(req.body);
        res.status(201).json(post);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear el post', error})
    }
};


export const deletePost = async (req: Request, res: Response) => {
    try {
        const {id} = req.params;
        const post = await Post.findByIdAndDelete(id);
        if (!post)
            return res.status(404).json({ error: 'Post no encontrado'})
        res.json({ message: 'Post eliminado correctamente'});
    } catch (error) {
        res.status(500).json({error: error})
    }
}


export const updatePost = async (req: Request, res: Response) => {

    try {
            const {id} = req.params;
            const post = await Post.findByIdAndUpdate(id, req.body, {new: true});
            if (!post)
                return res.status(404).json({ error: 'Post no encontrado'});

            res.status(200).json(post);
    } catch (error) {
        res.status(500).json({error: error})
    }
}