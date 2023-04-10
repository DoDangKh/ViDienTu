const pool = require('../configs/connectDB')
const jwt = require('jsonwebtoken')
const moment = require('moment')
let getSend = async (req, res) => {
    const token = req.body.token
    if (!token) {
        return res.status(200).json({
            message: 'e005'
        })
    }
    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        console.log(decoded)
        const [rows, fields] = await pool.execute('Select * from giaodich where SDT1=?', [decoded.SDT])
        return res.status(200).json({
            success: true,
            code: "e000",
            data: rows
        })
    }
    catch (err) {
        console.log(err.message)
        return res.status(200).send('e006')
    }
}
let getreceive = async (req, res) => {
    const token = req.body.token
    if (!token) {
        return res.status(200).json({
            message: 'e005'
        })
    }
    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        console.log(decoded)
        const [rows, fields] = await pool.execute('Select * from giaodich where SDT2=?', [decoded.SDT])
        return res.status(200).json({
            success: true,
            code: "e000",
            data: rows
        })
    }
    catch (err) {
        console.log(err.message)
        return res.status(200).send('e006')
    }
}
let transfer = async (req, res) => {
    // datetime = new Date().toISOString({ timeZone: "America/New_York" }).slice(0, 19).replace('T', ' ');

    const token = req.body.token
    if (!token) {
        return res.status.json({
            message: 'e005'
        })
    }
    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        amount = req.body.STGD
        sdt = req.body.SDT
        m = moment()
        s = m.format("YYYY-MM-DD HH:mm:ss")
        await pool.execute("insert into giaodich(SDT1,SDT2,STGD,NGAYGD,CHIETKHAU) values(?,?,?,?,?)",
            [decoded.SDT, sdt, amount, s, 5 / 100 * amount])
        const [rows1, fields1] = await pool.execute("Select SoDu from account where SDT=?", [decoded.SDT])
        const [rows2, fields2] = await pool.execute("Select SoDu from account where SDT=?", [sdt])
        wallet1 = rows1[0].SoDu - amount - 5 / 100 * amount
        wallet2 = rows2[0].SoDu + amount
        console.log(sdt)
        console.log(rows1.SoDu)
        await pool.execute("update account set SoDU=? where SDT=?", [wallet1, decoded.SDT])
        await pool.execute("update account set SoDu=? where SDT=?", [wallet2, sdt])
        return res.status(200).json({
            success: true,
            code: "e000",
            message: "Transaction successful",
        });

    }
    catch (err) {
        console.log(err)
        return res.status(200).json({
            success: false,

            code: "e006",
        })
    }
}
module.exports = {
    getSend,
    getreceive,
    transfer
}