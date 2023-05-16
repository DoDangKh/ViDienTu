express = require("express");
servicesController = require("../controller/servicesController.js");

let router = express.Router();

router.get("/getAllTypeServices", servicesController.getAllTypeServices);
router.get("/getAllServices", servicesController.getAllServices);
router.post("/createTypeService", servicesController.createTypeService);
router.post("/createService", servicesController.createService);
router.post("/updateService", servicesController.updateService);
router.post("/deleteService", servicesController.deleteService);
module.exports = router;
