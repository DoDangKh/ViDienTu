const express = require('express')
const transactionController = require('../controller/transactionController')

let router = express.Router()
router.post("/get-sent", transactionController.getSend)
router.post("/get-receive", transactionController.getreceive)
router.get("/transfer", transactionController.transfer)

module.exports = router
