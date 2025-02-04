import { Hono } from "hono";
import { handle } from "hono/vercel";


export const runtime="nodejs"


const app=new Hono().basePath('/api')

app.get('/hello',(c)=>{
    return c.text("hey baby ")
})

export const GET=handle(app)
export const POST=handle(app)



