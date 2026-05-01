const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai")
require("dotenv").config({ quiet: true })
const axios = require("axios");
const fs = require("fs");
const {uploadBufferToGitHub} = require("../utils/github_buffer")
// מייצר משתנה ראוטר
const router = express.Router();
const genAi = new GoogleGenerativeAI(process.env.GEMINI_KEY)

// הגדרת הכתובת ביחס להגדרת הראוט של הראוטר
router.get("/",async(req,res) => {
  res.json({msg:"ai 3 work"})
})

router.post("/test",async(req,res) => {
  try{
    const prompt = req.body?.prompt;
    if (!prompt) {
      return res.status(400).json({ err: "you need to send prompt in the body" })
    }

    const model = genAi.getGenerativeModel({
      model: "gemini-3.1-flash-lite-preview",
      systemInstruction: "answer on the question of the user up to 20 words max"
    });

    const {response} = await model.generateContent(prompt)
    res.json({msg:response.text()})

  }
  catch(err){
    console.log(err);
    res.status(502).json({err})
  }
})

router.post("/image",async(req,res) => {
  try{

    const prompt = req.body?.prompt;
    if (!prompt) {
      return res.status(400).json({ err: "you need to send prompt in the body" })
    }

    const url = "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell"
    const {data} = await axios({
      url:url,
      headers:{
        // אחרי הBearer
        // יגיע הטוקן שקיבלנו מהאתר
        "Authorization":`Bearer ${process.env.HUGGING_KEY}`,
        "Content-Type": "application/json",
        "Accept":"*/*"
      },
      method:"POST",
      // כדי לשלוח את הפרומפט שולחים כאובייקט באינפוטס
      data:{inputs:`"${prompt} ${Date.now()} create it in Disney style"`},
      responseType: 'arraybuffer',
      
    })
    // איפה שתשמר התמונה
    const fileName = Date.now()+".jpg"
    const saveFileName = "public/images/"+fileName
    fs.writeFileSync(saveFileName, data)
    res.json({msg:"image",fileName,data})
  }
  catch(err){
    console.log(err);
    res.status(502).json({err})
  }
})

router.post("/image_git",async(req,res) => {
  try{

    const prompt = req.body?.prompt;
    if (!prompt) {
      return res.status(400).json({ err: "you need to send prompt in the body" })
    }

    const url = "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell"
    const {data} = await axios({
      url:url,
      headers:{
        // אחרי הBearer
        // יגיע הטוקן שקיבלנו מהאתר
        "Authorization":`Bearer ${process.env.HUGGING_KEY}`,
        "Content-Type": "application/json",
        "Accept":"*/*"
      },
      method:"POST",
      // כדי לשלוח את הפרומפט שולחים כאובייקט באינפוטס
      data:{inputs:`"${prompt} ${Date.now()} create it in Disney style"`},
      responseType: 'arraybuffer',
      
    })

    // העלאה לגיט האב 
    const config = {
      token: process.env.GITHUB_KEY,
      owner: 'kokocorona',
      repo: 'friday_ariel_ai_images',
      branch: 'main'
    };

    const gitData = await uploadBufferToGitHub(data,`ai_images/${Date.now()}.jpg`,config)
    console.log("git",gitData)

    
    res.json({msg:"image", url:gitData.content.download_url})
  }
  catch(err){
    console.log(err);
    res.status(502).json({err})
  }
})

// export default
module.exports = router;