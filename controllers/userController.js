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
const mongoose = require("mongoose");
const converSationDb=require("../models/conversationSchema")
const messageDb=require("../models/messagesSchema")

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
        } catch {}
    },
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
                let carNumber=(req.body.carNumber).toUpperCase()
                Object.assign(req.body, { owner: id,carNumber:carNumber});
                const car = await rentCarDb.create(req.body);
                res.status(201).json({ car, message: "Success" });
            }
        } catch (e) {}
    },
    getCheckAccount: async (req, res) => {
        try {
            //checking user have bank account
            const user = await userDb.findOne({
                _id: req.query.userId,
                // bankAccount: { $exists: true },
            });
            let account=user.bankAccount
            console.log(user);

            if (user) {
                res.status(201).json({ account });
            } else {
                res.status(501).json({});
            }
        } catch {}
    },
    getAccount: async (req, res) => {
        try {
            //getting user with account
            const oldAccount = await userDb.findOne({
                _id: req.userId,
                bankAccount: { $exists: true },
            });
            let account=oldAccount.bankAccount

            if (oldAccount) {
                res.status(201).json({ account });
            } else {
                res.status(502);
            }
        } catch {}
    },
    postBankAccount: async (req, res) => {
        try {
            console.log('posting bank');
            console.log(req.body)
            const newAccount = await userDb
                .findOneAndUpdate(
                    { _id: req.body.userId },
                    {
                        bankAccount: req.body,
                    },
                    // { upsert: true 
                    // }
                    
                )
                // .exec();
            // console.log("newaccount" + newAccount);
            console.log(newAccount);

            res.status(201).json({ newAccount: newAccount });
        } catch (e) {
            console.log(e);
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
        } catch (e) {}
    },

    getLocation: async (req, res) => {
        try {
            const city = await locationDb.find({}, { city: 1 }).sort({ city: 1 });
            // console.log("cities"+cities);

            return res.status(201).json({ city });
        } catch (e) {}
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
        } catch (e) {}
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
        } catch (e) {
            console.log(e);
        }
    },

    postBookCar: async (req, res) => {
        try {
            console.log("booking");
            console.log(req.body);
            const car = await rentCarDb.findOne({ _id: req.body.carData });
            console.log(car);
            let owner=car.owner

            const startDate = new Date(req.body.date);
            const endDate = new Date(req.body.endDate);

            if (car.selectedDate < startDate) {
                Object.assign(req.body, { endDate, startDate,userData:owner });
                await orderDb
                    .create(req.body)
                    .then(async (response) => {
                        console.log("car update");
                        const lastDate = moment(endDate).add(5, "hours");
                        console.log(lastDate);

                        const dateUpdate = await rentCarDb.updateOne(
                            { _id: req.body.carData },
                            {
                                $set: {
                                    selectedDate: lastDate,
                                },
                            }
                        );

                        res.status(202).json({ status: "success", response });
                    })
                    .catch((err) => {});
            } else {
                res.status(409).json({ messege: "this car already booked" });
            }
        } catch (e) {
            console.log("bookingerror" + e);
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
        } catch {}
    },
    orderDetails: async (req, res) => {
        try {
            const { userId } = req.query;
            console.log(userId);
            const orders = await orderDb.find({ userData: userId }).populate("carData");
            console.log(orders);

            res.status(200).json({ orders });
        } catch (e) {
            console.error("Error fetching order details:", e);
            res.status(500).json({ error: "Internal Server Error" });
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
        } catch {}
    },
    expandDate: async (req, res) => {
        try {
            const date = new Date(req.body.endDate);

            const endDate = new Date(date.getTime() + req.body.expandHoures * 60 * 60 * 1000);

            await orderDb
                .findOneAndUpdate({ _id: req.body.orderId }, { $set: { endDate: endDate } }, { new: true })
                .then((response) => {
                    res.status(201).json({ message: "sucessfully completed" });
                })
                .catch((err) => {});
        } catch (err) {}
    },
    cancelOrder: async (req, res) => {
        try {
            const nowdate = new Date();
            const cancelDate = new Date(req.body.startDate);

            const diffInMs = nowdate - cancelDate;
            const diffInMinutes = Math.floor(diffInMs / 60000);

            let cancelAmount;

            if (30 > diffInMinutes) {
                cancelAmount = req.body.amount;
            } else if (120 > diffInMinutes) {
                cancelAmount = req.body.amount / 2;
            } else {
                cancelAmount = 0;
            }

            await orderDb.updateOne({ _id: req.body.orderId }, { orderStatus: "cancel" }).then(async (response) => {
                await userDb
                    .updateOne(
                        { _id: req.userId },
                        {
                            $inc: {
                                wallet: cancelAmount,
                            },
                        }
                    )
                    .then((response) => {
                        res.status(201).json({ messege: "cancel complite" });
                    });
            });
        } catch (e) {}
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
            const orders=await orderDb.find({userData:userId})
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
        } catch (err) {
            console.log(err);
        }
    },
    completeOrder: async (req, res) => {
        try {
            const data = await orderDb.findOneAndUpdate(
                { _id: req.body.orderId },
                { orderStatus: "complete" },
                { new: true }
            );

            res.status(201).json({ data });

            if (data) return res.status(201).json({ data });
            return res.json({});
        } catch (e) {}
    },


    createChat : async (req, res) => {
        try {
          const { senderUserId, reciverId } = req.body;
          console.log(senderUserId,reciverId);
          const converSation = await converSationDb.findOne({
            members: {
              $all: [senderUserId, reciverId],
            },
          });
      
          if (!converSation) {
            const newConverSation = new converSationDb({
              members: [senderUserId, reciverId],
            });
            const saveConverSation = await newConverSation.save();
      
            res.status(200).json({ saveConverSation });
          } else {
            res.status(200).json({ message: "Conversation already created" });
          }
        } catch (e) {}
      },
      
       getChatList :async (req, res) => {
        try {
          // const chatlist = await converSationDb.find({members:{$in : req.query.userId}}).populate('members')
          const chatlist = await converSationDb.aggregate([
            {
              $match: {
                $expr: {
                  $in: [new mongoose.Types.ObjectId(req.query.userId), "$members"],
                },
              },
            },
      
            { $unwind: { path: "$members" } },
            {
              $lookup: {
                from: "userCollection",
                localField: "members",
                foreignField: "_id",
                as: "memdersData",
              },
            },
            { $project: { memdersData: 1 } },
          ]);
      
          res.status(200).json({ chatlist });
        } catch (e) {}
      },
      
      createMessage : async (req, res) => {
        try {
          const { conversationId, sender, text } = req.body;
          const newMessage = new messageDb({
            conversationId,
            sender,
            text,
          });
      
          try {
            const savedMessage = await newMessage.save();
      
            res.status(200).json({ savedMessage });
          } catch (error) {
            res.status(500).json({ error: "internal servor error" });
          }
        } catch (e) {}
      },
       getOldMessage : async (req, res) => {
        try {
          const messages = await messageDb.find({
            conversationId: req.query.converSation,
          });
      
          res.status(200).json(messages);
        } catch (error) {
          res.status(500).json({ error: "internal servor error" });
        }
      },
       addMesssage :async (req, res) => {
        try {
          const { from, to, message } = req.body;
          const data = await messageDb.create({
            message: { text: message },
            users: { from, to },
            sender: from,
          });
          if (data)
            return res.status(201).json({ msg: "Message added successfully" });
          return res.json({ msg: "faild to add message in datebase" });
        } catch (e) {}
      }
};
