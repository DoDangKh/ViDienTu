const pool = require('../configs/connectDB')
const jwt = require('jsonwebtoken')
const moment = require('moment')
let getbankbyUser = async (req, res) => {
    const token = req.body.token
    if (!token) {
        return res.status.json({
            code: 'e005',
            message: 'token unqualified'
        })
    }
    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        const [rows, fields] = await pool.execute('SELECT nganhang.MANH, nganhang.TENNH, nganhang.CHIETKHAU FROM nganhang inner join tknganhang on nganhang.MANH=tknganhang.MANH where SDT=?',
            [decoded.SDT])
        return res.status(200).json({
            code: 'e000',
            message: 'success',
            data: rows
        })
    }
    catch {
        return res.status.json({
            code: 'e008',
            message: 'bank error'
        })
    }
}
let linkbank = async (req, res) => {
    const token = req.body.token
    if (!token) {
        return res.status.josn({
            code: 'e005',
            message: 'token unqualified'
        })
    }
    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        console.log(req.body)
        console.log(decoded)
        day = new Date(req.body.NGAYPHATHANH)
        console.log(day)
        await pool.execute('insert into tknganhang(SODU,MANH,SDT,NGAYPHATHANH) values(?,?,?,?)', [req.body.SODU, req.body.MANH, decoded.SDT, day])
        return res.status(200).json({
            code: 'e000',
            message: 'success'
        })
    }
    catch (err) {
        console.log(err.message)
        return res.status(200).json({
            code: 'e008',
            message: 'bank error'
        })
    }
}
let getmoney = async (req, res) => {
    const token = req.body.token
    if (!token) {
        return res.status(200).json({
            code: 'e005',
            message: 'token unqualified'
        })
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    [rows2, fields2] = await pool.execute('select * from user where SDT=?', [decoded.SDT]);
    [rows, fields] = await pool.execute('select * from tknganhang where MATK=?', [req.body.MATK]);
    [rows3, fields3] = await pool.execute('select * from nganhang where MANH=?', [rows[0].MANH])
    console.log(rows3[0])
    if (!rows) {
        return res.status.json({
            code: 'e008',
            message: 'MATK not valid'
        })
    }
    console.log(req.MONEY)
    if (rows[0].SODU < req.body.MONEY) {
        return res.status(200).json({
            code: 'e008',
            message: 'not enough money'
        })

    }
    // console.log(rows2)
    amount = Number(rows[0].SODU) - Number(req.body.MONEY) * (Number(rows3[0].CHIETKHAU) / 100)
    // console.log(Number(rows2[0].SoDu) + Number(req.body.MONEY))
    console.log(amount)
    await pool.execute('update user set SODU=? where SDT=?', [Number(rows2[0].SoDu) + Number(req.body.MONEY), rows[0].SDT])
    await pool.execute('update tknganhang set SODU=? where MATK=?', [amount, req.body.MATK])
    m = moment()
    s = m.format("YYYY-MM-DD HH:mm:ss")
    await pool.execute('insert into giaodichnh(SDT,MATK,SOTIEN,LOAI,NGAYGD) values(?,?,?,?,?)',
        [rows[0].SDT, req.body.MATK, req.body.MONEY, 0, s])
    return res.status(200).json({
        code: 'e000',
        message: 'success'
    })
}
let sendmoney = async (req, res) => {
    const token = req.body.token
    if (!token) {
        return res.status(200).json({
            code: 'e005',
            message: 'token unqualified'
        })
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    [rows2, fields2] = await pool.execute('select * from user where SDT=?', [decoded.SDT]);
    [rows, fields] = await pool.execute('select * from tknganhang where MATK=?', [req.body.MATK]);
    [rows3, fields3] = await pool.execute('select * from nganhang where MANH=?', [rows[0].MANH])
    console.log(rows3[0])
    if (!rows) {
        return res.status.json({
            code: 'e008',
            message: 'MATK not valid'
        })
    }
    console.log(req.MONEY)
    if (rows2[0].SoDu < req.body.MONEY) {
        return res.status(200).json({
            code: 'e008',
            message: 'not enough money'
        })

    }
    // console.log(rows2)
    amount = Number(rows[0].SODU) + Number(req.body.MONEY)
    // console.log(Number(rows2[0].SoDu) + Number(req.body.MONEY))
    console.log(amount)
    await pool.execute('update user set SODU=? where SDT=?', [Number(rows2[0].SoDu) - Number(req.body.MONEY), rows[0].SDT])
    await pool.execute('update tknganhang set SODU=? where MATK=?', [amount, req.body.MATK])
    m = moment()
    s = m.format("YYYY-MM-DD HH:mm:ss")
    await pool.execute('insert into giaodichnh(SDT,MATK,SOTIEN,LOAI,NGAYGD) values(?,?,?,?,?)',
        [rows[0].SDT, req.body.MATK, req.body.MONEY, 1, s])
    return res.status(200).json({
        code: 'e000',
        message: 'success'
    })
}
module.exports = {
    getbankbyUser,
    linkbank,
    getmoney,
    sendmoney
}