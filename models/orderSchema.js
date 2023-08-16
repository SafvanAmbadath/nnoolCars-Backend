const mongoose=require("mongoose")
const rentCarDb=require("../models/rentCarSchema")


const orderSchema = new mongoose.Schema({
    carData:{
        type: mongoose.Schema.Types.ObjectId,
        ref: rentCarDb
    },
    amount:{
        type:Number,
        required:true,
    },
    protectionPackage:{
        type:Number,
        required:true,
    },
    paymentMethod:{
        type:String,
        required:true
    },
    startDate:{
        type:Date,
        required:true
    },
    endDate:{
        type:Date,
        required:true
    },
    userData:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "userCollection"
    },
    orderStatus:{
        type:String,
        default:'pending'
    }
},{
    timestamps:true
})

const Order = mongoose.model('OrderCollection',orderSchema)

module.exports= Order
