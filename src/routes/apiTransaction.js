const express = require('express')
const transactionController = require('../controller/transactionController')

let router = express.Router()
router.post("/get-sent", transactionController.getSend)
router.post("/get-receive", transactionController.getreceive)
router.get("/transfer", transactionController.transfer)
router.get("/get-all", transactionController.getallTransaction)

module.exports = router
