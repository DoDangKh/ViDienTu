const pool = require("../configs/connectDB");
const jwt = require("jsonwebtoken");
// const key = require('../configs/JWTconfigs')
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
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
  let mail = req.body.mail;
  console.log(mail);
  const [rows, fields] = await pool.execute(
    "SELECT * FROM account where mail=?",
    [mail]
  );
  if (rows.length == 0) {
    return res.status(404).json({
      code: "e001",
      message: "Email not true",
    });
  }
  // const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  // [rows, fields] = await pool.execute("SELECT * FROM account WHERE sdt=?", [decoded.SDT])
  password = Math.floor(Math.random() * 800000) + 100000;
  await pool.execute("UPDATE account SET password=? WHERE sdt=?", [
    password,
    rows[0].SDT,
  ]);
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    port: process.env.MAIL_PORT,
    secure: false,
    auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: true,
    },
  });
  console.log(rows[0]);
  const options = {
    from: "ViDienTu",
    to: rows[0].Mail,
    subject: "New Password",
    text: password.toString(),
  };
  transporter.sendMail(options);
  return res.status(200).json({
    message: "success",
  });
};
let Signup = async (req, res) => {
  let account = req.body;
  try {
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
      "Select * from user, account where (account.SDT=? or account.Mail=? or user.CCCD = ?) and account.SDT = user.SDT and status=1",
      [account.SDT, account.Mail, account.CCCD]
    );
    if (rows.length != 0) {
      if (rows[0].SDT == account.SDT)
        return res.status(200).json({
          success: false,
          code: "e002",
          message: "Số điện thoại (tài khoản) đã tồn tại!",
        });
      if (rows[0].CCCD == account.CCCD)
        return res.status(200).json({
          success: false,
          code: "e002",
          message: "CCCD đã tồn tại!",
        });
      if (rows[0].Mail == account.Mail)
        return res.status(200).json({
          success: false,
          code: "e002",
          message: "Email đã tồn tại!",
        });
    } else {
      await pool.execute(
        "insert into user(SDT,HoTen,GioiTinh,SoDu,CCCD) values(?,?,?,?,?)",
        [
          account.SDT,
          account.HoTen,
          parseInt(account.GioiTinh),
          0,
          account.CCCD,
        ]
      );
      await pool.execute(
        "insert into account(SDT,Mail,Password,Status) values(?,?,?,?)",
        [account.SDT, account.Mail, account.Password, 1]
      );
    }
    return res.status(200).json({
      success: true,
      code: "e000",
      message: "Đăng kí tài khoản thành công",
    });
  } catch (error) {
    console.log("error", error);
    return res.status(200).json({
      success: false,
      code: "e002",
      message: "Có lỗi trong quá trình thêm tài khoản",
    });
  }
};
let updateUser = async (req, res) => {
  let account = req.body;
  try {
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
      "Select * from user where SDT=?",
      [account.SDT]
    );
    if (rows.length == 0) {
      return res.status(200).json({
        success: false,
        code: "e002",
        message: "Không tìm thấy tài khoản với SDT này",
      });
    } else {
      await pool.execute(
        "update user set HoTen = ? ,GioiTinh = ? ,CCCD = ? where SDT = ?",
        [account.HoTen, parseInt(account.GioiTinh), account.CCCD, account.SDT]
      );
      await pool.execute(
        "update account set Mail = ? , Password = ? where SDT = ?",
        [account.Mail, account.Password, account.SDT]
      );
    }
    return res.status(200).json({
      success: true,
      code: "e000",
      message: "Cập nhật thông tin thành công",
    });
  } catch (error) {
    console.log("error", error);
    return res.status(200).json({
      success: false,
      code: "e002",
      message: "Có lỗi trong quá trình cập nhật tài khoản",
    });
  }
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
let getBalanceByUser = async (req, res) => {
  const token = req.body.token;
  if (!token) {
    return res.status(200).json({
      code: "e005",
      message: "token unqualified",
    });
  }
  const account = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  const [rows, fields] = await pool.execute(
    "Select SoDu from user where SDT=?",
    [account.SDT]
  );
  return res.status(200).json({
    balance: rows[0],
  });
};

module.exports = {
  updateUser,
  getAllAccount,
  Signup,
  login,
  forgetPassword,
  getBalanceByUser,
};
