const mongoose=require("mongoose")
const UserSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName:{
        type:String,
        required:true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phoneNumber:{
    type:String,
    },
    password: {
        type: String,
        required: true
    },
    confirmPassword:{
        type:String,
        //required:true

    },
    
    isVerified: {
        type: Boolean,
        default: false
    },
    isLoggedIn:{
       type:Boolean,
       default:false
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    //todos: [{
        //type: mongoose.Schema.Types.ObjectId,
        //ref: 'Todo'
    //}]
},{timestamp:true});

const userModel = mongoose.model('user n',UserSchema)
module.exports= userModel