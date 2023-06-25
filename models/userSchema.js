
const mongoose =require('mongoose')
const jwt=require("jsonwebtoken")
const joi=require("joi")
const passwordComplexity=require("joi-password-complexity")

const userSchema =new mongoose.Schema({
    firstName:{
        type:String,
        required:true,
        min:2,
        max:50
    },
    lastName:{
        type:String,
        required:true,
        min:2,
        max:50
    },
    email:{
        type:String,
        required:true,
        
    },
    phoneNumber:{
        type:Number,
        required:true,
        min:10
    },
    password:{
        type:String,
        required:true,
       
    },
    dob:{
        type:String,
        
    },
    verified:{
        type:Boolean,
        default:false
    }, 
    wallet:{
        type:Number,
        default:0
    },
    isAdmin:{
        type:Boolean,
        default:false
    },
    access:{
        type:Boolean,
        default:true
    },
    
},
{
    timestamps:true
}
)

userSchema.methods.generateAuthToken=function(){
    const authToken = jwt.sign({_id:this.id},process.env.JWT_SECRET,{expiresIn:86400})
    return authToken
}

const userDb=mongoose.model("userCollection",userSchema)

const validate=(data)=>{
    const schema=joi.object({
        firstName:joi.string().required().label("First Name"),
        lastName:joi.string().required().label("Last Name"),
        email:joi.string().email().required().label("Email"),
        gender:joi.string().required().label("Gender"),
        phoneNumber:joi.number().integer().min(10 ** 9).max(10 ** 10 - 1).required()
        .messages({
            'number.min': 'Mobile number should be 10 digit.',
            'number.max': 'Mobile number should be 10 digit'
        }),
        dob: joi.date().required().label("Date of birth"),
        password:passwordComplexity().required().label("Password"),
        confirmPassword:passwordComplexity().required().label("ConfirmPassword")
    })
    return schema.validate(data)
}


module.exports = {userDb,validate}