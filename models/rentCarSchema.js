const mongoose = require("mongoose");


const rentCarSchema = new mongoose.Schema({
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "userCollection"
    },
    year:{
        type:Number,
        required:true,
    },
    fuel:{
        type:String,
        required:true,
        
    },
    email:{
        type:String,
        required:true,
        
    },
    description:{
        type:String,
        required:true
    },
    noOwner:{
        type:String,
        required:true
    },
    transmission:{
        type:String,
        required:true
    },
    status:{
        type:String,
        default:"pending"
    },
    brand:{
        type:String,
        required:true
    },
    features:{
        type:String,
        required:true
    },
    price:{
       type:Number,
       required:true
    },
    state:{
        type:String,
        required:true
    },
    city:{
        type:String,
        required:true
    },
    neighbourhood:{
        type:String,
        required:true
    },
    
    sNumber:{
        type:String,
        required:true
    },
  
        imageRC:{
            type:Array,
            required:true
        },
        imageIC:{
            type:Array,
            required:true
        },
      carNumber:{
            type:String,
            require:true,
            unique:true,
        },
        imageCar:{
            type:Array,
            required:true
        },
        km:{
            type:Number,
            required:true,
        },
        selectedDate: {
            type: Date,
            default:new Date()
        },
        


    },{
        timestamps:true
    })

const rentCarDb = mongoose.model('rentCarCollection',rentCarSchema)

module.exports= rentCarDb;
