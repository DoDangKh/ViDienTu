const express = require("express");
const transactionController = require("../controller/transactionController");

let router = express.Router();
//get nạp tiền
router.post("/get-refill", transactionController.getRefill);

//get rút tiền
router.post("/get-withdrawal", transactionController.getWithdrawal);

//get chuyển tiền
router.post("/get-sent", transactionController.getSend);

//get nhận tiền
router.post("/get-receive", transactionController.getreceive);

//chuyển tiền
router.post("/transfer", transactionController.transfer);

//get tất cả lịch sử giao dịch
router.post("/get-all", transactionController.getallTransaction);

router.post("/get-all-filter", transactionController.getallTransactionFiltered)

module.exports = router;
