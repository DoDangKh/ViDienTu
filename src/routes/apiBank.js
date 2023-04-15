const express = require("express");
const bankController = require("../controller/bankController");

let Router = express.Router();
Router.get("/getAllBanks", bankController.getAllBanks);
Router.post("/getCardBankByUser", bankController.getCardBankByUser);
Router.post("/link", bankController.linkbank);
//nạp tiền
Router.post("/getmoney", bankController.getmoney);

//rút tiền
Router.post("/sendmoney", bankController.sendmoney);

module.exports = Router;
