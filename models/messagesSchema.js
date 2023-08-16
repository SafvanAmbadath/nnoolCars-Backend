const mongoose=require("mongoose")


const messageSchema = new mongoose.Schema(
    {
        conversationId: {
            type: Array,
        },
        sender: {
            type: String,
        },
        text: {
            type: String,
        },
    },
    { timestamps: true }
);

const message = mongoose.model("Message", messageSchema);
module.exports=message