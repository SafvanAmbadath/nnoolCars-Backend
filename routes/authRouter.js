const router = require("express").Router();
const joi = require("joi");
const authCtrl=require("../controllers/authController")

router.post("/",authCtrl.postLogin );

module.exports = router;
