const pool = require("../configs/connectDB");
const jwt = require("jsonwebtoken");
const moment = require("moment");
let getAllBanks = async (req, res) => {
  const [rows, fields] = await pool.execute("SELECT * FROM nganhang");
  return res.status(200).json({
    code: "e000",
    message: "success",
    data: rows,
  });
};
let getCardBankByUser = async (req, res) => {
  const token = req.body.token;
  if (!token) {
    return res.status(200).json({
      success: false,
      code: "e005",
      message: "token unqualified",
    });
  }
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const [rows, fields] = await pool.execute(
      "SELECT tknganhang.MATK,nganhang.MANH, nganhang.TENNH, nganhang.CHIETKHAU FROM nganhang inner join tknganhang on nganhang.MANH=tknganhang.MANH where SDT=?",
      [decoded.SDT]
    );
    return res.status(200).json({
      code: "e000",
      message: "success",
      data: rows,
    });
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return res.status(200).json({
        code: "e005",
        message: err,
        reLogin: true,
      });
    }
    return res.status(200).json({
      code: "e008",
      message: "bank error",
    });
  }
};
let linkbank = async (req, res) => {
  const token = req.body.token;
  if (!token) {
    return res.status(200).json({
      success: false,
      code: "e005",
      message: "token unqualified",
    });
  }
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    [row, user] = await pool.execute("select * from user where SDT=?", [
      decoded.SDT,
    ]);

    if (row[0].CCCD != req.body.CCCD) {
      return res.status(200).json({
        success: false,
        code: "e001",
        message: "Thông tin CCCD/CMND không hợp lệ!",
      });
    }

    if (
      row[0].HoTen.toLowerCase().localeCompare(req.body.HOTEN.toLowerCase()) !==
      0
    ) {
      return res.status(200).json({
        success: false,
        code: "e001",
        message: "Thông tin họ tên không hợp lệ!",
      });
    }
    await pool.execute(
      "insert into tknganhang(MATK,SODU,MANH,SDT,NGAYPHATHANH) values(?,?,?,?,?)",
      [
        req.body.MATK,
        50000000,
        req.body.MANH,
        decoded.SDT,
        req.body.NGAYPHATHANH,
      ]
    );
    return res.status(200).json({
      success: true,
      code: "e000",
      message: "success",
    });
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return res.status(200).json({
        code: "e005",
        message: err,
        reLogin: true,
      });
    }
    return res.status(200).json({
      success: false,
      code: err.sqlState,
      message: err.sqlMessage,
    });
  }
};
let getmoney = async (req, res) => {
  const token = req.body.token;
  if (!token) {
    return res.status(200).json({
      code: "e005",
      message: "token unqualified",
    });
  }

  const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  [rows2, fields2] = await pool.execute("select * from user where SDT=?", [
    decoded.SDT,
  ]);
  [rows, fields] = await pool.execute("select * from tknganhang where MATK=?", [
    req.body.MATK,
  ]);
  [rows3, fields3] = await pool.execute("select * from nganhang where MANH=?", [
    rows[0].MANH,
  ]);
  if (!rows) {
    return res.status.json({
      code: "e008",
      message: "Mã tài khoản không hợp lệ!",
    });
  }
  if (rows[0].SODU < req.body.MONEY) {
    return res.status(200).json({
      code: "e007",
      message: "Số dư trong tài khoản không đủ. Vui lòng nạp tiền để tiếp tục",
    });
  }
  amount =
    Number(rows[0].SODU) -
    Number(req.body.MONEY) * (Number(rows3[0].CHIETKHAU) / 100);
  await pool.execute("update user set SODU=? where SDT=?", [
    Number(rows2[0].SoDu) + Number(req.body.MONEY),
    rows[0].SDT,
  ]);
  await pool.execute("update tknganhang set SODU=? where MATK=?", [
    amount,
    req.body.MATK,
  ]);
  m = moment();
  s = m.format("YYYY-MM-DD HH:mm:ss");

  await pool.execute(
    "insert into giaodichnh(SDT,MATK,SOTIEN,LOAI,NGAYGD) values(?,?,?,?,?)",
    [rows[0].SDT, req.body.MATK, req.body.MONEY, 0, s]
  );
  return res.status(200).json({
    code: "e000",
    message: "success",
  });
};
let sendmoney = async (req, res) => {
  const token = req.body.token;
  if (!token) {
    return res.status(200).json({
      code: "e005",
      message: "token unqualified",
    });
  }

  const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  [rows2, fields2] = await pool.execute("select * from user where SDT=?", [
    decoded.SDT,
  ]);
  [rows, fields] = await pool.execute("select * from tknganhang where MATK=?", [
    req.body.MATK,
  ]);
  [rows3, fields3] = await pool.execute("select * from nganhang where MANH=?", [
    rows[0].MANH,
  ]);
  if (!rows) {
    return res.status.json({
      code: "e008",
      message: "Mã tài khoản không hợp lệ!",
    });
  }
  if (rows2[0].SoDu < req.body.MONEY) {
    return res.status(200).json({
      code: "e007",
      message: "Số tiền rút vượt quá số dư có trong ví",
    });
  }
  amount = Number(rows[0].SODU) + Number(req.body.MONEY);
  await pool.execute("update user set SODU=? where SDT=?", [
    Number(rows2[0].SoDu) - Number(req.body.MONEY),
    rows[0].SDT,
  ]);
  await pool.execute("update tknganhang set SODU=? where MATK=?", [
    amount,
    req.body.MATK,
  ]);
  m = moment();
  s = m.format("YYYY-MM-DD HH:mm:ss");
  await pool.execute(
    "insert into giaodichnh(SDT,MATK,SOTIEN,LOAI,NGAYGD) values(?,?,?,?,?)",
    [rows[0].SDT, req.body.MATK, req.body.MONEY, 1, s]
  );
  return res.status(200).json({
    code: "e000",
    message: "success",
  });
};
module.exports = {
  getAllBanks,
  getCardBankByUser,
  linkbank,
  getmoney,
  sendmoney,
};
