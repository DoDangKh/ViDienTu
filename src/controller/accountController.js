const pool = require('../configs/connectDB')
const jwt = require('jsonwebtoken')
// const key = require('../configs/JWTconfigs')
const dotenv = require('dotenv')
dotenv.config()
let getAllAccount = async (req, res) => {
    const [rows, fields] = await pool.execute('Select * from account')
    return res.status(200).json({
        message: 'e000',
        data: rows
    })
}

let Signup = async (req, res) => {
    let account = req.body
    console.log(account)
    if (!account.SDT || !account.Mail || !account.Password || !account.Status || !account.SoDu || !account.HO || !account.TEN || !account.CMND) {
        return res.status(200).json({
            message: 'e001'
        })
    }

    const [rows, fields] = await pool.execute('Select * from account where SDT=? and status=1', [account.SDT])
    if (rows.length != 0) {
        return res.status(200).json({
            message: 'e002'
        })
    }
    await pool.execute('insert into user(SDT,Ho,Ten,CMND) values(?,?,?,?)', [account.SDT, account.HO, account.TEN, account.CMND])
    await pool.execute('insert into account(SDT,Mail,Password,Status,SoDu) values(?,?,?,?,?)', [account.SDT, account.Mail, account.Password, account.Status, account.SoDu])
    return res.status(200).json({
        success: 'true',
        message: 'e000'
    })

}
let login = async (req, res) => {
    let account = req.body
    console.log(account)
    const [rows, fields] = await pool.execute('select * from account where  SDT = ? and password = ?', [account.SDT, account.Password])
    console.log(typeof (rows))
    if (Object.keys(rows).length == 0 && empty.constructor === Object) {
        return res.status(200).json({
            message: 'e003'
        })
    }
    console.log(process.env.ACCESS_TOKEN_SECRET)
    const token = jwt.sign(account, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '30m' })
    return res.status(200).json({
        message: 'e000',
        token
    })
}

module.exports = {
    getAllAccount
    , Signup
    , login
}