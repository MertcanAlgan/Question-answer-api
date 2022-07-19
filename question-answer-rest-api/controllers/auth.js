var User = require('../models/User');
var CustomError = require("../helpers/error/CustomError");
const asyncErrorWrapper = require("express-async-handler");
const {sendJwtToClient} = require("../helpers/autherization/tokenHelper");
const { validateUserInput,comparePassword} = require("../helpers/input/inputHelpers");
const sendEmail = require("../helpers/libraries/sendEmail");
const { reset } = require('nodemon');
const { request, json } = require('express');

var register = asyncErrorWrapper( async (req,res,next) => {
    // Post data

    const {name,email,password,role} = req.body;

        var user = await User.create({
            name,
            email,
            password,
            role
        });
        sendJwtToClient(user,res);
});

const login = asyncErrorWrapper(async ( req,res,next) =>{
    const {email,password} = req.body;
    if(!validateUserInput(email,password)){
        return next(new CustomError("Please Check Your Inputs",400));
    }

    const user = await User.findOne({email}).select("+password");
    if(!comparePassword(password,user.password)){
        return next(new CustomError("Please Check Your Password",400));
    }
    sendJwtToClient(user,res);
});

const logout = asyncErrorWrapper(async(req, res, next) => {
    const {NODE_ENV} = process.env;

    return res.status(200)
    .cookie({
        httpOnly: true,
        expires : new Date(Date.now()),
        secure : NODE_ENV === "development" ? false : true
    })
    .json({
        success : true,
        message : "Logout Successfull"
    });
});

const getUser = (req,res,next) =>{
    res.json({
    success : true,
    data :{
        id: req.user.id,
        name: req.user.name
    }
    });
}

const imageUpload = asyncErrorWrapper(async(req, res, next)=>{
   const user =  await User.findByIdAndUpdate(req.user.id,{
        "profile_image" : req.savedProfileImage
    },{
        new : true,
        runValidators : true
    });


    res.status(200)
    .json({
        success : true,
        message : "Image Upload Successfull",
        data : user
    });
});

// forgot password
const forgotPassword = asyncErrorWrapper(async(req,res,next)=>{
    const reserEmail = req.body.email;
    const user = await User.findOne({email: reserEmail});
    if(!user){
        return next(new CustomError("There is no user with that Email",400));
    }
    const resetPasswordToken = user.getResetPasswordTokenFromUser();

    await user.save();
    const resetPasswordUrl = `http://localhost:5000/api/auth/resetpassword?resetPasswordToken=${resetPasswordToken}`;

    const emailTemplate = `
    <h3>Reset Your Password</h3>
    <p> This <a href = '${resetPasswordUrl}' target = '_blank'>Link</a> will expire in 1 hour</p>
    `;

    try{
        await sendEmail({
            from : process.env.SMTP_USER,
            to : resetEmail,
            subject : "Reset Your Password",
            html : emailTemplate
        });
        return res.status(200).json({
            success : true,
            message : "Token sent to your Email"
        });
    }
    catch(err){
        user.resetPasswordToken=undefined;
        user.resetPasswordExpire=undefined;

        await user.save();

        return next(new CustomError("Email Could Not Be Sent",500));
    }
});

const resetPassword = asyncErrorWrapper(async ( req, res, next) => {
    const {resetPasswordToken} = req.query;

    const {password} = req.body;

    if(!resetPasswordToken){
        return next(new CustomError("Please Provide a valid Token",400));
    }
    let user = await User.findOne({
        resetPasswordToken : resetPasswordToken,
        resetPasswordExpire : {$gt : Date.now()}
    });

    if(!user){
        return next(new CustomError("Invalid Token or Session Expired",404));
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
return res.status(200)
.json({
    success : true,
    message : "Reset Password Process Successful"
});

});

const editDetails = asyncErrorWrapper(async (req,res,next) => {
    const editInformation = req.body;
    const user = await User.findByIdAndUpdate(req.user.id,editInformation,{
        new : true,
        runValidators : true
    });
    return res.status(200),json({
        success : true,
        data: user
    });
});

module.exports = {
    register,
    login,
    logout,
    getUser,
    imageUpload,
    forgotPassword,
    resetPassword,
    editDetails
};