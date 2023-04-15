express = require("express");
userController = require("../controller/userController");

let router = express.Router();

router.get("/get-all", userController.getAlluser);
router.post("/getUserByToken", userController.getUserByToken);
router.post("/add", userController.createNewUser);
router.put("/update", userController.updateUser);
router.delete("/delete", userController.deleteUser);
module.exports = router;
