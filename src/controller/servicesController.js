// pool = require("../configs/connectDB");
const jwt = require("jsonwebtoken");
const pool = require("../configs/connectDB");
const moment = require("moment");
let getAllTypeServices = async (req, res) => {
  const [rows, fields] = await pool.execute("SELECT * FROM loaidichvu");
  return res.status(200).json({
    code: "e000",
    message: "success",
    data: rows,
  });
};
let getAllServices = async (req, res) => {
  let { SDT, token } = req.body;
  try {
    if (token) {
      const account = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      SDT = account.SDT;
    }

    const [rows, fields] = await pool.execute(
      "SELECT * FROM dichvu, loaidichvu where  dichvu.SDT = ? and dichvu.trangThai = 0 and dichvu.idLoaiDV = loaidichvu.idLoaiDV",
      [SDT]
    );
    return res.status(200).json({
      code: "e000",
      message: "success",
      data: rows.reverse(),
    });
  } catch (error) {}
};
let getAllServicesByUser = async (req, res) => {
  console.log("Cdcsvdvjh");
  let { SDT, token } = req.body;
  try {
    if (token) {
      const account = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      SDT = account.SDT;
    }

    const [rows, fields] = await pool.execute(
      "SELECT * FROM dichvu, loaidichvu where  dichvu.SDT = ? and dichvu.idLoaiDV = loaidichvu.idLoaiDV",
      [SDT]
    );
    return res.status(200).json({
      code: "e000",
      message: "success",
      data: rows.reverse(),
    });
  } catch (error) {
    console.log(error);
  }
};

let getAllServicesMn = async (req, res) => {
  const [rows, fields] = await pool.execute(
    "SELECT * FROM dichvu, loaidichvu where dichvu.idLoaiDV = loaidichvu.idLoaiDV"
  );
  return res.status(200).json({
    code: "e000",
    message: "success",
    data: rows,
  });
};
let createTypeService = async (req, res) => {
  // idLoaiDV, tenLoaiDV
  let { tenLoaiDV } = req.body;
  if (!tenLoaiDV) {
    return res.status(200).json({
      status: false,
      message: "Thông tin chưa đầy đủ!",
    });
  }

  try {
    await pool.execute("insert into loaidichvu(tenLoaiDV) values(?)", [
      tenLoaiDV,
    ]);
    return res.status(200).json({
      status: true,
      message: "Thêm loại dịch vụ thành công!",
    });
  } catch (error) {
    return res.status(200).json({
      status: false,
      message: "Thêm loại dịch vụ thất bại!",
    });
  }
};
let createService = async (req, res) => {
  // idDV, idLoaiDV, thanhTien, SDT, ngayNhap, hanDong, trangThai, ghiChu
  let { idLoaiDV, thanhTien, SDT, hanDong, ghiChu } = req.body;
  m = moment();
  ngayNhap = m.format("YYYY-MM-DD HH:mm:ss");
  hd = moment(hanDong);
  hanDong = m.format("YYYY-MM-DD HH:mm:ss");
  if (!idLoaiDV || !SDT || !ngayNhap || !hanDong) {
    return res.status(200).json({
      status: false,
      message: "Thông tin chưa đầy đủ!",
    });
  }

  try {
    await pool.execute(
      "insert into dichvu(idLoaiDV, thanhTien, SDT, ngayNhap, hanDong, trangThai, ghiChu) values(?,?,?,?,?,?,?)",
      [idLoaiDV, thanhTien, SDT, ngayNhap, hanDong, 0, ghiChu]
    );
    return res.status(200).json({
      status: true,
      message: "Thêm dịch vụ thành công!",
    });
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      status: false,
      message: "Thêm dịch vụ thất bại!",
    });
  }
};
let updateService = async (req, res) => {
  // idDV, idLoaiDV, thanhTien, SDT, ngayNhap, hanDong, trangThai, ghiChu
  let { idDV, idLoaiDV, thanhTien, SDT, hanDong, ghiChu, trangThai } = req.body;
  m = moment();
  ngayNhap = m.format("YYYY-MM-DD HH:mm:ss");
  hd = moment(hanDong);
  hanDong = m.format("YYYY-MM-DD HH:mm:ss");
  if (!idLoaiDV || !SDT || !ngayNhap || !hanDong) {
    return res.status(200).json({
      status: false,
      message: "Thông tin chưa đầy đủ!",
    });
  }

  try {
    await pool.execute(
      "update dichvu set idLoaiDV = ?, thanhTien = ?, SDT = ?, ngayNhap = ?, hanDong = ?, trangThai = ?, ghiChu = ?, ngayDong = null where idDV  = ?",
      [idLoaiDV, thanhTien, SDT, ngayNhap, hanDong, trangThai, ghiChu, idDV]
    );
    return res.status(200).json({
      status: true,
      message: "Sửa dịch vụ thành công!",
    });
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      status: false,
      message: "Sửa dịch vụ thất bại!",
    });
  }
};
let deleteService = async (req, res) => {
  // idDV, idLoaiDV, thanhTien, SDT, ngayNhap, hanDong, trangThai, ghiChu
  let { idDV } = req.body;

  try {
    await pool.execute("DELETE FROM dichvu WHERE idDV  = ?", [idDV]);
    return res.status(200).json({
      status: true,
      message: "Xóa dịch vụ thành công!",
    });
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      status: false,
      message: "Xóa dịch vụ thất bại!",
    });
  }
};

