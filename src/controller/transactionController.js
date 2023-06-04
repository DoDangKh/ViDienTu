const pool = require("../configs/connectDB");
const jwt = require("jsonwebtoken");
const moment = require("moment");
let getRefill = async (req, res) => {
  const token = req.body.token;
  if (!token) {
    return res.status(200).json({
      code: "e005",
      message: "token unqualified",
    });
  }
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const [rows2, fields2] = await pool.execute(
      "Select * from giaodichnh where SDT=? && LOAI=0",
      [decoded.SDT]
    );
    for (i of rows2) {
      const [rowsNH, fieldsNH] = await pool.execute(
        "Select TENNH from tknganhang,nganhang where tknganhang.MATK=? and tknganhang.MANH = nganhang.MANH",
        [i.MATK]
      );
      i.LoaiGD = "Refill";
      i.message = "Nạp tiền vào ví từ " + rowsNH[0].TENNH;
    }

    return res.status(200).json({
      success: true,
      code: "e000",
      data: sortTransactionByTime(rows2),
    });
  } catch (err) {
    return res.status(200).send("e006");
  }
};

let getWithdrawal = async (req, res) => {
  const token = req.body.token;
  if (!token) {
    return res.status(200).json({
      code: "e005",
      message: "token unqualified",
    });
  }
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const [rows2, fields2] = await pool.execute(
      "Select * from giaodichnh where SDT=? && LOAI=1",
      [decoded.SDT]
    );
    for (i of rows2) {
      const [rowsNH, fieldsNH] = await pool.execute(
        "Select TENNH from tknganhang,nganhang where tknganhang.MATK=? and tknganhang.MANH = nganhang.MANH",
        [i.MATK]
      );
      i.LoaiGD = "Withdrawal";
      i.message = "Rút tiền từ ví về " + rowsNH[0].TENNH;
    }
    return res.status(200).json({
      success: true,
      code: "e000",
      data: sortTransactionByTime(rows2),
    });
  } catch (err) {
    console.log(err.message);
    return res.status(200).send("e006");
  }
};

