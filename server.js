
const cors =require('cors')
const morgan = require("morgan")
const express=require("express")
require("./config/db")
const PORT= process.env.PORT

const router =require('./router/userRouter')

const app =express()

 app.use(cors({origin:"*"}));

 app.use(morgan('dev'))
 app.use(express.json())


 
 app.use('/api/v1/',router) 
app.listen(PORT,()=>{
    console.log(`app is up and running on port ${PORT }`)  
})