const express = require('express')
const router= express.Router()
const { getALL,getOne, deletedUser,signupUser, login, verifyUser, resendVerification ,signout}=require('../controller/userController')
const { changePassword, forgotPassword, resetPassword } = require('../controller/passwordController.js')

router.get("/user/all",getALL)
router.get("/getone/:userId",getOne)
router.get('/user/:userId',deletedUser)
router.post('/signup',signupUser)
router.post('/login',login)
router.post('/signOut/:userId',signout)
router.route("/verifyemail/:token").get(verifyUser)
router.route("/user/resendverification").post(resendVerification)
router.route("/changePassword/:token").post(changePassword)

router.route("/forgotPassword/:token").post(forgotPassword)
router.route("/resetPassword/:token").post(resetPassword)
 

module.exports=router