let getSend = async (req, res) => {
  const token = req.body.token;
  if (!token) {
    return res.status(200).json({
      code: "e005",
      message: "token unqualified",
    });
  }
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const [rows, fields] = await pool.execute(
      "Select * from giaodich where SDT1=?",
      [decoded.SDT]
    );

    for (i of rows) {
      const [rowsHT, fieldsHT] = await pool.execute(
        "Select HoTen from user where SDT=?",
        [i.SDT2]
      );
      i.LoaiGD = "Send";
      i.message = "Chuyển tiền đến " + rowsHT[0].HoTen;
    }

    return res.status(200).json({
      success: true,
      code: "e000",
      data: sortTransactionByTime(rows),
    });
  } catch (err) {
    console.log(err.message);
    return res.status(200).send("e006");
  }
};
let getreceive = async (req, res) => {
  const token = req.body.token;
  if (!token) {
    return res.status(200).json({
      code: "e005",
      message: "token unqualified",
    });
  }
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const [rows, fields] = await pool.execute(
      "Select * from giaodich where SDT2=?",
      [decoded.SDT]
    );

    for (i of rows) {
      const [rowsHT, fieldsHT] = await pool.execute(
        "Select HoTen from user where SDT=?",
        [i.SDT1]
      );
      i.LoaiGD = "Receive";
      i.message = "Nhận tiền từ " + rowsHT[0].HoTen;
    }

    return res.status(200).json({
      success: true,
      code: "e000",
      data: sortTransactionByTime(rows),
    });
  } catch (err) {
    console.log(err.message);
    return res.status(200).send("e006");
  }
};
let transfer = async (req, res) => {
  // datetime = new Date().toISOString({ timeZone: "America/New_York" }).slice(0, 19).replace('T', ' ');

  const token = req.body.token;
  if (!token) {
    return res.status(200).json({
      code: "e005",
      message: "token unqualified",
    });
  }
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    amount = Number(req.body.STGD);
    sdt = req.body.SDT;
    loiNhan = req.body.loiNhan;

    if (sdt === decoded.SDT) {
      return res.status(200).json({
        code: "e007",
        message:
          "Số điện thoại bạn đang dùng. Không thể chuyển tiền cho chính bạn!",
      });
    }

    const [rows2, fields2] = await pool.execute(
      "Select SoDu from user where SDT=?",
      [sdt]
    );

    if (rows2.length <= 0) {
      return res.status(200).json({
        code: "e007",
        message: "Số điện thoại người nhận hiện chưa đăng kí ViDienTu!",
      });
    }

    m = moment();
    s = m.format("YYYY-MM-DD HH:mm:ss");
    await pool.execute(
      "insert into giaodich(SDT1,SDT2,STGD,NGAYGD,CHIETKHAU, loiNhan) values(?,?,?,?,?,?)",
      [decoded.SDT, sdt, amount, s, (5 / 100) * amount, loiNhan]
    );
    const [rows1, fields1] = await pool.execute(
      "Select SoDu from user where SDT=?",
      [decoded.SDT]
    );

    wallet1 = Number(rows1[0].SoDu - amount - (5 / 100) * amount);
    wallet2 = Number(rows2[0].SoDu + amount);
    if (wallet1 < 0) {
      return res.status(200).json({
        success: false,
        code: "e007",
        message: "Tài khoản không đủ tiền. Vui lòng  nạp tiền để tiếp tục!",
      });
    }
    await pool.execute("update user set SoDu=? where SDT=?", [
      wallet1,
      decoded.SDT,
    ]);
    await pool.execute("update user set SoDu=? where SDT=?", [wallet2, sdt]);

    [rowTrans, fieldsTrans] = await pool.execute("select * from giaodich");

    const [rowsUser, fieldsUser] = await pool.execute(
      "Select * from user where SDT=?",
      [sdt]
    );
    return res.status(200).json({
      success: true,
      code: "e000",
      message: "Giao dịch thành công!",
      MaGiaoDich: rowTrans[rowTrans.length - 1].MAGD,
      soDu: wallet1,
      user: rowsUser[0],
    });
  } catch (err) {
    console.log(err);
    return res.status(200).json({
      success: false,
      code: "e006",
    });
  }
};
let getallTransaction = async (req, res) => {
  const token = req.body.token;
  if (!token) {
    return res.status(200).json({
      code: "e005",
      message: "token unqualified",
    });
  }
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const [rows, fields] = await pool.execute(
      "Select * from giaodich where SDT2=? or SDT1=?",
      [decoded.SDT, decoded.SDT]
    );
    const [rows2, fields2] = await pool.execute(
      "Select * from giaodichnh where SDT=?",
      [decoded.SDT]
    );
    for (i of rows) {
      const [rowsHT, fieldsHT] = await pool.execute(
        "Select HoTen from user where SDT=?",
        [i.SDT2]
      );
      if (i.SDT1 == decoded.SDT) {
        //gửi tiền
        i.LoaiGD = "Send";
        i.message = "Chuyển tiền đến " + rowsHT[0].HoTen;
      } else if (i.SDT2 == decoded.SDT) {
        //nhaapnj tièn
        i.LoaiGD = "Receive";
        i.message = "Nhận tiền từ " + rowsHT[0].HoTen;
      }
    }
    for (i of rows2) {
      const [rowsNH, fieldsNH] = await pool.execute(
        "Select TENNH from tknganhang,nganhang where tknganhang.MATK=? and tknganhang.MANH = nganhang.MANH",
        [i.MATK]
      );
      if (i.LOAI == 0) {
        //nạp tiền
        i.LoaiGD = "Refill";
        i.message = "Nạp tiền vào ví từ " + rowsNH[0].TENNH;
      } else if (i.LOAI == 1) {
        //rút tiền
        i.LoaiGD = "Withdrawal";
        i.message = "Rút tiền từ ví về " + rowsNH[0].TENNH;
      }
    }

    return res.status(200).json({
      success: true,
      code: "e000",
      data: rows.concat(rows2),
    });
  } catch (err) {
    console.log(err.message);
    return res.status(200).send("e006");
  }
};

