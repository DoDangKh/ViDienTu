
const routerUser = require('./apiUser')


function initAPIRoute(app) {
    app.use('/api/v1/user', routerUser)
}

module.exports = initAPIRoute;