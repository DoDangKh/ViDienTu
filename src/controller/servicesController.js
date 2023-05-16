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
      "update dichvu set idLoaiDV = ?, thanhTien = ?, SDT = ?, ngayNhap = ?, hanDong = ?, trangThai = ?, ghiChu = ?) where idDV  = ?",
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
module.exports = {
  getAllTypeServices,
  getAllServices,
  createTypeService,
  createService,
  updateService,
  deleteService,
};
