express = require("express");
servicesController = require("../controller/servicesController.js");

let router = express.Router();

router.get("/getAllTypeServices", servicesController.getAllTypeServices);
router.post("/getAllServices", servicesController.getAllServices);
router.post("/createTypeService", servicesController.createTypeService);
router.post("/createService", servicesController.createService);
router.post("/updateService", servicesController.updateService);
router.post("/deleteService", servicesController.deleteService);
router.post("/payService", servicesController.payService);
module.exports = router;
