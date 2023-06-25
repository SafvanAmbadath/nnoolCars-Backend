const express=require("express")
const router = express.Router();
const {userDb}= require("../models/userSchema")
const bcrypt=require("bcrypt")
const jwt=require("jsonwebtoken")

router.post("/adminlogin",async (req,res)=>{
    try {
        console.log("adminlogin");
        
        const admin = await userDb.findOne({ email: req.body.email });
        console.log(admin);
        
    
        if (admin && admin.isAdmin) {
          await bcrypt.compare(req.body.password, admin.password, (err, data) => {
            if (err) throw err;
            else {
              const name = admin.firstName;
              const email = admin.email;
              const adminToken = jwt.sign({ id: admin.id }, process.env.JWT_SECRET, {
                expiresIn: 86400,
              });
              res
                .status(200)
                .json({
                  admin: true,
                  name,
                  email,
                  adminToken,
                  message: "Login success",
                });
            }
          });
        } else {
          res.status(204).json({ message: "check your userId" });
        }
      } catch {}

})


router.get("/getUserDetails",  async(req,res)=>{
  try {
    console.log("for getting userslist");
    const users = await userDb.find();

    if (users) return res.status(201).json({ users });
    return res.json({});
  } catch (e) {}
});

router.post("/blockUser/:userId",async(req,res)=>{
  console.log(req.params.userId);
  console.log("blocking user");
  try{
    await userDb.updateOne({_id:req.params.userId},{access:false}).then((response)=>{
      res.status(201).json()
    }).catch((err)=>{
      console.log(err);
      res.status(501).json()
    })
   }catch(error){}
})

router.post("/unblockUser/:userId",async(req,res)=>{
  console.log(req.params.userId);
  console.log("unblocking user");
  try{
    await userDb.updateOne({_id:req.params.userId},{access:true}).then((response)=>{
      res.status(201).json()
    }).catch((err)=>{
      console.log(err);
      res.status(501).json()
    })
   }catch(error){}
})

module.exports=router