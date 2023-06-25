// import mongoose from mongoose
// import dotenv from "dotenv"

const mongoose =require('mongoose')
const dotenv =require('dotenv')

mongoose.set("strictQuery",false);


module.exports.dbconnection=async()=>{
    try{
        await mongoose.connect(process.env.MONGO_URL,
            {useUnifiedTopology:true,
            useNewUrlParser:true}
            )

    }catch(error){
        console.error(`Error:${error.message}`);
        process.exit(1)
    }

}
    

