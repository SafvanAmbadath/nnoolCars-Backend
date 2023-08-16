const mongoose=require("mongoose")

const conversationSchema = new mongoose.Schema({
    members:{
        type: [{
            type: mongoose.Types.ObjectId,
            ref: 'User',
        }],
    }
},{
    timestamps:true
})

const conversation = mongoose.model('conversation',conversationSchema)

module.exports=conversation