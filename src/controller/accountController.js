const pool = require("../configs/connectDB");
const jwt = require("jsonwebtoken");
// const key = require('../configs/JWTconfigs')
const dotenv = require("dotenv");
dotenv.config();
let getAllAccount = async (req, res) => {
  const [rows, fields] = await pool.execute("Select * from account");
  return res.status(200).json({
    code: "e000",
    data: rows,
  });
};

let Signup = async (req, res) => {
  console.log("dang ky");
  let account = req.body;
  console.log(account);
  if (
    !account.SDT ||
    !account.Mail ||
    !account.Password ||
    !account.HoTen ||
    !account.GioiTinh
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
  await pool.execute("insert into user(SDT,HoTen,GioiTinh) values(?,?,?)", [
    account.SDT,
    account.HoTen,
    parseInt(account.GioiTinh),
  ]);
  await pool.execute(
    "insert into account(SDT,Mail,Password,Status,SoDu) values(?,?,?,?,?)",
    [account.SDT, account.Mail, account.Password, 1, 0]
  );

  return res.status(200).json({
    success: true,
    code: "e000",
    message: "Đăng kí tài khoản thành công",
  });
};
let login = async (req, res) => {
  let account = req.body;
  console.log(account);
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
    expiresIn: "30m",
  });

  const [user] = await pool.execute(
    "select * from account, user where  account.SDT = ? and user.SDT = ? and password = ?",
    [account.SDT, account.SDT, account.Password]
  );

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
};
