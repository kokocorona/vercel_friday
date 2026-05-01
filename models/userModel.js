// user model
const mongoose = require("mongoose");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
require("dotenv").config({quiet:true});

const schema = new mongoose.Schema({
  name:String,
  email:String,
  password:String,
  role:{
    type:String, default:"user"
  }
},{timestamps:true})

exports.UserModel = mongoose.model("users",schema);
// בטוקן גם נשמור את הרול/תפקיד של המשתמש
exports.createToken = (_user_id,_role) => {
  // יצירת טוקן , מקבל 3 פרמטרים
  // התכולה של הטוקן כפרמטר ראשון , בדרך כלל נשים לפחות את האיי די של המשתמש
  // הפמטר השני- מילה סודית, שאסור לחשוף אותה
  // פרמטר שלישי - תוקף של הטוקן
  const token = jwt.sign({_id:_user_id,role:_role},process.env.TOKEN_KEY,{expiresIn:"600mins"});
  return token;
}

exports.validUser = (_reqBody) => {
  const joiSchema = Joi.object({
    name:Joi.string().min(2).max(99).required(),
    email:Joi.string().min(2).max(99).email().required(),
    password:Joi.string().min(3).max(99).required(),
  })
  return joiSchema.validate(_reqBody);
}
// וולדזציה של התחברות צריכה רק מייל וסיסמא
exports.validLogin = (_reqBody) => {
  const joiSchema = Joi.object({
    email:Joi.string().min(2).max(99).email().required(),
    password:Joi.string().min(3).max(99).required(),
  })
  return joiSchema.validate(_reqBody);
}