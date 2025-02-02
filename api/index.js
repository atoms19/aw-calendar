const express = require("express")
const path=require("path")
const cors=require("cors")



const PORT=3000
let app =express()

app.use(cors())

app.use(express.static(path.join(__dirname,'../frontend/dist')))
app.get("/",(req,res)=>res.send("Express on Vercel"))
app.get("/jokes",(req,res)=>res.json({

    "app":"redicer",
    "author":"atoms"
}))


app.listen(PORT,()=>{
    console.log("server running .... at http://localhost:"+PORT)
})