let payService = async (req, res) => {
  // idDV, idLoaiDV, thanhTien, SDT, ngayNhap, hanDong, trangThai, ghiChu
  let { idDV, SDT, token } = req.body;

  if (token) {
    const account = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    SDT = account.SDT;
  }

  try {
    m = moment();
    s = m.format("YYYY-MM-DD HH:mm:ss");
    const [rows1, fields1] = await pool.execute(
      "Select * from dichvu where idDV=? and SDT = ?",
      [idDV, SDT]
    );

    const [rows2, fields2] = await pool.execute(
      "Select SoDu from user where SDT=?",
      [SDT]
    );
    if (rows2.length <= 0) {
      return res.status(200).json({
        status: false,
        code: "e007",
        message: "Số điện thoại người nhận hiện chưa đăng kí ViDienTu!",
      });
    }

    if (rows1.length <= 0) {
      return res.status(200).json({
        status: false,
        code: "e007",
        message: "Dịch vụ không tồn tại!",
      });
    }

    if (rows1[0].trangThai == 1) {
      return res.status(200).json({
        status: false,
        code: "e007",
        message: "Dịch vụ đã được thanh toán!",
      });
    }
    const amount = rows1[0].thanhTien;
    wallet1 = Number(rows2[0].SoDu - amount);

    if (wallet1 < 0) {
      return res.status(200).json({
        success: false,
        code: "e007",
        message: "Tài khoản không đủ tiền. Vui lòng  nạp tiền để tiếp tục!",
      });
    }
    await pool.execute("update user set SoDu=? where SDT=?", [wallet1, SDT]);

    await pool.execute(
      "update dichvu set trangThai = ?, ngayDong = ? where idDV  = ?",
      [1, s, idDV]
    );

    return res.status(200).json({
      status: true,
      message: "Thanh toán dịch vụ thành công!",
      ngayThanhToan: s,
      soDuSauThanhToan: wallet1,
    });
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      status: false,
      message: "Thanh toán dịch vụ thất bại!",
    });
  }
};
let getAllServicesOver = async (req, res) => {
  let { SDT, token } = req.body;
  if (token) {
    const account = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    SDT = account.SDT;
  }

  const [rows, fields] = await pool.execute(
    "SELECT * FROM dichvu, loaidichvu where dichvu.SDT = ? and dichvu.idLoaiDV = loaidichvu.idLoaiDV",
    [SDT]
  );
  return res.status(200).json({
    code: "e000",
    message: "success",
    data: rows,
  });
};

module.exports = {
  getAllTypeServices,
  getAllServices,
  getAllServicesMn,
  createTypeService,
  createService,
  updateService,
  deleteService,
  payService,
  getAllServicesByUser,
  getAllServicesOver,
};
