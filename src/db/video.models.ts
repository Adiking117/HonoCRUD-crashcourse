import {Schema,model} from "mongoose";

export interface favVideosSchema{
    title: string,
    description: string,
    thumbnailUrl? : string,
    watched: boolean,
    yuotuberName: string
}

const favVideosSchema = new Schema<favVideosSchema>({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    thumbnailUrl:{
        type:String,
        default:"https://placehold.co/600x400"
    },
    watched:{
        type: Boolean,
        default:false
    },
    yuotuberName:{
        type:String,
        required:true
    }
})

const favVideoModel = model("favVideoModel",favVideosSchema)

export default favVideoModel