express = require('express')
userController = require('../controller/userController')


let router = express.Router()

router.get('/get-all', userController.getAlluser)
router.post('/add', userController.createNewUser)
module.exports = router