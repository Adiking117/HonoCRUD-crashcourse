import { Hono } from 'hono'
import { poweredBy } from 'hono/powered-by'
import { logger } from 'hono/logger'
import dbConnect from './db/connect'
import favVideoModel from './db/video.models'
import { isValidObjectId } from 'mongoose'
import { stream, streamText } from 'hono/streaming'


const app = new Hono()

//middlewares
app.use(poweredBy())
app.use(logger())


dbConnect()
  .then(
    async()=>{
      // Get List
      app.get('/', async (c) => {
        const documents = await favVideoModel.find()
        return c.json(
          documents.map((d)=> d.toObject()),200
        )
      })

      // Create Document
      app.post('/add', async(c) => {
        const formData = await c.req.json()
        if(!formData.thumbnailUrl){
          delete formData.thumbnailUrl
        }
        const favVideoObject = new favVideoModel(formData)
        try{
          const document = await favVideoObject.save()
          return c.json(
            document.toObject(),200
          )
        } catch(error){
          return c.json(
            (error as any)?.message || "Internal server Error",500
          )
        }
      })

      // View DocumnetById
      app.get('/documents/:id', async(c) => {
        const {id} = c.req.param()
        if(!isValidObjectId(id)){
          return c.json("Invalid ID",400)
        }
        const document = await favVideoModel.findById(id)
        if(!document){
          return c.json("Document Not Found",404)
        }

        return c.json(document?.toObject(),200)
      })

      // Stream Document
      app.get('/documents/:id/stream', async(c)=>{
        const {id} = c.req.param()
        if(!isValidObjectId(id)){
          return c.json("Invalid ID",400)
        }
        const document = await favVideoModel.findById(id)
        if(!document){
          return c.json("Document Not Found",404)
        }

        return streamText(c,async(stream)=>{
          stream.onAbort(()=>{
            console.log("Aborted")
          })
          for(let i = 0 ; i< document.description.length ; i++){
            await stream.write(document.description[i])
            await stream.sleep(50)
          }
        })
      })

      // update Document
      app.put("/documents/:id/update", async(c)=>{
        const {id} = c.req.param()
        if(!isValidObjectId(id)){
          return c.json("Invalid ID",400)
        }
        const document = await favVideoModel.findById(id)
        if(!document){
          return c.json("Document Not Found",404)
        }

        const formData = await c.req.json()
        if(!formData.thumbnailUrl) delete formData.thumbnailUrl
        try{
          const updatedDcoument = await favVideoModel.findByIdAndUpdate(
            id,
            formData,
            {
              new:true
            }
          )
          return c.json(updatedDcoument?.toObject(),200)
        } catch(error){
          return c.json(
            (error as any)?.message || "Internal server Error",500
          )
        }
      })

      // delete document
      app.delete('/documents/:id/delete', async(c)=>{
        const id = c.req.param()
        if(!isValidObjectId(id)){
          return c.json("Invalid ID",400)
        }
        const document = await favVideoModel.findByIdAndDelete(id)
        if(!document){
          return c.json("Document Not Found",404)
        }
        return c.json("Documnet deleted ",200)
      })
    }
  )
  .catch((err)=>{
    app.get('/*',(c)=>{
      return c.text(`Faield to connect ${err.message}`)
    })
  })

app.onError((err,c)=>{
  return c.text(`App error : ${err.message}`)
})

export default app
