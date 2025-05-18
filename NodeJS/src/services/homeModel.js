import connectDB from "../configs/connectDB.js";
// Điều chỉnh hàm getFilteredOrders
const getFilteredOrders = async (year, month, day) => {
    let query = 'SELECT YEAR(ngaydat) AS year, MONTH(ngaydat) AS month, SUM(tonggia) AS totalRevenue FROM donhang WHERE trangthai = 2';
    const params = [];

    // Nếu có tham số năm, thêm vào câu lệnh SQL
    if (year) {
        query += ' AND YEAR(ngaydat) = ?';
        params.push(year);
    }

    // Nếu có tham số tháng, thêm vào câu lệnh SQL
    if (month) {
        query += ' AND MONTH(ngaydat) = ?';
        params.push(month);
    }

    // Nếu có tham số ngày, thêm vào câu lệnh SQL
    if (day) {
        query += ' AND DATE(ngaydat) = ?';
        params.push(day);
    }

    // Nhóm theo năm và tháng
    query += ' GROUP BY year, month ORDER BY year DESC, month DESC';

    console.log("SQL Query:", query);  // Log để kiểm tra câu lệnh SQL
    console.log("Params:", params);    // Log tham số truy vấn

    const [rows] = await connectDB.execute(query, params);
    return rows;
};

// Điều chỉnh hàm getOrderDataByMonth
const getOrderDataByMonth = async () => {
    const query = 'SELECT MONTH(ngaydat) AS month, SUM(tonggia) AS totalRevenue FROM donhang WHERE trangthai = 2 GROUP BY month ORDER BY month DESC';
    const [rows] = await connectDB.execute(query);
    return rows;
};

// Điều chỉnh hàm getOrderDataByYear
const getOrderDataByYear = async (year) => {
    const query = 'SELECT MONTH(ngaydat) AS month, SUM(tonggia) AS totalRevenue FROM donhang WHERE WHERE trangthai = 2 AND YEAR(ngaydat) = ? GROUP BY month ORDER BY month DESC';
    const [rows] = await connectDB.execute(query, [year]);
    return rows;
};


// Hàm lấy tổng số sản phẩm
const getTotalProducts = async () => {
    const query = 'SELECT COUNT(*) AS total FROM sach';
    const [rows] = await connectDB.execute(query);
    return rows[0].total;
};

// Hàm lấy tổng số đơn hàng
const getTotalOrders = async () => {
    const query = 'SELECT COUNT(*) AS total FROM donhang';
    const [rows] = await connectDB.execute(query);
    return rows[0].total;
};

// Hàm lấy tổng số người dùng
const getTotalUsers = async () => {
    const query = 'SELECT COUNT(*) AS total FROM nguoidung';
    const [rows] = await connectDB.execute(query);
    return rows[0].total;
};

// // Hàm lấy dữ liệu thống kê đơn hàng theo tháng
// const getOrderDataByMonth = async () => {
//     const query = 'SELECT MONTH(ngaydat) AS month, COUNT(*) AS totalOrders FROM donhang GROUP BY month ORDER BY month DESC';
//     const [rows] = await connectDB.execute(query);
//     return rows;
// };

// Hàm lấy các năm có trong đơn hàng
const getYears = async () => {
    const query = 'SELECT DISTINCT YEAR(ngaydat) AS year FROM donhang ORDER BY year DESC';
    const [rows] = await connectDB.execute(query);
    return rows.map(row => row.year);
};

// // Hàm lấy dữ liệu thống kê đơn hàng theo năm
// const getOrderDataByYear = async (year) => {
//     const query = 'SELECT MONTH(ngaydat) AS month, COUNT(*) AS totalOrders FROM donhang WHERE YEAR(ngaydat) = ? GROUP BY month ORDER BY month DESC';
//     const [rows] = await connectDB.execute(query, [year]);
//     return rows;
// };

export default {getTotalProducts, getTotalOrders, getTotalUsers, getOrderDataByMonth, getYears, getFilteredOrders, getOrderDataByYear};