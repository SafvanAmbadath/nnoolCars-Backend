const  mongoose =require("mongoose")

const locationSchema = new mongoose.Schema({
    state:{
        type:String,
        required:true,
    },
    city:{
        type:String,
        required:true,
    },
},{
    timestamps:true
})

const location = mongoose.model('locationCollection',locationSchema)

module.exports= location