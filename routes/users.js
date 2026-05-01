const express = require("express");
const Bcrypt = require("bcrypt")
const { UserModel, validUser, validLogin,createToken } = require("../models/userModel")
// const jwt = require("jsonwebtoken");
const {auth, authAdmin} = require("../middlewares/auth");
const router = express.Router();

router.get("/", async(req, res) => {
  res.json({ msg: "users work" });
})

router.get("/list",authAdmin,async(req,res) => {
  try{
    const limit = 10;
    const skip = req.query.skip || 0;
    const data = await UserModel
    .find({},{password:0})
    .limit(limit)
    .skip(skip)
    res.json(data);
  }
  catch(err){
    console.log(err);
    res.status(502).json({err})
  }
})
 
router.get("/userInfo",auth,async(req,res) => {
  try{
    const data = await UserModel.findOne({_id:req.tokenData._id},{password:0});
    res.json(data);
  }
  catch(err){
    console.log(err);
    res.status(502).json({err})
  }
  
})



// הרשמה של משתמש חדש
router.post("/",async(req,res) => {
  const validBody = validUser(req.body);
  if(validBody.error){
    return res.status(400).json(validBody.error.details);
  }
  try{
    const user = new UserModel(req.body);
    // להצפין את הסיסמא - 10 רמת אבטחה סבירה לחנות קטנה,בינונית
    user.password = await Bcrypt.hash(user.password,10)
    await user.save();
    user.password = "*****"
    res.status(201).json(user)
  }
  catch(err){
    if(err.code == 11000){
      return res.status(400).json({err:"Email aleady system",code:11000})
    }
    console.log(err);
    res.status(502).json({err})
  }
})

router.post("/login",async(req,res) => {
  const validBody = validLogin(req.body);
  if(validBody.error){
    return res.status(400).json(validBody.error.details);
  }
 try{
  // אם המייל קיים במערכת שמגיע מהבאדי
  const user = await UserModel.findOne({email:req.body.email});
  if(!user){
    return res.status(401).json({err:"Email or password worng"})
  }
  // לבדוק את הסיסמא אם מתאימה לסיסמא המוצפנת של הרשומה
  const passValid = await Bcrypt.compare(req.body.password,user.password)
  if(!passValid){
    return res.status(401).json({err:"Email or password worng 222"})
  }
  // לשלוח בחזרה טוקן
  const token = createToken(user._id,user.role)
  res.json({token})
 }
 catch(err){
  console.log(err);
  res.status(502).json({err})
 }
})

// מאפשר לאדמין להפוך משתמשים אחרים ליוזר או אדמין
router.patch("/changeRole/:user_id/:role",authAdmin,async(req,res) => {
  try{
    const user_id = req.params.user_id;
    const role = req.params.role;
    // דואג שלא נוכל להפוך את המשתמש הסופר אדמין לרול אחר
    if(user_id == "6975fcc90f01ff98f12e1069" ){
      return res.status(401).json({err:"you cant update the super admin"})
    }
    const data = await UserModel.updateOne({_id:user_id},{role});
    res.json(data);
  }
  catch(err){
    console.log(err);
    res.status(502).json({err})
  }
})

module.exports = router;