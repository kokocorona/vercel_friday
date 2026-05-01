const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai")
const axios = require("axios");
require("dotenv").config({ quiet: true })


const { sendBrevoEmail } = require("../utils/brevo")
// מייצר משתנה ראוטר
const router = express.Router();

const genAi = new GoogleGenerativeAI(process.env.GEMINI_KEY)

// הגדרת הכתובת ביחס להגדרת הראוט של הראוטר
router.get("/", async (req, res) => {
  try {
    // הכנת המודל של הבינה
    // gemini-2.5-flash
    // gemini-3.1-flash-lite-preview
    // gemini-3-flash-preview
    // לינק לכל המודלים הקיימים:
    // https://docs.cloud.google.com/vertex-ai/generative-ai/docs/models
    const model = genAi.getGenerativeModel({ model: "gemini-3.1-flash-lite-preview" })
    // פרומפט של המשתמש
    const prompt = "Where is Israel location in earth";
    // מעבד את המידע
    const { response } = await model.generateContent(prompt);
    res.json({ msg: response.text() })
  }
  catch (err) {
    console.log(err);
    res.status(502).json({ err })
  }
})


router.post("/prompt", async (req, res) => {
  try {
    // פרומפט של המשתמש
    const prompt = req.body?.prompt;
    if (!prompt) {
      return res.status(400).json({ err: "you need to send prompt in the body" })
    }
    // הכנת המודל של הבינה
    const model = genAi.getGenerativeModel({
      model: "gemini-3.1-flash-lite-preview",
      systemInstruction: `answer on the question of the user up to 20 words max`
    })

    // מעבד את המידע
    const { response } = await model.generateContent(prompt);
    res.json({ msg: response.text() })
  }
  catch (err) {
    console.log(err);
    res.status(502).json({ err })
  }
})

// משתנים בשביל הסוכן
const chatHistory_ar = [
  // {role:"user",parts:[{text:"שלום"}]}
];
const MAX_HISTORY = 10;

router.post("/agent", async (req, res) => {
  try {
    // פרומפט של המשתמש
    const prompt = req.body?.prompt;
    if (!prompt) {
      return res.status(400).json({ err: "you need to send prompt in the body" })
    }

    const url = "https://raw.githubusercontent.com/kokocorona/n8n_test/refs/heads/main/el_al_money_back.txt"
    const { data } = await axios.get(url);
    console.log(data);
    // return res.json({data});

    // הכנת המודל של הבינה
    const model = genAi.getGenerativeModel({
      model: "gemini-3.1-flash-lite-preview",
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
    })

    // מייצר את הצ'ט
    const myChat = model.startChat({history:chatHistory_ar})

    // const { response } = await model.generateContent(prompt);
    // שולח את ההודעה לצ'ט
    const { response } = await myChat.sendMessage(prompt);
    // שמרנו את המידע בפורמט הנכון במערך של ההיסטוריה
    chatHistory_ar.push({role:"user",parts:[{text:prompt}]})

    // TODO: מגביל ל 10 הודעות בזכרון
    // TODO: פר משתמש ההיסטוריה תיהיה  מקושרת

    res.json({ msg: response.text() })
  }
  catch (err) {
    console.log(err);
    res.status(502).json({ err })
  }
})

router.post("/email", async (req, res) => {
  try {
    const data = await sendBrevoEmail("koko.akof10@gmail.com", "new message 4444", "email text");
    // console.log("email send",data);
    res.json({ msg: "email sended", data })
  }
  catch (err) {
    console.log(err);
    res.status(502).json({ err })
  }
})
// export default
module.exports = router;