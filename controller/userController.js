const userModel = require('../model/userModel')
const jwt = require('jsonwebtoken')
const bcrypt= require('bcryptjs')
require('dotenv').config()
const sendEmail = require("../utils/mail")
const {generateWelcomeEmail} = require('../utils/emailtemplate')


exports.signupUser = async (req, res) => {
    try {
        const { firstName,lastName,email,phoneNumber,password,confirmPassword} = req.body;
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const passwordPattern =/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
        //validating our inputs

        if (!firstName || firstName.trim().length === 0) {
            return res.status(404).json({ message: "Name field cannot be empty" });
        }
        if(!lastName || lastName.trim().length === 0){
            return res.status(404).json({ message: "Name field cannot be empty" });
        }

        if (!email || !emailPattern.test(email)) {
            return res.status(404).json({ message: "Invalid email" });
        }
          if(!phoneNumber || phoneNumber.trim().length === 0){
            return res.status(404).json({ message: "phoneNumber field cannot be empty" });
        }
         if (password !== confirmPassword){
            return res.status(400).json({message:`password do not match`})
        }
        
        if (!password || !passwordPattern.test(password)) {
            return res.status(404).json({ message: "Password must include at least one lowercase letter,one uppercase letter and one number" })
        }

       // if (!studentClass || studentClass.trim().length === 0) {
          //  return res.status(404).json({ message: "Student class field cannot be empty" });
       // }

        const existingEmail = await userModel.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }
// using bcrypt to salt and hash our 
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hashSync(password, salt);
       
        const user = new userModel({
            firstName,
            lastName,
            email,
            phoneNumber,
            password: hashedPassword,
            
        });

        const createdUser = await user.save();

       //using jwt to sign in our user in

        const token = jwt.sign({ email: createdUser.email, userId: createdUser._id }, process.env.secret_key, { expiresIn: "1d" });

        // Send verification mail
        const verificationLink = 'https://www.google.com/search?q=google%2Ccom&oq=google%2Ccom&gs_lcrp=EgZjaHJvbWUyBggAEEUYOTIPCAEQABgKGIMBGLEDGIAEMgwIAhAAGAoYsQMYgAQyBwgDEAAYgAQyCQgEEAAYChiABDIJCAUQABgKGIAEMgcIBhAAGIAEMgYIBxBFGDzSAQgzMTkwajBqN6gCCLACAQ&sourceid=chrome&ie=UTF-8';
        const emailSubject = 'Verification Mail';
        const html = generateWelcomeEmail(firstName, verificationLink);
        // using nodemailer to send mail to our user
        const mailOptions = {
            from: process.env.user,
            to: email, // Use the user's email address here
            //subject: emailSubject,
            html: html
        };

       

        await sendEmail(mailOptions);

        return res.status(200).json({ message: "Successful", token,createdUser });
    } catch (error) {
        
        return res.status(500).json(error.message);
    }
};
exports.verifyUser = async (req,res)=>{
   try {
       const {token} = req.params
     const {email} = await jwt.verify(token, process.env.secret_key);
 
    
       const user = await userModel.findOne({email});
 
       if(!user){
       return res.status(404).json({message:"user not found"});
         
        }
     
     if(user.isVerified ==true ) {
      return res.status(400).json({message:'user already verified'});
        }

      
       user.isVerified = true

      await user.save();

     res.status(200).json({message:"verified successful", user});
        
    } catch (error) {
        
       return res.status(500).json(error.message);
    }

};
//exports.verifyUser=async (req,res)=>{
   // try {
//const id=req.params.id
//     const findUser=await userModel.findById(id)
// await jwt.verify(req.params.token,process.env.Secret_key,(err)=>{
//     if(err  ){
//         const link=`${req.protocol}://${req.get("host")}/api/v1/newemail/${findUser._id}`

//         sendMail({ subject : `Kindly Verify your mail`,
//             email:findUser.email,
//             html:html(link,findUser.firstName)
          
//         })
 
//     return res.json(`this link has expired ,kindly check your email link`)
// }else{
//     if(findUser.isVerified == true){
//         return res.status(400).json("your account has already been verified")
//     }
// userModel.findByIdAndUpdate(id,{isVerified:true})

//     res.status(200).json("you have been verified,kindly go ahead to log in")
// }
// })

    
// } catch (error) {
//     res.status(500).json(error.message)  
  
// }
// }


