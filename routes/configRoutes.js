const indexR = require("./index");
const usersR = require("./users"); 
const drinksR = require("./drinks"); 
const aiTestR = require("./aiTest");
const ai2R = require("./ai2");
const ai3R = require("./ai3");




// הגדרת כל הראוטים באפליקציה
exports.routesInit = (app) => {
  app.use("/",indexR);
  app.use("/users",usersR);
  app.use("/drinks",drinksR);
  app.use("/aiTest",aiTestR);
  app.use("/ai2",ai2R);
  app.use("/ai3",ai3R);


}


