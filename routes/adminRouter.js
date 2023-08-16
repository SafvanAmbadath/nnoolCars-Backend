const express = require("express");
const router = express.Router();
const adminCtrl = require("../controllers/adminController");
const {adminVerifyToken}=require('../middlewares/adminVerifyToken')

router.post("/adminlogin", adminCtrl.postAdminLogin);

router.get("/getUserDetails",adminVerifyToken, adminCtrl.getUsersList);

router.post("/blockUser/:userId",adminVerifyToken, adminCtrl.postBlockUser);

router.post("/unblockUser/:userId",adminVerifyToken, adminCtrl.postUnBlockUser);

router.get("/hostdata",adminVerifyToken, adminCtrl.getPendingHostCars);

router.get("/getStatusData",adminVerifyToken, adminCtrl.getHostCars);

router.get("/approve", adminVerifyToken, adminCtrl.getHostApprove);

router.get("/denied", adminVerifyToken, adminCtrl.getHostDeny);

router.get("/findLocation", adminVerifyToken, adminCtrl.getLocations);

router.post("/postlocation", adminVerifyToken, adminCtrl.postLocation);

router.post("/locationDelete", adminVerifyToken, adminCtrl.getDeleteLocation);

router.get("/getCompliteOrder", adminVerifyToken, adminCtrl.getCompliteOrder);

router.post("/updatePaymentStatus", adminVerifyToken, adminCtrl.updatePayment);

router.get("/getAccountdetails", adminVerifyToken, adminCtrl.getAcDetails);

router.get("/getorderData", adminVerifyToken, adminCtrl.getOrderDetails);

router.get("/getDashBoard", adminCtrl.getDashBoard.bind(adminCtrl))




module.exports = router;
