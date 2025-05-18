import connectDB from "../configs/connectDB.js";

// Thêm đơn hàng mới vào bảng `donhang`
const insertOrder = async (order) => {
    const { userid, ngaydat, trangthai, tonggia, diachinhanhang } = order;
    const [result] = await connectDB.execute(
        `INSERT INTO donhang (manguoidung, ngaydat, trangthai, tonggia, diachinhanhang)
         VALUES (?, ?, ?, ?, ?)`,
        [userid, ngaydat, trangthai, tonggia, diachinhanhang]
    );
    return result.insertId; // Trả về mã đơn hàng vừa thêm
};

// Thêm chi tiết đơn hàng mới vào bảng `chitietdonhang`
const insertOrderDetails = async (orderDetails) => {
    const values = orderDetails.map(detail => `(${detail.madh}, ${detail.masach}, ${detail.gia}, ${detail.soluong})`).join(", ");
    const [result] = await connectDB.execute(
        `INSERT INTO chitietdonhang (madonhang, masach, gia, soluong) VALUES ${values}`
    );
    return result;
};

// Lấy danh sách đơn hàng theo `userid`
// const getOrdersByUserId = async (userid) => {
//     const [rows] = await connectDB.execute(
//         `SELECT * FROM donhang WHERE manguoidung = ? ORDER BY ngaydat DESC`,
//         [userid]
//     );
//     return rows;
// };
const getOrdersByUserId = async (userid) => {
    const [rows] = await connectDB.execute(
        `SELECT d.*, t.trangthai AS trangthai_thanhtoan, t.phuongthucthanhtoan
         FROM donhang d 
         LEFT JOIN thanhtoan t ON d.madonhang = t.madonhang 
         WHERE d.manguoidung = ? ORDER BY ngaydat ASC`,
        [userid]
    );
    return rows;
};

// Lấy chi tiết đơn hàng, bao gồm thông tin từ bảng `donhang` và các sản phẩm từ bảng `chitietdonhang`
// const getOrderDetails = async (madh) => {
//     const [rows] = await connectDB.execute(
//         `SELECT dh.madh, dh.userid, dh.ngaydat, dh.trangthai, dh.tonggia, dh.diachinhanhang, 
//                 ct.masp, ct.gia, ct.soluong, sp.ten, sp.hinhanh
//          FROM donhang dh
//          JOIN chitietdonhang ct ON dh.madh = ct.madh
//          JOIN sanpham sp ON ct.masp = sp.masp
//          WHERE dh.madh = ?`, 
//         [madh]
//     );
//     return rows;
// };

const getOrders = async (offset, limit, status) => {
    let sql = `
        SELECT 
            donhang.madonhang, 
            donhang.ngaydat, 
            donhang.tonggia, 
            donhang.trangthai, 
            nguoidung.tennguoidung AS nguoidat,
            thanhtoan.trangthai AS trangthai_thanhtoan
        FROM donhang
        LEFT JOIN nguoidung ON donhang.manguoidung = nguoidung.manguoidung
        LEFT JOIN thanhtoan ON donhang.madonhang = thanhtoan.madonhang
    `;
    let values = [];

    // Nếu có trạng thái, thêm điều kiện WHERE
    if (status) {
        sql += ' WHERE donhang.trangthai = ?';
        values.push(status);
    }

    // Thêm phân trang vào câu truy vấn
    sql += ' LIMIT ? OFFSET ?';
    values.push(limit, offset);

    try {
        const [rows] = await connectDB.execute(sql, values);

        // Lấy tổng số đơn hàng để tính số trang
        let countQuery = `
            SELECT COUNT(*) AS total
            FROM donhang
            JOIN nguoidung ON donhang.manguoidung = nguoidung.manguoidung
        `;
        if (status) {
            countQuery += ' WHERE donhang.trangthai = ?';
        }
        const [countResult] = await connectDB.execute(countQuery, status ? [status] : []);
        const count = countResult[0].total;

        return { rows, count }; // Trả về danh sách đơn hàng và tổng số đơn hàng
    } catch (error) {
        console.error('Lỗi trong getOrders:', error);
        throw error;
    }
};