let getallTransactionFiltered = async (req, res) => {
  const token = req.body.token;
  if (!token) {
    return res.status(200).json({
      code: "e005",
      message: "token unqualified",
    });
  }
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const [rows, fields] = await pool.execute(
      "Select * from giaodich where SDT2=? or SDT1=?",
      [decoded.SDT, decoded.SDT]
    );
    const [rows2, fields2] = await pool.execute(
      "Select * from giaodichnh where SDT=?",
      [decoded.SDT]
    );
    for (i of rows) {
      const [rowsHT, fieldsHT] = await pool.execute(
        "Select HoTen from user where SDT=?",
        [i.SDT2]
      );
      if (i.SDT1 == decoded.SDT) {
        //gửi tiền
        i.LoaiGD = "Send";
        i.message = "Chuyển tiền đến " + rowsHT[0].HoTen;
      } else if (i.SDT2 == decoded.SDT) {
        //nhaapnj tièn
        i.LoaiGD = "Receive";
        i.message = "Nhận tiền từ " + rowsHT[0].HoTen;
      }
    }
    for (i of rows2) {
      const [rowsNH, fieldsNH] = await pool.execute(
        "Select TENNH from tknganhang,nganhang where tknganhang.MATK=? and tknganhang.MANH = nganhang.MANH",
        [i.MATK]
      );
      if (i.LOAI == 0) {
        //nạp tiền
        i.LoaiGD = "Refill";
        i.message = "Nạp tiền vào ví từ " + rowsNH[0].TENNH;
      } else if (i.LOAI == 1) {
        //rút tiền
        i.LoaiGD = "Withdrawal";
        i.message = "Rút tiền từ ví về " + rowsNH[0].TENNH;
      }
    }
    list = rows.concat(rows2);

    return res.status(200).json({
      success: true,
      code: "e000",
      data: sortTransactionByTime(list),
    });
  } catch (err) {
    console.log(err.message);
    return res.status(200).send("e006");
  }
};
sortTransactionByTime = (list) => {
  list.sort(function (a, b) {
    var KeyA = JSON.stringify(a.NGAYGD);
    var KeyB = JSON.stringify(b.NGAYGD);
    if (KeyA > KeyB) return -1;
    if (KeyB > KeyA) return 1;
    return 0;
  });
  var finallist = {};
  for (const element of list) {
    //format ngày
    m = moment(element.NGAYGD);
    s = m.format("MM/YYYY");

    // console.log(JSON.stringify(element.NGAYGD).substring(1, 8));
    if (s in finallist == false) {
      finallist[s] = [element];
    } else {
      finallist[s].push(element);
    }
  }
  return finallist;
};

//get list user đã từng chuyển tiền cho SDT này
let getAllUserTransfered = async (req, res) => {
  const token = req.body.token;
  if (!token) {
    return res.status(200).json({
      code: "e005",
      message: "token unqualified",
    });
  }
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const [rows, fields] = await pool.execute(
      "Select * from giaodich where SDT1=? || SDT2=?",
      [decoded.SDT, decoded.SDT]
    );
    const listUser = [];
    for (let index = 0; index < rows.length; index++) {
      const element = rows[index];
      const [rows1, fields1] = await pool.execute(
        "Select * from user where SDT=? and idrole = 2",
        [element.SDT2]
      );
      if (rows1 && rows1.length > 0)
        if (listUser.filter((val) => val.SDT == rows1[0].SDT).length <= 0)
          listUser.push(rows1[0]);
    }
    return res.status(200).json({
      success: true,
      code: "e000",
      data: listUser,
    });
  } catch (err) {
    console.log(err);
    return res.status(200).json({
      success: false,
      code: "e006",
    });
  }
};
let getLatestTransInfoByUser = async (req, res) => {
  const token = req.body.token;
  if (!token) {
    return res.status(200).json({
      code: "e005",
      message: "token unqualified",
    });
  }
  try {
    const account = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    [transRows, _] = await pool.execute(
      "SELECT CONVERT_TZ(NGAYGD, '+00:00', '+07:00') AS NGAYGD, MAGD, STGD FROM GIAODICH WHERE NGAYGD = (SELECT MAX(NGAYGD) FROM GIAODICH) AND SDT1 = ?;",
      [account.SDT]
    );
    [bankTransRow, _] = await pool.execute(
      "SELECT CONVERT_TZ(NGAYGD, '+00:00', '+07:00') AS NGAYGDNH, MAGDNH, SOTIEN FROM GIAODICHNH WHERE NGAYGD = (SELECT MAX(NGAYGD) FROM GIAODICHNH) AND SDT = ?",
      [account.SDT]
    );

    if (!(transRows.length && bankTransRow.length)) {
      if (transRows.length) {
        return res.status(200).json({
          time: transRows[0].NGAYGD,
          transId: transRows[0].MAGD,
          amount: transRows[0].STGD,
        });
      } else {
        return res.status(200).json({
          time: bankTransRow[0].NGAYGDNH,
          transId: bankTransRow[0].MAGDNH,
          amount: bankTransRow[0].SOTIEN,
        });
      }
    }

    const transDate = new Date(transRows[0].NGAYGD);
    const bankDate = new Date(bankTransRow[0].NGAYGDNH);
    if (transDate > bankDate) {
      return res.status(200).json({
        time: transRows[0].NGAYGD,
        transId: transRows[0].MAGD,
        amount: transRows[0].STGD,
      });
    } else {
      return res.status(200).json({
        time: bankTransRow[0].NGAYGDNH,
        transId: bankTransRow[0].MAGDNH,
        amount: bankTransRow[0].SOTIEN,
      });
    }
  } catch (err) {
    return res.status(200).json({
      success: false,
      code: "e006",
      err: err.message,
    });
  }
};

module.exports = {
  getRefill,
  getWithdrawal,
  getSend,
  getreceive,
  transfer,
  getallTransaction,
  getallTransactionFiltered,
  getAllUserTransfered,
  getLatestTransInfoByUser,
};
