const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { userDb, validate } = require("../models/userSchema");
const rentCarDb = require("../models/rentCarSchema");
const locationDb = require("../models/locationSchema");
const tokenDb = require("../models/tokenSchema");
const orderDb = require("../models/orderSchema");
const sendEmail = require("../utils/sendEmail");
const moment = require("moment");


module.exports = {
    postRegister: async (req, res) => {
        try {
            //for validating register details
            const { error } = validate(req.body);
            // console.log("validate error" +error);
            if (error) return res.status(400).send({ message: error.details[0].message });

            let user = await userDb.findOne({ email: req.body.email });
            if (user) return res.status(409).send({ message: "User with given email already Exist!" });

            //creating new user and confirmation token in db
            const hashPassword = await bcrypt.hash(req.body.password, 10);
            user = await new userDb({ ...req.body, password: hashPassword }).save();
            const token = await new tokenDb({
                userId: user._id,
                token: crypto.randomBytes(32).toString("hex"),
            }).save();

            //sending mail for confirmation
            const url = `${process.env.BASE_URL}users/${user.id}/verify/${token.token}`;
            await sendEmail(user.email, "Verify Email", url);
            res.status(201).send({ message: "An Email sent to your account please verify" });
        } catch (error) {
            console.log(error);
            res.status(500).send({ message: "Internal Server Error" });
        }
    },
    postToLogin: async (req, res) => {
        try {
            console.log("tologin");

            let user = await userDb.findOne({ email: req.body.email });
            if (!user) return res.status(404).send({ message: "User with given email not Exist!" });

            const token = await new tokenDb({
                userId: user._id,
                token: crypto.randomBytes(32).toString("hex"),
            }).save();

            //sending mail for confirmation
            const url = `${process.env.BASE_URL}users/${user.id}/verify/${token.token}`;
            await sendEmail(user.email, "Verify Email", url);
            res.status(201).send({ message: "An Email sent to your account please verify" });
        } catch (error) {
            console.log(error);
            res.status(500).send({ message: "Internal Server Error" });
        }
    },

    getVerifyUser: async (req, res) => {
        try {
            //checking user in db
            const user = await userDb.findOne({ _id: req.params.id });
            if (!user) return res.status(400).send({ message: "Invalid link" });

            //checking confirmation token in db
            const token = await tokenDb.findOne({
                userId: user._id,
                token: req.params.token,
            });
            if (!token) return res.status(400).send({ message: "Invalid link" });

            //verifying user and removing confirmation token
            await userDb.updateOne({ _id: user._id }, { $set: { verified: true } });
            await token.remove();
            return res.status(200).send({ message: "Email verified successfully" });
        } catch (error) {
            res.status(500).send({ message: "Internal server error" });
        }
    },
    postGoogleAuthentication: async (req, res) => {
        try {
            //checking user with gmail
            const user = await userDb.findOne({ email: req.body.data.email });

            //jwt token creating and sending to frontend
            if (user) {
                const { firstName: name, email, _id: id, phoneNumber: number } = user;
                const token = jwt.sign({ id: id }, process.env.JWT_SECRET, {
                    expiresIn: 86400,
                });
                res.status(200).json({
                    auth: true,
                    name: name,
                    email: email,
                    id: id,
                    number: number,
                    message: "Login success",
                    token: token,
                });
            } else {
                res.status(501).json({});
            }
        } catch (error) {
            console.error("Error:", error);
            res.status(500).json({ message: "An error occurred" });
        }
    },
   
    
   

    getAreas: async (req, res) => {
        try {
            const { location } = req.query;
            console.log(location);
            const cars = await rentCarDb
                .find({
                    city: location,
                    status: "Approved",
                })
                .limit(5);
            console.log(cars);
            if (cars) {
                res.status(201).json({ cars });
            } else {
                res.status(404).json({ messege: "location is not found" });
            }
        } catch (error) {
            console.error("Error:", error);
            res.status(500).json({ message: "An error occurred" });
        }
    },

    getLocation: async (req, res) => {
        try {
            const city = await locationDb.find({}, { city: 1 }).sort({ city: 1 });
            // console.log("cities"+cities);

            return res.status(201).json({ city });
        } catch (error) {
            console.error("Error:", error);
            res.status(500).json({ message: "An error occurred" });
        }
    },

    getfindCar: async (req, res) => {
        try {
            const { location, date } = req.query;
            console.log(location + "," + date);
            const car = await rentCarDb.find({
                $and: [{ city: location }, { selectedDate: { $lt: date } }],
            });
            console.log(car);

            if (car.length != 0) {
                res.status(201).json({ car });
            } else {
                res.status(404).json({ messege: "not available car. please select different location" });
            }
        } catch (error) {
            console.error("Error:", error);
            res.status(500).json({ message: "An error occurred" });
        }
    },

    getCarDetails: async (req, res) => {
        try {
            let { id, date, endDate } = req.query;
            const car = await rentCarDb.findOne({ _id: id }).populate("owner");

            let amount;

            const startDate = new Date(date);
            endDate = new Date(req.query.endDate);

            const diffInMilliseconds = endDate.getTime() - startDate.getTime();
            const hours = Math.abs(diffInMilliseconds / (1000 * 60 * 60));

            amount = Math.round(car.price * hours);

            if (car) {
                res.status(201).json({ car, amount });
            } else {
                res.status(404);
            }
        } catch (error) {
            console.error("Error:", error);
            res.status(500).json({ message: "An error occurred" });
        }
    },

    

    checkprofile: async (req, res) => {
        try {
            console.log("checkprofile");
            console.log(req.query.userId);
            const user = await userDb.findOne({
                _id: req.query.userId,
                profile: { $exists: true },
            });
            console.log(user);

            if (user) {
                res.status(201).json({ user });
            } else {
                return res.status(200).json({});
            }

            // return res.status(404).json();
        } catch (error) {
            console.error("Error:", error);
            res.status(500).json({ message: "An error occurred" });
        }
    },
    
    postProfile: async (req, res) => {
        try {
            console.log(req.body);
            const { userId } = req.body;
            console.log(userId);
            const newAccount = await userDb.findOneAndUpdate(
                { _id: userId },
                { profile: req.body },
                { upsert: true, new: true }
            );

            console.log("newAccount" + newAccount);

            if (newAccount) {
                return res.status(201).json({ newAccount });
            }
            return res.json({});
        } catch (error) {
            console.error("Error:", error);
            res.status(500).json({ message: "An error occurred" });
        }
    },
   

    
};
