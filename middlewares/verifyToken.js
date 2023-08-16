const jwt = require("jsonwebtoken");
const { userDb } = require("../models/userSchema");

module.exports = {
    verifyToken: async (req, res, next) => {
        try {
            
            const userId=req.headers.userid
            const header = req.headers.authorization;
            const user=await userDb.findOne({_id:userId})
            
            if(user.access){
                if (!header) {
                    res.status(401).send({ error: "no token provider" });
                }
    
                const token = header.split(" ")[1];
    
                jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
                    if (err) {
                        console.log("error");
                        res.status(500).send({ error: "authentication failed" });
                    } else {
                        req.userId = decoded.id;
                        next();
                    }
                });


            }else{
                return res.status(403).json({message:"Admin blocked the user"})
            }

           
        } catch (err) {
            console.log(err);
        }
    },
};
