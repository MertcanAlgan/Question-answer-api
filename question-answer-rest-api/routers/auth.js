var express = require("express");
const {
    getAccessToRoute
} = require("../middlewares/authorization/auth");
var { register,login,getUser,logout, imageUpload,forgotPassword, resetPassword, editDetails  } = require('../controllers/auth');
const profileImageupload = require("../middlewares/libraries/profileImageUpload");

var router = express.Router();
// api/auth
router.post("/register",register);
router.post("/login",login);
router.get("/profile",getAccessToRoute,getUser);
router.get("/logout",getAccessToRoute,logout);
router.post("/forgotpassword",forgotPassword);
router.put("/resetpassword",resetPassword);
router.put("/edit",getAccessToRoute ,editDetails);

router.post("/upload",[getAccessToRoute,profileImageupload.single("profile_image")],imageUpload);



module.exports = router;