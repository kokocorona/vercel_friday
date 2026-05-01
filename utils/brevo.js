const axios = require("axios");
require("dotenv").config({quiet:true});

exports.sendBrevoEmail = async (_email,_subject,_content) => {
  const apiKey = process.env.BREVO_KEY;
  const url = 'https://api.brevo.com/v3/smtp/email';

  const data = {
    sender: {
      name: "koko akof",
      email: "koko.akof10@gmail.com" // לשנות למייל שאתם רשומים בו בבריבו
    },
    to: [{
      email: _email
    }],
    subject: _subject,
    htmlContent: _content
  }

  const config = {
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  };

  try {
    const response = await axios.post(url, data, config);
    console.log('המייל נשלח בהצלחה! מזהה הודעה:', response.data.messageId);
    return response.data;
  } catch (error) {
    // הדפסת השגיאה המפורטת שמגיעה מ-Brevo
    if (error.response) {
      console.error('שגיאה מהשרת של Brevo:', error.response.data);
    } else {
      console.error('שגיאת תקשורת:', error.message);
    }
    throw error;
  }


}