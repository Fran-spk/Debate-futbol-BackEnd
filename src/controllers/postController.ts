import {Request, Response} from "express";
import Post from "../models/postModel";
import like from "../models/likeModel";

export const getPosts = async (req: Request, res: Response) => {
  try {
    const { team } = req.query;
    const filter: any = {};

    if (team) {
      filter.team = team;
    }

    const posts = await Post.find(filter)
      .populate("user", "name team")
      .sort({ createdAt: -1 });

    const postsWithLikes = await Promise.all(
      posts.map(async (post) => {
        const countLikes = await like.countDocuments({ post: post._id });
        return { ...post.toObject(), countLikes };
      })
    );

    res.status(200).json(postsWithLikes);
  } catch (error) {
    res.status(500).json({ error });
  }
};


export const getPostsByUser = async(req: Request, res: Response) =>{
    try {
        const {userId} = req.params;

        const posts = await Post.find({user: userId})
            .populate('user', 'name team')
            .sort({createdAt: -1})
            const postsWithLikes = await Promise.all(
            posts.map(async (post) => {
                const countLikes = await like.countDocuments({ post: post._id });
                return { ...post.toObject(), countLikes };
            })
            );

            res.status(200).json(postsWithLikes)

        } catch (error) {
            
            res.status(500).json({error: error })
    }
}



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


