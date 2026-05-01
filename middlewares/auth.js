const jwt = require("jsonwebtoken")
require("dotenv").config({quiet:true});

// פונקציות אוטנטיקשן - בדיקת אימות של טוקן
exports.auth = (req,res,next) => {
   // req.body , req.params, req.query , req.header
  const token = req.header("x-api-key");
  // אם נשלח בכלל טוקן
  if(!token){
    return res.status(401).json({error:"You must send token 111"})
  }
  try{
    // בדיקה אם התוקן תקין או בתוקף 
    const tokenData = jwt.verify(token,process.env.TOKEN_KEY)
    // req - פרמטר של אובייקט שקיים בכל הפונקציות בשרשור של הראוטר
    req.tokenData = tokenData
    // לעבור לפונקציה הבאה בתור של השרשור של הראוטר
    next()
  }
  catch(err){
    // אם הטוקן לא עבר תקינות יגיע לקצ'
    return res.status(401).json({msg:"Token invalid or expired 222"})
  }
}

exports.authEditor = (req,res,next) => {
  const token = req.header("x-api-key");
  if(!token){
    return res.status(401).json({error:"You must send token 111"})
  }
  try{
    const tokenData = jwt.verify(token,process.env.TOKEN_KEY)
    // בודק אם המשתמש הוא אדמין או אידטור
    if(tokenData.role != "admin" && tokenData.role != "editor"){
      return res.status(401).json({msg:"You must be admin or editor in this endpoint"})
    }
    req.tokenData = tokenData
    next()
  }
  catch(err){
    return res.status(401).json({msg:"Token invalid or expired 222"})
  }
}


// בדיקה לאדמין
exports.authAdmin = (req,res,next) => {
  const token = req.header("x-api-key");
  if(!token){
    return res.status(401).json({error:"You must send token 111"})
  }
  try{
    const tokenData = jwt.verify(token,process.env.TOKEN_KEY)
    // בודק אם המשתמש הוא אדמין
    if(tokenData.role != "admin"){
      return res.status(401).json({msg:"You must be admin in this endpoint"})
    }
    req.tokenData = tokenData
    next()
  }
  catch(err){
    return res.status(401).json({msg:"Token invalid or expired 222"})
  }
}