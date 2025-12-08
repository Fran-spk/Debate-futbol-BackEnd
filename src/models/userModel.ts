import mongoose from "mongoose";
import teams from "../data/teams.json"

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    },
    team:{
        type: String,
        required: false,
        enum:{
            values: teams as string[],
            message: '{VALUE} no es un equipo válido.'
        }
    },
    permissions: {
    type: [String],
    enum: ["admin", "user"],
    default: ["admin","user"]
    },
    active: {
        type: Boolean,
        default: true
    }
})

export default mongoose.model("User", userSchema)