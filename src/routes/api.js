
const routerUser = require('./apiUser');
const routerAccount = require('./apiAccount')
const routerTransaction = require('./apiTransaction')
const routerBank = require('./apiBank')

function initAPIRoute(app) {
    app.use('/api/v1/user', routerUser)
    app.use('/api/v1/account', routerAccount)
    app.use('/api/v1/transaction', routerTransaction)
    app.use('/api/v1/bank', routerBank)
}

module.exports = initAPIRoute;