const express = require("express");
const router = express.Router();
const adminCtrl = require("../controllers/adminController");
const { adminVerifyToken } = require("../middlewares/adminVerifyToken");

//login
router.post("/adminlogin", adminCtrl.postAdminLogin);

//dashboard
router.get("/getDashBoard", adminCtrl.getDashBoard.bind(adminCtrl));

//user management routes
router.get("/getUserDetails", adminVerifyToken, adminCtrl.getUsersList);
router.patch("/blockUser/:userId", adminVerifyToken, adminCtrl.postBlockUser);
router.patch("/unblockUser/:userId", adminVerifyToken, adminCtrl.postUnBlockUser);

//host management routes
router.get("/hostdata", adminVerifyToken, adminCtrl.getPendingHostCars);
router.get("/getStatusData", adminVerifyToken, adminCtrl.getHostCars);
router.patch("/approve", adminVerifyToken, adminCtrl.getHostApprove);
router.patch("/denied", adminVerifyToken, adminCtrl.getHostDeny);

//location management routes
router.get("/findLocation", adminVerifyToken, adminCtrl.getLocations);
router.post("/postlocation", adminVerifyToken, adminCtrl.postLocation);
router.delete("/locationDelete", adminVerifyToken, adminCtrl.getDeleteLocation);

//order management routes
router.get("/getorderData", adminVerifyToken, adminCtrl.getOrderDetails);
router.get("/getCompliteOrder", adminVerifyToken, adminCtrl.getCompliteOrder);
router.patch("/updatePaymentStatus", adminVerifyToken, adminCtrl.updatePayment);
router.get("/getAccountdetails", adminVerifyToken, adminCtrl.getAcDetails);

module.exports = router;
