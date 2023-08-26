const router = require("express").Router();
const userCtrl = require("../controllers/userController");
const chatCtrl = require("../controllers/chatController");
const hostCtrl = require("../controllers/hostController");
const orderCtrl = require("../controllers/orderController");
const { verifyToken } = require("../middlewares/verifyToken");

//user routes
router.post("/", userCtrl.postRegister);
router.post("/toLogin", userCtrl.postToLogin);
router.get("/:id/verify/:token", userCtrl.getVerifyUser);
router.post("/googleAuthentication", userCtrl.postGoogleAuthentication);
router.get("/checkprofile", verifyToken, userCtrl.checkprofile);
router.patch("/postProfile", verifyToken, userCtrl.postProfile);

//locations
router.get("/getareas", userCtrl.getAreas);
router.get("/getlocations", userCtrl.getLocation);

//car detail routes
router.get("/findCar", userCtrl.getfindCar);
router.get("/getcar", userCtrl.getCarDetails);

//host routes
router.get("/checkAcc", hostCtrl.getCheckAccount);
router.post("/rentCarData", hostCtrl.postRentCar);
router.patch("/postAccountDetails", verifyToken, hostCtrl.postBankAccount);
router.get("/getAccount", verifyToken, hostCtrl.getAccount);
router.get("/gethostList", verifyToken, hostCtrl.hostList);

//order routes
router.post("/createOrder", verifyToken, orderCtrl.postBookCar);
router.get("/getOrderForUser", verifyToken, orderCtrl.orderDetails);
router.patch("/updateExpandDate", verifyToken, orderCtrl.expandDate);
router.patch("/cancelOrder", verifyToken, orderCtrl.cancelOrder);
router.patch("/setCompleteOrder", verifyToken, orderCtrl.completeOrder);

//chat routes
router.post("/sendMessage", verifyToken, chatCtrl.addMesssage);
router.post("/createChat", verifyToken, chatCtrl.createChat);
router.get("/getChatList", verifyToken, chatCtrl.getChatList);
router.post("/sentMessage", verifyToken, chatCtrl.createMessage);
router.get("/getOldMessage", verifyToken, chatCtrl.getOldMessage);

module.exports = router;
