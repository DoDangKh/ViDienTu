const express = require('express')
const accountController = require('../controller/accountController')

let Router = express.Router()

Router.get('/get-all', accountController.getAllAccount)
Router.post('/sign-up', accountController.Signup)
Router.post('/login', accountController.login)
Router.post('/forgetpassword', accountController.forgetPassword)
module.exports = Router 