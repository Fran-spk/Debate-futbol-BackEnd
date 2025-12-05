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
        const loggedUser = (req as any).user;
        
        const newPost = {
            content: req.body.content,
            team: req.body.team,        //arma el objeto con userid del user logueado
            user: loggedUser.userId
        };

        const post = await Post.create(newPost);

        await post.populate('user', 'name team active');
        res.status(201).json(post);

    } catch (error) {
        res.status(500).json({ message: 'Error al crear el post', error})
    }
};


export const deletePost = async (req: Request, res: Response) => {
    try {
        const {id} = req.params;
        
        await Post.findByIdAndDelete(id);

        res.json({ message: 'Post eliminado correctamente'});

    } catch (error) {
        res.status(500).json({error: error})
    }
}