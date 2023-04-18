const pool = require("../configs/connectDB");
const jwt = require("jsonwebtoken");
// const key = require('../configs/JWTconfigs')
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer")
// const math = require('Math')
dotenv.config();
let getAllAccount = async (req, res) => {
  const [rows, fields] = await pool.execute("Select * from account");
  return res.status(200).json({
    code: "e000",
    data: rows,
  });
};
let forgetPassword = async (req, res) => {
  const token = req.body.token
  if (!token) {
    return res.status(200).json({
      code: "e005",
      message: "token is unqualified"
    })
  }
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    [rows, fields] = await pool.execute("SELECT * FROM account WHERE sdt=?", [decoded.SDT])
    password = Math.floor(Math.random() * 800000) + 100000
    await pool.execute("UPDATE account SET password=? WHERE sdt=?", [password, decoded.SDT])
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      port: process.env.MAIL_PORT,
      secure: false,
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: true
      }
    })
    console.log(rows[0])
    const options = {
      from: 'ViDienTu',
      to: rows[0].Mail,
      subject: 'New Password',
      text: password.toString()
    }
    transporter.sendMail(options)
    return res.status(200).json({
      message: 'success'
    })
  }
  catch (err) {

  }

}
let Signup = async (req, res) => {
  let account = req.body;
  if (
    !account.SDT ||
    !account.Mail ||
    !account.Password ||
    !account.HoTen ||
    !account.GioiTinh ||
    !account.CCCD
  ) {
    return res.status(200).json({
      success: false,
      code: "e001",
      message: "Vui lòng điền đầy đủ thông tin",
    });
  }

  const [rows, fields] = await pool.execute(
    "Select * from account where SDT=? and status=1",
    [account.SDT]
  );
  if (rows.length != 0) {
    return res.status(200).json({
      success: false,
      code: "e002",
      message: "Số điện thoại (tài khoản) đã tồn tại!",
    });
  }
  await pool.execute(
    "insert into user(SDT,HoTen,GioiTinh,SoDu,CCCD) values(?,?,?,?,?)",
    [account.SDT, account.HoTen, parseInt(account.GioiTinh), 0, account.CCCD]
  );
  await pool.execute(
    "insert into account(SDT,Mail,Password,Status) values(?,?,?,?)",
    [account.SDT, account.Mail, account.Password, 1]
  );

  return res.status(200).json({
    success: true,
    code: "e000",
    message: "Đăng kí tài khoản thành công",
  });
};
let login = async (req, res) => {
  let account = req.body;
  const [rows, fields] = await pool.execute(
    "select * from account where  SDT = ? and password = ?",
    [account.SDT, account.Password]
  );

  if (Object.keys(rows).length == 0) {
    return res.status(200).json({
      success: false,
      code: "e003",
      message: "Số điện thoại hoặc mật khẩu không hợp lệ!",
    });
  }
  console.log(process.env.ACCESS_TOKEN_SECRET);
  const token = jwt.sign(account, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "1d",
  });

  const [user] = await pool.execute(
    "select * from account, user where  account.SDT = ? and user.SDT = ? and password = ?",
    [account.SDT, account.SDT, account.Password]
  );

  delete user[0].Password;

  return res.status(200).json({
    success: true,
    code: "e000",
    message: "Đăng nhập thành công!",
    token,
    user: user[0],
  });
};

module.exports = {
  getAllAccount,
  Signup,
  login,
  forgetPassword,
};
