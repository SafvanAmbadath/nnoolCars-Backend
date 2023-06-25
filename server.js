require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const db = require("./config/db");
const userRoutes=require("./routes/userRouter")
const authRoutes=require("./routes/authRouter")
const adminRoutes=require("./routes/adminRouter")

const userDb = require("./models/userSchema");
const jwt = require("jsonwebtoken");
const morgan = require("morgan");
const bcrypt = require("bcrypt");

//database connection
db.dbconnection();

//middlewares
app.use(express.json());
app.use(express.urlencoded({ limit: "30mb", extended: true }));
app.use(
    cors({
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true,
    })
);
app.use(morgan("tiny"));

//routes
app.use("/api/users",userRoutes);
app.use("/api/auth",authRoutes)
app.use("/api/admin",adminRoutes)

// app.post('/signup', async(req, res) => {
//   // console.log('lllllll');
//   console.log(req.body);
//   const user = await userDb.findOne({email:req.body.email})

//   if(user){
//     res.status(501).json({msg:''})
//   }else{
//     const password=bcrypt.hashSync(req.body.password,10)

//     Object.assign(req.body,{password})
//     const data = await userDb.create(req.body)

//     const token = jwt.sign({id:data._id},process.env.JWT_SECRET,{expiresIn:86400})
//     // console.log(data.name);
//     const name = data.firstName
//     const number = data.phoneNumber

//     res.status(201).json({auth:true,name,token,number})

//   }

// });

// app.post('/login',async(req,res)=>{
//     console.log(req.body);
//     const user = await userDb.findOne({email:req.body.email})
//     if(user){
//         const password = await bcrypt.compare(req.body.password, user.password)
//         console.log(password);

//         if(password){
//             const token = jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:86400})
//             // console.log(data.name);
//             const name = user.firstName
//             const number = user.phoneNumber

//             res.status(201).json({auth:true,name,token,number})
//         }else{
//             console.log('kkkkk');
//             res.status(200).json({msg:'incorrect password'})
//           }

//         }else{
//           res.status(200).json({msg:'incorrect email'})

//         }
//       })

const port = process.env.PORT || 8080;

app.listen(port, (err) => {
    if (err) {
        console.error(err);
    } else {
        console.log(`Server is running on port ${port}`);
    }
});
