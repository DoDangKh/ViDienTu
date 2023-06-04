const express = require("express");
const accountController = require("../controller/accountController");

let Router = express.Router();

Router.get("/get-all", accountController.getAllAccount);
Router.post("/updateUser", accountController.updateUser);
Router.post("/sign-up", accountController.Signup);
Router.post("/login", accountController.login);
Router.post("/forgetpassword", accountController.forgetPassword);
Router.post("/get-user-balance", accountController.getBalanceByUser);

module.exports = Router;
