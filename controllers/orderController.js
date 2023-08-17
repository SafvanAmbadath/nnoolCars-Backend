const { userDb, validate } = require("../models/userSchema");
const rentCarDb = require("../models/rentCarSchema");
const orderDb = require("../models/orderSchema");
const moment = require("moment");

module.exports = {
    postBookCar: async (req, res) => {
        try {
            console.log("booking");
            console.log(req.body);
            const car = await rentCarDb.findOne({ _id: req.body.carData });
            console.log(car);
            let owner = car.owner;

            const startDate = new Date(req.body.date);
            const endDate = new Date(req.body.endDate);

            if (car.selectedDate < startDate) {
                Object.assign(req.body, { endDate, startDate, userData: owner });
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
        } catch (error) {
            console.error("Error:", error);
            res.status(500).json({ message: "An error occurred" });
        }
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
        } catch (error) {
            console.error("Error:", error);
            res.status(500).json({ message: "An error occurred" });
        }
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
        } catch (error) {
            console.error("Error:", error);
            res.status(500).json({ message: "An error occurred" });
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
        } catch (error) {
            console.error("Error:", error);
            res.status(500).json({ message: "An error occurred" });
        }
    },
};
