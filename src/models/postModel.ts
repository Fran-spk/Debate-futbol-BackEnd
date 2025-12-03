import mongoose, { Schema } from "mongoose";
import teams from "../data/teams.json"

const postSchema = new mongoose.Schema({
    user:{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content:{
        type: String,
        required: true
    },
    team:{
        type: String,
        required: false,
        enum:{ //solo acepta los strings que están en la lista
            values: teams as string[],
            message: '{VALUE} no es un equipo válido.'
        },
        index: true
    }
},
{
    timestamps: true //te crea createdAt y updatedAt automático
}
)

export default mongoose.model("Post", postSchema)