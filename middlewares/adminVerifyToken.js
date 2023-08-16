const jwt = require("jsonwebtoken");

module.exports = {
    adminVerifyToken: async (req, res, next) => {
        try {
            
            
            const header = req.headers.authorization;

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
        } catch (err) {
            console.log(err);
        }
    },
};
