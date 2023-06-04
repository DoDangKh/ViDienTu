// pool = require("../configs/connectDB");
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

let searchUser = async (req, res) => {
  let { kwSDT, kwHoTen } = req.body;
  let query = "";
  if (kwSDT && kwHoTen) {
    query = `SELECT * from user, account where user.SDT = account.SDT and user.HoTen like '%${kwHoTen}%' and user.SDT like '%${kwSDT}%'`;
  } else if (kwHoTen) {
    query = `SELECT * from user, account where user.SDT = account.SDT and user.HoTen like '%${kwHoTen}%'`;
  } else if (kwSDT) {
    query = `SELECT * from user, account where user.SDT = account.SDT and user.SDT like '%${kwSDT}%'`;
  } else {
    query = `SELECT * from user, account where user.SDT = account.SDT`;
  }
  const [rows, fields] = await pool.execute(query);
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
  let { SDT, HO, TEN, CMND } = req.body;
  if (!SDT || !HO || !TEN || !CMND) {
    return res.status(200).json({
      message: "e001",
    });
  }
  await pool.execute("update user set HO=?, TEN=?, CMND=? where SDT=?", [
    HO,
    TEN,
    CMND,
    SDT,
  ]);
  return res.status(200).json({
    message: "e000",
  });
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
let updateUserAndroid = async (req, res) => {
  let token = req.body.token;
  let { GioiTinh, Email } = req.body;
  if (!GioiTinh || !Email) {
    return res.status(200).json({
      code: "e001",
    });
  }

  try {
    const account = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    let SDT = account.SDT;
    await pool.execute("update user set GioiTinh=? where SDT=?", [
      GioiTinh,
      SDT,
    ]);
    await pool.execute("update account set Mail=? where SDT=?", [Email, SDT]);
  } catch (err) {
    return res.status(200).json({
      code: "e005",
      error: err.message,
    });
  }

  return res.status(200).json({
    code: "e000",
  });
};
let getUserNameByPhoneNum = async (req, res) => {
  let SDT = req.query.SDT;
  if (!SDT) {
    return res.status(200).json({
      message: "e001",
    });
  }
  [rows, _] = await pool.execute("select HoTen from user where SDT=?", [SDT]);
  return res.status(200).json({
    message: "e000",
    userName: rows[0] ? rows[0].HoTen : "",
  });
};

module.exports = {
  getAlluser,
  createNewUser,
  updateUser,
  deleteUser,
  getUserByToken,
  searchUser,
  updateUserAndroid,
  getUserNameByPhoneNum,
};
