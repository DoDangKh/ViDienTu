express = require("express");
userController = require("../controller/userController");

let router = express.Router();

router.post("/get-all", userController.getAlluser);
router.post("/searchUser", userController.searchUser);
router.post("/getUserByToken", userController.getUserByToken);
router.post("/add", userController.createNewUser);
router.put("/update", userController.updateUser);
router.delete("/delete", userController.deleteUser);
router.put("/update-android", userController.updateUserAndroid);
router.get("/get-username-by-sdt", userController.getUserNameByPhoneNum);

module.exports = router;
