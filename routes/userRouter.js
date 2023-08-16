const router = require("express").Router();
const userCtrl = require("../controllers/userController");
const { verifyToken } = require("../middlewares/verifyToken");

router.post("/", userCtrl.postRegister);
router.post("/toLogin", userCtrl.postToLogin);
router.get("/:id/verify/:token", userCtrl.getVerifyUser);
router.post("/googleAuthentication", userCtrl.postGoogleAuthentication);
router.post("/rentCarData", userCtrl.postRentCar);
router.get("/getareas", userCtrl.getAreas);
router.get("/checkAcc", userCtrl.getCheckAccount);

router.get("/getAccount", verifyToken, userCtrl.getAccount);
router.post("/postAccountDetails", verifyToken,userCtrl.postBankAccount);
router.post("/createOrder", verifyToken, userCtrl.postBookCar);
router.get("/checkprofile", verifyToken, userCtrl.checkprofile);

router.post("/postProfile", verifyToken, userCtrl.postProfile);
router.get("/getOrderForUser", verifyToken, userCtrl.orderDetails);
router.post("/updateExpandDate", verifyToken, userCtrl.expandDate);
router.post("/cancelOrder", verifyToken, userCtrl.cancelOrder);
router.get("/gethostList", verifyToken, userCtrl.hostList);
router.post("/setCompleteOrder", verifyToken,userCtrl.completeOrder);

router.post("/sendMessage", verifyToken, userCtrl.addMesssage);
router.post("/createChat", verifyToken, userCtrl.createChat);
router.get("/getChatList", verifyToken, userCtrl.getChatList);
router.post("/sentMessage", verifyToken, userCtrl.createMessage);
router.get("/getOldMessage", verifyToken, userCtrl.getOldMessage);




router.get("/getlocations", userCtrl.getLocation);
router.get("/findCar", userCtrl.getfindCar);
router.get("/getcar", userCtrl.getCarDetails);

module.exports = router;