// const getOrderDetails = async (madh) => {
//     const [rows] = await connectDB.execute(
//         `SELECT dh.madonhang, dh.ngaydat, dh.trangthai, dh.tonggia, dh.diachinhanhang, 
//                 u.tennguoidung AS nguoidat, u.email, 
//                 ct.masach, sp.tensach, sp.hinhanh, ct.gia, ct.soluong
//          FROM donhang dh
//          JOIN nguoidung u ON dh.manguoidung = u.manguoidung
//          JOIN chitietdonhang ct ON dh.madonhang = ct.madonhang
//          JOIN sach sp ON ct.masach = sp.masach
//          WHERE dh.madonhang = ?`,
//         [madh]
//     );
//     return rows;
// };

const getOrderDetails = async (madh) => {
    const [rows] = await connectDB.execute(
      `SELECT dh.madonhang, dh.ngaydat, dh.trangthai, dh.tonggia, dh.diachinhanhang, 
              u.tennguoidung AS nguoidat, u.email, 
              ct.masach, sp.tensach, sp.hinhanh, ct.gia, ct.soluong
       FROM donhang dh
       JOIN nguoidung u ON dh.manguoidung = u.manguoidung
       JOIN chitietdonhang ct ON dh.madonhang = ct.madonhang
       JOIN sach sp ON ct.masach = sp.masach
       WHERE dh.madonhang = ?`,
      [madh]
    );
    return rows;
  };
  
const updateOrderStatus = async (madh, status) => {
    const [result] = await connectDB.execute(
        `UPDATE donhang SET trangthai = ? WHERE madonhang = ?`,
        [status, madh]
    );
    return result.affectedRows > 0; // Trả về `true` nếu cập nhật thành công
};

//Xem chi tiết đơn hàng admin
const detailOrder = async (madh) => {
    const [rows] = await connectDB.execute(
        `SELECT * FROM donhang WHERE madonhang = ?`,
        [madh]
    );
    return rows[0]; // Trả về chi tiết đơn hàng (nếu có)
};

const getProductsInOrder = async (madh) => {
    const [rows] = await connectDB.execute(
        `SELECT sp.*, ct.soluong FROM sach sp 
         JOIN chitietdonhang ct ON sp.masach = ct.masach
         WHERE ct.madonhang = ?`,
        [madh]
    );
    return rows; // Trả về danh sách sản phẩm trong đơn hàng
};

// Thêm thông tin thanh toán vào bảng `thanh_toan`
const insertPayment = async (paymentData) => {
    const { madonhang, phuongthucthanhtoan, sotien, ngaythanhtoan, trangthai, magiaodichnganhang } = paymentData;
    const [result] = await connectDB.execute(
        `INSERT INTO thanhtoan (madonhang, phuongthucthanhtoan, sotien, ngaythanhtoan, trangthai, magiaodichnganhang)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [madonhang, phuongthucthanhtoan, sotien, ngaythanhtoan, trangthai, magiaodichnganhang]
    );
    return result.insertId;
};

// Cập nhật thông tin thanh toán trong bảng `thanh_toan`
const updatePayment = async (madh, paymentData) => {
    const { ngaythanhtoan, trangthai, magiaodichnganhang, sotien } = paymentData;
    const [result] = await connectDB.execute(
        `UPDATE thanhtoan SET ngaythanhtoan = ?, trangthai = ?, magiaodichnganhang = ?, sotien = ? WHERE madonhang = ?`,
        [ngaythanhtoan, trangthai, magiaodichnganhang, sotien || null, madh]
    );
    return result.affectedRows > 0;
};

const getOrderById = async (madh) => {
    const [rows] = await connectDB.execute(
        `SELECT * FROM donhang WHERE madonhang = ?`,
        [madh]
    );
    return rows[0]; // Trả về đơn hàng đầu tiên (nếu tồn tại)
};

export default {getOrderById, insertPayment, updatePayment, insertOrder, getOrdersByUserId, getOrderDetails, insertOrderDetails, getOrders, updateOrderStatus, detailOrder, getProductsInOrder}
