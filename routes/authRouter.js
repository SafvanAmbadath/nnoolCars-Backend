const router = require("express").Router();
const {userDb}=require("../models/userSchema")
const tokenDb = require("../models/tokenSchema");
const sendEmail = require("../utils/sendEmail");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const joi=require("joi")


function validate(data){
    const schema=joi.object({
        email:joi.string().email().required().label("Email"),
        password:joi.string().required().label("Password")
    })
    return schema.validate(data)
}

router.post("/",async (req,res)=>{
    console.log(req.body);
    const {error}=validate(req.body)
    if(error) return res.status(400).send({message:error.details[0].message})

    const user=await userDb.findOne({email:req.body.email})
    if(!user) return res.status(401).send({message:"Invalid Email or Password"})
     
    const validPassword=await bcrypt.compare(req.body.password,user.password)
    if(!validPassword)return res.status(401).send({message:"Invalid email or Password"})

    if(!user.verified){
        let token=await tokenDb.findOne({userId:user._id})
        if(!token){
            token=await new tokenDb({
                userId:user._id,
                token:crypto.randomBytes(32).toString("hex")
            }).save();
            const url=`${process.env.BASE_URL}users/${user.id}/verify/${token.token}`
            await sendEmail(user.email,"Verify Email",url)
        }
        return res
        .status(400)
        .send({message:"An Email sent to your account please verify"})
    }
    const authToken=user.generateAuthToken()
    res.status(200).send({data:authToken,message:"logged in successfully"})
})


module.exports=router