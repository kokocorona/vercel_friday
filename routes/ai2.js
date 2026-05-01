const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai")
require("dotenv").config({ quiet: true })
const axios = require("axios");
const fs = require("fs")
const path = require("path")
const {uploadBufferToGitHub} = require("../utils/github_buffer")
// מייצר משתנה ראוטר
const router = express.Router();
const genAi = new GoogleGenerativeAI(process.env.GEMINI_KEY)

const chatHistory = [
  // {role:"user",parts:[{text:"שלום"}]}
]
const MAX_HISTORY = 10;

// הגדרת הכתובת ביחס להגדרת הראוט של הראוטר
router.get("/", async (req, res) => {
  res.json({ msg: "ai2 work" })
})
// הכנת המודל של הבינה
// gemini-2.5-flash
// gemini-3.1-flash-lite-preview
// gemini-3-flash-preview
// לינק לכל המודלים הקיימים:

// ניתן לשאול את הבינה כל שאלה והיא תענה עד 20 מילים ויהיה היסטוריה
router.post("/test", async (req, res) => {


  try {
    // איסוף פרומפט מהבאדי
    const prompt = req.body?.prompt;
    if (!prompt) {
      return res.status(400).json({ err: "you need to send prompt in the body" })
    }

    const model = genAi.getGenerativeModel({
      model: "gemini-3.1-flash-lite-preview",
      systemInstruction: "answer on the question of the user up to 20 words max"
    });

    const myChat = model.startChat({ history: chatHistory })

    const { response } = await myChat.sendMessage(prompt);
    // const {response} =  await model.generateContent(prompt);
    chatHistory.push({ role: "user", parts: [{ text: prompt }] })
    res.json({ msg: response.text() })

  }
  catch (err) {
    console.log(err);
    res.status(502).json({ err })
  }
})




router.post("/chat_el_al", async (req, res) => {


  try {
    // איסוף פרומפט מהבאדי
    const prompt = req.body?.prompt;
    if (!prompt) {
      return res.status(400).json({ err: "you need to send prompt in the body" })
    }

    // בקשת API למידע על החברה מקובץ טקסט
    const url = "https://raw.githubusercontent.com/kokocorona/n8n_test/refs/heads/main/el_al_money_back.txt"
    const { data } = await axios.get(url);
    // console.log(data);

    const model = genAi.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: `
          ## ROLE:
אתה סוכן של חברת אל על משירות לקוחות

## TASK:
לענות על שאלות למשתמשים לגבי החזר כספי אם מגיע להם או לא בגלל ביטולי טיסה וסיבות אישיות אחרות....
תענה תמיד בעברית ובלשון זכר

## DETAILS:
      המידע שעליו תענה בלבד הינו:
      ${data}

      אתה מחוייב לענות רק על שאלות שקושרות לחברת אל על ולמידע שהכלי מספק לך 
ותמיד תענה בלשון רבים בזכר...
      `
    });
    // כדי להוסיף היסטוריה לאיי איי שלנו
    // const {response} =  await model.generateContent(prompt);
    const myChat = model.startChat({ history: chatHistory })

    const { response } = await myChat.sendMessage(prompt);
    chatHistory.push({ role: "user", parts: [{ text: prompt }] })
    // כרגע ההיסטוריה משותפת בין כל המשתמשים
    if (chatHistory.length > MAX_HISTORY) {
      chatHistory.shift()
    }
    // console.log(response)
    res.json({ msg: response.text() })

  }
  catch (err) {
    console.log(err);
    res.status(502).json({ err })
  }
})

router.post("/image", async (req, res) => {
  try {

    const prompt = req.body?.prompt;
    if (!prompt) {
      return res.status(400).json({ err: "you need to send prompt in the body" })
    }

    const url = "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell"
    const { data } = await axios({
      url: url,
      headers: {
        // אחרי הBearer
        // יגיע הטוקן שקיבלנו מהאתר
        "Authorization": `Bearer ${process.env.HUGGING_KEY}`,
        "Content-Type": "application/json",
        "Accept": "*/*"
      },
      method: "POST",
      // כדי לשלוח את הפרומפט שולחים כאובייקט באינפוטס
      data: { inputs: `"${prompt} ${Date.now()} create it in Disney style"` },
      responseType: 'arraybuffer',

    })

    const config = {
      token: process.env.GITHUB_TOKEN,
      owner: 'kokocorona',
      repo: 'vercel_ai',
      branch: 'main'
    };

    const result1 = await uploadBufferToGitHub(data, `ai_images/img_${Date.now()}.png`, config);
    console.log("הקובץ הועלה! קישור:", result1.content.html_url);

    // איפה שתשמר התמונה
    const fileName = Date.now()+".jpg"
    // const saveFileName = "public/images/"+fileName
    // const saveFileName = path.join(__dirname,"/public/images/"+fileName) 
    // const saveFileName = `${req.protocol}://${req.get('host')}/images/${fileName}`; 
    // fs.writeFileSync(saveFileName, data)
    res.json({ msg: "image", fileName, url:result1.content.download_url , data })
  }
  catch (err) {
    console.log(err);
    res.status(502).json({ err })
  }
})


// export default
module.exports = router;