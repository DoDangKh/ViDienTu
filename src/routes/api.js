
const routerUser = require('./apiUser');
const routerAccount = require('./apiAccount')
const routerTransaction = require('./apiTransaction')

function initAPIRoute(app) {
    app.use('/api/v1/user', routerUser)
    app.use('/api/v1/account', routerAccount)
    app.use('/api/v1/transaction', routerTransaction)
}

module.exports = initAPIRoute;