const { userDb,authValidate } = require("../models/userSchema");
const tokenDb = require("../models/tokenSchema");
const sendEmail = require("../utils/sendEmail");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

module.exports={
    postLogin:async (req, res) => {
        try{
    
        //validating the login details
        const { error } = authValidate(req.body);
        if (error) return res.status(400).send({ message: error.details[0].message });
    
        //finding user
        const user = await userDb.findOne({ email: req.body.email });
        if (!user) return res.status(401).json({ message: "Invalid Email or Password" });

        if(!user.access){
            console.log("no access");
            return res.status(403).send({message:"Admin blocked the user"})
        }
    
        //comparing passwords
        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) return res.status(401).send({ message: "Invalid email or Password" });
    
        if (!user.verified) {
            //finding token in db
            let token = await tokenDb.findOne({ userId: user._id });
    
            if (!token) {
                //creating new confirmation token in db
                token = await new tokenDb({
                    userId: user._id,
                    token: crypto.randomBytes(32).toString("hex"),
                }).save();
    
                //sending mail for confirmation
                const url = `${process.env.BASE_URL}users/${user.id}/verify/${token.token}`;
                await sendEmail(user.email, "Verify Email", url);
            }
            return res.status(400).json({ message: "Email send for verification" });
        }
    
        //creating jwt token for authentication
        const authToken = user.generateAuthToken();
        res.status(200).json({ data: authToken,user:user, message: "logged in successfully" });
    } catch (error) {
        // Handle unexpected errors
        console.error("Error:", error);
        res.status(500).json({ message: "An error occurred" });
    }
    
    }
}