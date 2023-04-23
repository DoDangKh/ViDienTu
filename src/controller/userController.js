pool = require("../configs/connectDB");
const jwt = require("jsonwebtoken");
const pool = require("../configs/connectDB");
let getUserByToken = async (req, res) => {
  console.log("get user by token");
  const token = req.body.token;
  if (!token) {
    return res.status(200).json({
      code: "e005",
      message: "token unqualified",
    });
  }

  const account = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

  const [user] = await pool.execute(
    "select * from account, user where  account.SDT = ? and user.SDT = ? and password = ?",
    [account.SDT, account.SDT, account.Password]
  );

  delete user[0].Password;

  return res.status(200).json({
    success: true,
    code: "e000",
    user: user[0],
  });
};

let getAlluser = async (req, res) => {
  const [rows, fields] = await pool.execute("SELECT * from user");
  return res.status(200).json({
    message: "e000",
    data: rows,
  });
};

let createNewUser = async (req, res) => {
  let { SDT, HO, TEN, CMND } = req.body;
  if (!SDT || !HO || !TEN || !CMND) {
    return res.status(200).json({
      message: "e001",
    });
  }

  await pool.execute("insert into user(SDT,HO,TEN,CMND) values(?,?,?,?)", [
    SDT,
    HO,
    TEN,
    CMND,
  ]);

  return res.status(200).json({
    message: "e000",
  });
};

let updateUser = async (req, res) => {
  const token = req.body.token
  if (!token) {
    return res.status(200).json({
      code: "e005",
      message: "token unqualified",
    });
  }
  const account = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  await pool.execute("UPDATE user SET HoTen=?,GioiTinh=?,CCCD=? WHERE SDT=? ", [req.body.HoTen, req.body.GioiTinh, req.body.CCCD, account.SDT])
  return res.status(200).json({
    code: "e000",
    message: "success"
  })
};

let deleteUser = async (req, res) => {
  let { SDT } = req.body;
  if (!SDT) {
    return res.status(200).json({
      message: "e001",
    });
  }
  await pool.execute("delete from user where SDT=?", [SDT]);
  return res.status(200).json({
    message: "e000",
  });
};


module.exports = {
  getAlluser,
  createNewUser,
  updateUser,
  deleteUser,
  getUserByToken,
};
