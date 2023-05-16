const routerUser = require("./apiUser");
const routerAccount = require("./apiAccount");
const routerTransaction = require("./apiTransaction");
const routerBank = require("./apiBank");
const routerServices = require("./apiServices");

function initAPIRoute(app) {
  app.use("/api/v1/user", routerUser);
  app.use("/api/v1/account", routerAccount);
  app.use("/api/v1/transaction", routerTransaction);
  app.use("/api/v1/bank", routerBank);
  app.use("/api/v1/services", routerServices);
}

module.exports = initAPIRoute;
