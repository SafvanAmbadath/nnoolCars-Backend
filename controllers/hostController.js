const { userDb, validate } = require("../models/userSchema");
const rentCarDb = require("../models/rentCarSchema");
const orderDb = require("../models/orderSchema");


module.exports={
    postRentCar: async (req, res) => {
        try {
            // checking the car no. already exist
            const exist = await rentCarDb.findOne({ carNumber: req.body.carNumber });

            if (exist) {
                res.status(400).json({ message: "already stored" });
            } else {
                //creating new rent car in db
                const { id } = req.body;
                console.log(id);
                console.log(req.body.email)
                let carNumber = req.body.carNumber.toUpperCase();
                console.log(carNumber)
                Object.assign(req.body, { owner: id, carNumber: carNumber });
                const car = await rentCarDb.create(req.body);
                res.status(201).json({ car, message: "Success" });
            }
        } catch (error) {
            console.error("Error:", error);
            res.status(500).json({ message: "An error occurred" });
        }
    },
    
    getAccount: async (req, res) => {
        try {
            //getting user with account
            const oldAccount = await userDb.findOne({
                _id: req.userId,
                bankAccount: { $exists: true },
            });
            let account = oldAccount.bankAccount;

            if (oldAccount) {
                res.status(201).json({ account });
            } else {
                res.status(502);
            }
        } catch (error) {
            console.error("Error:", error);
            res.status(500).json({ message: "An error occurred" });
        }
    },
    postBankAccount: async (req, res) => {
        try {
            console.log("posting bank");
            console.log(req.body);
            const newAccount = await userDb.findOneAndUpdate(
                { _id: req.body.userId },
                {
                    bankAccount: req.body,
                }
                // { upsert: true
                // }
            );
            // .exec();
            // console.log("newaccount" + newAccount);
            console.log(newAccount);

            res.status(201).json({ newAccount: newAccount });
        } catch (error) {
            console.error("Error:", error);
            res.status(500).json({ message: "An error occurred" });
        }
    },
    getCheckAccount: async (req, res) => {
        try {
            //checking user have bank account
            const user = await userDb.findOne({
                _id: req.query.userId,
                // bankAccount: { $exists: true },
            });
            let account = user.bankAccount;
            console.log(user);

            if (user) {
                res.status(201).json({ account });
            } else {
                res.status(501).json({});
            }
        } catch (error) {
            console.error("Error:", error);
            res.status(500).json({ message: "An error occurred" });
        }
    },
    hostList: async (req, res) => {
        try {
            const { userId } = req.query;
            console.log(userId);
            const Approved = await rentCarDb.find({
                owner: userId,
                status: "Approved",
            });
            // console.log(Approved);
            console.log("before orders");
            const orders = await orderDb.find({ userData: userId });
            console.log(orders);

            // const Orders = await orderDb.find({userData:req.query.id}).populate('carData')
            // await orderDb
            //     .aggregate([
            //         {
            //             $lookup: {
            //                 from: "rentarCollection",
            //                 localField: "carData",
            //                 foreignField: "_id",
            //                 as: "matchedCars",
            //             },
            //         },
            //         {
            //             $unwind: "$matchedCars",
            //         },
            //         {
            //             $match: {
            //                 "matchedCars.owner": new mongoose.Types.ObjectId(userId),
            //             },
            //         },
            //         {
            //             $lookup: {
            //                 from: "userCollection",
            //                 localField: "userData",
            //                 foreignField: "_id",
            //                 as: "ownerDetails",
            //             },
            //         },
            //         {
            //             $unwind: "$ownerDetails",
            //         },
            //     ])
            // .exec()
            // .then((result) => {
            //     const orders = JSON.stringify(result);

            //     console.log(orders);

            // let arr = orders.map((doc) => {
            //     doc.matchedCars;
            // });

            // console.log(arr);

            res.status(201).json({ Approved, orders });
            // })
            // .catch((err) => {
            //     console.log(err);
            // });
        } catch (error) {
            console.error("Error:", error);
            res.status(500).json({ message: "An error occurred" });
        }
    },
}