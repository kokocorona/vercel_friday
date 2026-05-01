// מייבא את האקספרס
const express = require("express");
// ספרייה שיודעת לבצע מינפולציות על כתובות
const path = require("path");
// ספרייה שיודעת להפעיל שרת
const http = require("http");
// ספרייה שמאפשרת תקשורת בדפדפנים מדומיינים שונים
const cors = require("cors");

// התחברות למסד נתונים
require("./db/mongoConnect");



// ייבוא פונקצית הרואטים
const {routesInit} = require("./routes/configRoutes")
// מגדיר משתנה שיקבל את היכולות של אקספרס ויוכל להוסיף
// לאקספרס יכולות
const app = express();
// מאפשר תקשורת מדומיינים אחרים
app.use(cors());

// כדי שנוכל לשלוח באדי 
app.use(express.json());

// הגדרת תקיית פאבליק כתקייה ציבורית
app.use(express.static(path.join(__dirname,"public")))

// הפעלת פונקציה שמריצה את כל הראוטים
routesInit(app)
// app.use("/",indexR)

// הגדרת שרת שמקבל יכולת של אקספרס
const server = http.createServer(app);
// מפעיל את השרת ומאזין לו בפורט 3001
server.listen(3001);

console.log("express run http://localhost:3001")