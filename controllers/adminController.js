const { userDb } = require("../models/userSchema");
const rentCarDb = require("../models/rentCarSchema");
const locationDb = require("../models/locationSchema");
const bcrypt = require("bcrypt");
const orderDb=require("../models/orderSchema")
// const jwt = require("jsonwebtoken");

module.exports = {
    postAdminLogin: async (req, res) => {
        try {
            //finding the user is Admin
            const admin = await userDb.findOne({ email: req.body.email });

            if (admin && admin.isAdmin) {
                //checking the password
                await bcrypt.compare(req.body.password, admin.password, (err, data) => {
                    if (err) throw new Error("Error happened in bycrypting");
                    if (!data) {
                        //if password is incorrect
                        res.status(401).send({ message: "Check your password" });
                    } else {
                        //creating jwt token for admin
                        const { firstName: name, email } = admin;
                        const adminToken = admin.generateAuthToken();
                        res.status(200).json({
                            admin: true,
                            name,
                            email,
                            adminToken,
                            message: "AdminLogin success",
                        });
                    }
                });
            } else {
                //if admin is not exists with the email
                res.status(204).send({ message: "You are not an admin" });
            }
        } catch (err) {
            console.log(err.message);
        }
    },
    getUsersList: async (req, res) => {
        try {
            //getting users list from db
            const users = await userDb.find();

            if (users) return res.status(201).json({ users });
            return res.json({});
        } catch (e) {}
    },
    postBlockUser: async (req, res) => {
        try {
            //updating access of user in db
            await userDb
                .updateOne({ _id: req.params.userId }, { access: false })
                .then((response) => {
                    res.status(200).json();
                })
                .catch((err) => {
                    console.log(err);
                    res.status(500).json();
                });
        } catch (error) {}
    },
    postUnBlockUser: async (req, res) => {
        try {
            //updating access of user in db
            await userDb
                .updateOne({ _id: req.params.userId }, { access: true })
                .then((response) => {
                    res.status(200).json();
                })
                .catch((err) => {
                    console.log(err);
                    res.status(500).json();
                });
        } catch (error) {}
    },
    getPendingHostCars: async (req, res) => {
        try {
            //finding rent cars that have approval status pending
            const car = await rentCarDb.find({ status: "pending" });
            if (car) {
                res.status(200).json({ message: "Success", car });
            } else {
            }
        } catch (e) {}
    },
    getHostCars: async (req, res) => {
        try {
            const car = await rentCarDb.find({ status: req.query.status });

            res.status(200).json({ message: "Success", car });
        } catch (e) {}
    },
    getHostApprove: async (req, res) => {
        try {
            const car = await rentCarDb.updateOne(
                {
                    _id: req.query.id,
                },
                {
                    status: "Approved",
                }
            );

            res.status(200).json({ message: "Rc approved" });
        } catch (e) {}
    },
    getHostDeny: async (req, res) => {
        try {
            const car = await rentCarDb.updateOne(
                {
                    _id: req.query.id,
                },
                {
                    status: "Denial",
                }
            );

            res.status(200).json({ message: "Rc Denied" });
        } catch (e) {}
    },

    postLocation: async (req, res) => {
        try {
            const location = await locationDb.findOne({
                state: req.body.state,
                city: req.body.city,
            });

            if (location) {
                res.status(400).json({ message: "already created this city" });
            } else {
                await locationDb.create(req.body).then((response) => {
                    res.status(200).json({ message: " New Location Created" });
                });
            }
        } catch (e) {}
    },

    getLocations: async (req, res) => {
        try {
            const hostcityAndStateCode = await rentCarDb.aggregate([
                { $group: { _id: { state: "$state", city: "$city" } } },
            ]);

            const oldLocation = await locationDb.find();

            res.status(200).json({ hostcityAndStateCode, oldLocation });
        } catch (e) {}
    },

    getDeleteLocation: async (req, res) => {
        try {
            await locationDb
                .findByIdAndDelete(req.query.id)
                .then((response) => {
                    res.status(201).json({ message: "successfully deleted" });
                })
                .catch((er) => {
                    res.status(501).json({ message: "somthing wrong" });
                });
        } catch (e) {}
    },
     getCompliteOrder :async (req, res) => {
        try {
            console.log("for orders");
          const orders = await orderDb.find({});
          console.log(orders);
      
          res.status(201).json({ orders });
        } catch (e) {}
      },
       updatePayment :async (req, res) => {
        try {
          const data = await orderDb.findOneAndUpdate(
            { _id: req.body.orderId },
            { orderStatus: "Paid" },
            { new: true }
          );
      
          res.status(201).json({ data });
      
          if (data) return res.status(201).json({ data });
          return res.json({});
        } catch (e) {}
      },
       getAcDetails : async (req, res) => {
        try {
            console.log(req.query.userId);
          const acDetail = await rentCarDb.findOne({ _id: req.query.userId }).populate(
            "owner"
          );
          console.log(acDetail);
      
          if (acDetail)
            return res
              .status(201)
              .json({
                account: acDetail.owner.bankAccount,
                amount: req.query.amount,
              });
          return res.json({ msg: "Create your account" });
        } catch (e) {
            console.log(e);
        }
      },
      getOrderDetails : async (req, res) => {
        try {
          const data = await orderDb.find({});
      
          res.status(201).json(data);
        } catch (e) {}
      },
      getMonthName:function(monthNumber){
        const months=[
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",]
        if(monthNumber>=1 && monthNumber<=12){
            return months[monthNumber-1]
        }else{
            return "Invalid Month Number"
        }
      },
       getDashBoard :async function(req, res) {
        try {
          const profit = await orderDb.aggregate([
            {
              $group: {
                _id: { $dateToString: { format: "%m", date: "$createdAt" } },
                profit_count: { $sum: 1 },
              },
            },
            { $sort: { _id: 1 } },
          ]);
          console.log(profit);
      
          const result = profit.map((report) => {
            const month = this.getMonthName(report._id);
            report.month = month;
            return report;
          });
          const pending = await orderDb.find({ orderStatus: "pending" }).count();
          const complete = await orderDb.find({ orderStatus: "complete" }).count();
          const cancel = await orderDb.find({ orderStatus: "cancel" }).count();
          const completePayment = await orderDb
            .find({ orderStatus: "complete Payment" })
            .count();
          console.log(pending);
          let data = [];
          data.push(pending);
          data.push(complete);
      
          data.push(cancel);
          data.push(completePayment);
          console.log(data);
      
          res.status(200).json({ result, data });
        } catch (err) {
            console.log(err);
          // res.status(500).json({ error:"internal server error" });
        }
}
};
