
const routerUser = require('./apiUser');
const routerAccount = require('./apiAccount')


function initAPIRoute(app) {
    app.use('/api/v1/user', routerUser)
    app.use('/api/v1/account', routerAccount)
}

module.exports = initAPIRoute;