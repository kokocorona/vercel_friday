const express = require("express");
// מייצר משתנה ראוטר
const router = express.Router();

// הגדרת הכתובת ביחס להגדרת הראוט של הראוטר
router.get("/",async(req,res) => {
  res.json({msg:"Express work"})
})

// export default
module.exports = router;