const router = require("express").Router();
const { userDb, validate } = require("../models/userSchema");
const tokenDb = require("../models/tokenSchema");
const sendEmail = require("../utils/sendEmail");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

router.post("/", async (req, res) => {
    try{
    const { error } = validate(req.body);
    console.log("validate error" +error);
    if (error) return res.status(400).send({ message: error.details[0].message });

    let user = await userDb.findOne({ email: req.body.email });
    if (user) return res.status(409).send({ message: "User with given email already Exist!" });

    const hashPassword = await bcrypt.hash(req.body.password, 10);
    user =await new userDb({...req.body,password:hashPassword}).save()
    const token=await new tokenDb({
        userId:user._id,
        token:crypto.randomBytes(32).toString("hex")
    }).save();
    console.log("user and token created");
    // console.log("token"+token);

    const url=`${process.env.BASE_URL}users/${user.id}/verify/${token.token}`
    await sendEmail(user.email,"Verify Email", url)

    res.status(201)
    .send({message:"An Email sent to your account please verify"})
} catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal Server Error" });
}
});

router.get("/:id/verify/:token", async(req,res)=>{
    try{
    console.log("for email verify");
    const user=await userDb.findOne({_id:req.params.id})
    console.log("for verify "+user);
    if(!user) return res.status(400).send({message:"Invalid link"})

    const token=await tokenDb.findOne({
        userId:user._id,
        token:req.params.token,
    })
    console.log("for verify "+token);
    if(!token) {return res.status(400).send({message:"Invalid link"})}
    console.log("hellooo");
  

       await userDb.updateOne({_id:user._id},{$set:{verified:true}})
   
   
    await token.remove()
   return res.status(200).send({message:"Email verified successfully"})
}catch(error){
    res.status(500).send({message:"Internal server error"})
}
})

module.exports=router;