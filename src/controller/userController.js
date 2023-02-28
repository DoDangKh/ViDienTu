pool = require('../configs/connectDB')




let getAlluser = async (req, res) => {

    const [rows, fields] = await pool.execute('SELECT * from user')
    return res.status(200).json({
        message: 'e000',
        data: rows
    })
}

let createNewUser = async (req, res) => {
    let { SDT, HO, TEN, CMND } = req.body
    if (!SDT || !HO || !TEN || !CMND) {
        return res.status(200).json({
            message: 'e001'
        })
    }

    await pool.execute('insert into user(SDT,HO,TEN,CMND) values(?,?,?,?)',
        [SDT, HO, TEN, CMND])

    return res.status(200).json(
        {
            message: 'e000'
        }
    )
}

module.exports = {
    getAlluser,
    createNewUser
}