const express=require('express')
const app=express()

app.use(express.json())
app.use(express.urlencoded({extended:true}))

const cors=require('cors')
app.use(cors())

require('./db/connection')

const emailRouter=require('./routes/email')
app.use('/api',emailRouter)

require('dotenv').config()
PORT=process.env.PORT

app.listen(PORT,()=>{
    console.log(`App is listening to PORT ${PORT}`)
})