exports. resendVerification = async(req, res)=>{
    try {
     const {email} = req.body
     const checkUser = await userModel.findOne({email})
     if(!checkUser){
         return res.status(400).json({message:'user with this email is not registered'})
     }
 
     const verificationLink = 'https://www.google.com/search?q=google%2Ccom&oq=google%2Ccom&gs_lcrp=EgZjaHJvbWUyBggAEEUYOTIPCAEQABgKGIMBGLEDGIAEMgwIAhAAGAoYsQMYgAQyBwgDEAAYgAQyCQgEEAAYChiABDIJCAUQABgKGIAEMgcIBhAAGIAEMgYIBxBFGDzSAQgzMTkwajBqN6gCCLACAQ&sourceid=chrome&ie=UTF-8';
     const emailSubject = ' Resend Verification Mail';
     const html = generateWelcomeEmail();
     const mailOptions = {
         from: process.env.user,
         to: email, 
         subject: emailSubject,
         html: html
     };



   

        await sendEmail(mailOptions);
       return  res.status(200).json({message:'mail resent successfully'})
    
      } catch (error) {
        
       return res.status(500).json(error.message);
    }
}
exports.login = async (req, res)=>{
    try {
        const {email,password}= req.body
        
        const findUser = await userModel.findOne({email:req.body.email})
        if(!findUser){
            console.log('no user found with given email or username')
            return res.status(404).json({message:'user with this email does not exist'})
        }
        //console.log('user found',findUser)
        const matchedPassword = await bcrypt.compare(password, findUser.password)
       if(!matchedPassword){
            return res.status(400).json({message:'invalid password'})
        }
        if(!findUser.isVerified){
          //  console.log('user is not verified')
           return  res.status(400).json({message:'user with this email is not verified'})
        }
        findUser.isLoggedIn = true
        const token = jwt.sign({ 
            name:findUser.firstName,
            email: findUser.email,
            userId: findUser._id }, 
            process.env.secret_key,
            { expiresIn: "1d" });

            return  res.status(200).json({message:'login successfully ',token})

        
    } catch (error) {
        
        return res.status(500).json(error.message);
    }
}




exports.signout= async(req,res)=>{
    try {
        const{userId}=req.params
        //update the user's token to null
        const user =await userModel.findByIdAndUpdate(userId,{token:null},{new:true})
        if(!user){
            return res.status(404).json({
                message:`user not found`
            })
        }
        res.status(200).json({
            message:`user loggedout successfully`
        })

            
     
        
    } catch (error) {
        res.status(500).json({message:error.message})
    }
}

exports.getALL = async(req,res)=>{
    try {
        const allUsers = await userModel.find().sort({createdAt:-1})
     return res.status(200).json({

    
        message:'list of all user',
        allUsers
    })
    } catch (error) {
        res.status(500).json({
            message:`error.message `
        })
    }
    
}
 exports.getOne = async(req,res)=>{
    try {
        const {userId}=req.params;
    } catch (error) {
            const user= await userModel.findById(userId)
            res.status(200).json({
                message:`user details`,
                user
            })
    }
    
 }
 exports.deletedUser= async(req,res)=>{
    try {
        const userId=req.params
        const deletedUser= await userModel.findByIdAndDelete(userId)
        if(!deletedUser){
            res.status(404).json({
          message:`user not found`
        
        })
    }else{
        res.status(200).json({
            message:`user has been deleted`,
            deletedUser

        })
    }
    } catch (error) {
        res.status(500).json({message:error.message})
    }
 }



   



// const login = async (req, res)=>{
//     try {
//         const {email, password}= req.body
//         const findUser = await schoolModel.findOne({email})
//         if(!findUser){
//             return res.status(404).json({message:'user with this email does not exist'})
//         }
//         const matchedPassword = await bcrypt.compare(password, findUser.password)
//        if(!matchedPassword){
//             return res.status(400).json({message:'invalid password'})
//         }
//         if(findUser.isVerified === false){
//            return  res.status(400).json({message:'user with this email is not verified'})
//         }
//         findUser.isLoggedIn = true
//         const token = jwt.sign({ 
//             name:findUser.name,
//             email: findUser.email,
//             userId: findUser._id }, 
//             process.env.secret_key,
//             { expiresIn: "1d" });

//             return  res.status(200).json({message:'login successfully ',token})

        
//     } catch (error) {
        
//         return res.status(500).json(error.message);
//     }
// }


