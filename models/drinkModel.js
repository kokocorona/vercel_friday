const mongoose = require("mongoose");
const Joi = require("joi");


const schema = new mongoose.Schema({
  "name": String,
  "price": Number,
  "cals": Number,
  "user_id":String
},{timestamps:true})

exports.DrinkModel = mongoose.model("drinks",schema);

exports.validDrink = (_reqBody) => {
  const joiSchema = Joi.object({
    name:Joi.string().min(2).max(99).required(),
    price:Joi.number().min(1).max(9999).required(),
    cals:Joi.number().min(0).max(9999).required(),

  })
  return joiSchema.validate(_reqBody)
}
