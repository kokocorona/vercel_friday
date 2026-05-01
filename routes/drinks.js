const express = require("express");
const { DrinkModel, validDrink } = require("../models/drinkModel")
const {auth} = require("../middlewares/auth");
// מייצר משתנה ראוטר
const router = express.Router();

// הגדרת הכתובת ביחס להגדרת הראוט של הראוטר
router.get("/", async (req, res) => {
  const limit = 5;
  //?skip=
  const skip = req.query.skip || 0;
  const sort = req.query.sort || "_id";

  try {
    const data = await DrinkModel
    .find({})
    .limit(limit)
    .skip(skip)
    .sort({[sort]:-1})
    res.json(data);
  }
  catch (err) {
    console.log(err);
    res.status(502).json({ err })
  }
})

router.get("/single/:id",async(req,res) => {
  try{
    const id = req.params.id;
    const data = await DrinkModel.findOne({_id:id});
    res.json(data);
  }
  catch(err){
    console.log(err);
    res.status(502).json({err})
  }
})

router.get("/count", async (req, res) => {
  try {
    const count = await DrinkModel.countDocuments({});
    res.json({ count });
  } catch (error) {
    console.log(err);
    res.status(502).json({ err })
  }
})


router.post("/", auth,async (req, res) => {
  const validBody = validDrink(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    const drink = new DrinkModel(req.body);
    drink.user_id = req.tokenData._id;
    await drink.save();
    res.status(201).json(drink)
  }
  catch (err) {
    console.log(err);
    res.status(502).json({ err })
  }
})

// הוספת רשומה חדשה ללא אימות
// router.post("/test", async (req, res) => {
//   const validBody = validDrink(req.body);
//   if (validBody.error) {
//     return res.status(400).json(validBody.error.details);
//   }
//   try {
//     const drink = new DrinkModel(req.body);
//     await drink.save();
//     res.status(201).json(drink)
//   }
//   catch (err) {
//     console.log(err);
//     res.status(502).json({ err })
//   }
// })

router.put("/:id", auth,async(req,res) => {
  const validBody = validDrink(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try{
    const id = req.params.id;
    // יוזר יכול למחוק רק את הרשומות של עצמו
    const data = await DrinkModel.updateOne({_id:id,user_id:req.tokenData._id},req.body)
    res.json(data)
  }
  catch(err){
    console.log(err);
    res.status(502).json({err})
  }
})


router.delete("/:id", auth,async(req,res) => {
  try{
    const id = req.params.id;
    // דואג שאדמין יוכל למחוק כל רשומה
    if(req.tokenData.role == "admin"){
      const data = await DrinkModel.deleteOne({_id:id})
      return res.json(data)
    }
    // יוזר יכול למחוק רק את הרשומות של עצמו
    const data = await DrinkModel.deleteOne({_id:id,user_id:req.tokenData._id})
    res.json(data)
  }
  catch(err){
    console.log(err);
    res.status(502).json({err})
  }
})

// export default
module.exports = router;