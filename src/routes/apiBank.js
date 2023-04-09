const express = require('express')
const bankController = require('../controller/bankController')

let Router = express.Router()
Router.get('/getbyuser', bankController.getbankbyUser)
Router.post('/link', bankController.linkbank)
Router.post('/getmoney', bankController.getmoney)
Router.post('/sendmoney', bankController.sendmoney)

module.exports = Router