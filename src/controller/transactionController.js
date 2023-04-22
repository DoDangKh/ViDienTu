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
      data: rows2,
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
      data: rows2,
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
      data: rows,
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
      data: rows,
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
    return res.status(200).json({
      success: true,
      code: "e000",
      message: "Giao dịch thành công!",
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
    list = rows.concat(rows2)
    list.sort(function (a, b) {
      var KeyA = JSON.stringify(a.NGAYGD)
      var KeyB = JSON.stringify(b.NGAYGD)
      if (KeyA > KeyB) return -1
      if (KeyB > KeyA) return 1
      return 0
    })
    var finallist = {}
    time = JSON.stringify(list[0].NGAYGD).substring(1, 8)
    for (const element of list) {
      console.log(JSON.stringify(element.NGAYGD).substring(1, 8))
      console.log(typeof (element))
      if (JSON.stringify(element.NGAYGD).substring(1, 8) in finallist == false) {
        console.log('case 1')
        finallist[JSON.stringify(element.NGAYGD).substring(1, 8)] = [element]
      }
      else {
        finallist[JSON.stringify(element.NGAYGD).substring(1, 8)].push(element)
      }
    }
    console.log(finallist)
    return res.status(200).json({
      success: true,
      code: "e000",
      data: finallist,
    });
  } catch (err) {
    console.log(err.message);
    return res.status(200).send("e006");
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
};
