const express = require('express')
const initAPIRoute = require('./src/routes/api')
const app = express()
const port = 5000
const route = require('./src/routes/api')
const bp = require('body-parser')

app.get('/', (req, res) => {
    res.send('Heollo World')
})

app.use(bp.json())
app.use(bp.urlencoded({ extended: true }))
initAPIRoute(app)

app.listen(port, () => {
    console.log('Example app listening ' + port)
})

