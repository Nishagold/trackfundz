require('dotenv').config()
const mongoose=require("mongoose")
const Database = process.env.Database
mongoose.connect(Database)
.then(()=>{
    console.log(`connected to database`)
})
.catch((err)=>{
console.log(`error connecting`,err.message)
})