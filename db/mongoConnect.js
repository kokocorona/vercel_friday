const mongoose = require('mongoose');
// במידה ויש אירור שמתחיל : querySrv ECONNREFUSED
const dns = require("node:dns/promises")
// דואג שנוכל לדבר עם משתני עם אי אן וי
require("dotenv").config({quiet:true});
main().catch(err => console.log(err));

// console.log(process.env.MONGO_DB);


async function main() {
// במידה ויש אירור שמתחיל : querySrv ECONNREFUSED
  dns.setServers(["1.1.1.1"]);
  await mongoose.connect(process.env.MONGO_DB);

  // await mongoose.connect('mongodb://127.0.0.1:27017/test');
  console.log("mongo connect arial_friday atlas");

  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}