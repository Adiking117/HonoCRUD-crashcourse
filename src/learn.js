import { Hono } from "hono";
import { v4 as uuidv4 } from "uuid";
import { stream, streamText } from 'hono/streaming'
let videos = []

const app = new Hono()

app.get("/",(c)=>{
    return c.html('<h1>Welcome to adi hono</h1>')
})

app.post("/add-video",async(c)=>{
    const {videoName,channelName,duration} = await c.req.json()
    const newVideo = {
        id: uuidv4(),
        videoName,
        channelName,
        duration
    }
    videos.push(newVideo)
    return c.json(newVideo)
})

// Read All Data(using stream)

app.get('/videos',(c)=>{
    return streamText(c,async(stream)=>{
        for(const v of videos){
            await stream.writeln(JSON.stringify(v))
            await stream.sleep(1000)
        }
    })
})


// Read By Id
app.get("/video/:id",(c)=>{
    const {id} = c.req.param()
    const video = videos.find((v)=> v.id === id)
    if(!video){
        return c.json({message:"Video Not found"},404)
    }
    return c.json(video)
})

// Update
app.put("/video/:id/update",async(c)=>{
    const {id} = c.req.param()
    const index = videos.findIndex((v)=> v.id === id)
    if(index===-1){
        return c.json({message:"Video Not found"},404)
    }
    const {videoName,channelName,duration} = await c.req.json()
    videos[index]= {...videos[index] , videoName, channelName, duration}
    return c.json(videos[index])
})  


// delete videos
app.delete("/video/:id/delete",(c)=>{
    const {id} = c.req.param()
    videos = videos.filter((v)=> v.id !== id)
    return c.json({message:"Video deleted"})
}) 

app.delete("/videos/delete",(c)=>{
    videos = []
    return c.json({message:"Videos deleted"})
}) 

export default app