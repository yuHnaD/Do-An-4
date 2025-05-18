import connectDB from "../configs/connectDB.js";
// Lấy tất cả sản phẩm từ bảng sach
const getAllBooks = async () => {
    try {
        const query = `SELECT masach, tensach FROM sach`;
        const [rows] = await connectDB.execute(query); 
        return rows;
    } catch (error) {
        throw error;
    }
};

// // Lấy danh sách tất cả các phiếu nhập kho
// const getImportWarehouseList = async () => {
//     try {
//         const query = `SELECT * FROM nhapkho`;  // Lấy thông tin phiếu nhập kho
//         const [rows] = await connectDB.execute(query);
//         return rows;
//     } catch (error) {
//         throw error;
//     }
// };

// Lấy danh sách phiếu nhập kho với phân trang và tìm kiếm theo ngày
const getImportWarehouseList = async (limit, offset, searchDate) => {
    try {
        let query = `SELECT * FROM nhapkho`;  // Mặc định lấy tất cả các phiếu nhập kho

        if (searchDate) {
            query += ` WHERE DATE(ngaynhapkho) = ?`;  // Nếu có ngày tìm kiếm, lọc theo ngày
        }

        query += ` LIMIT ? OFFSET ?`;  // Thêm phân trang vào câu truy vấn

        const params = searchDate ? [searchDate, limit, offset] : [limit, offset];
        const [rows] = await connectDB.execute(query, params);
        return rows;
    } catch (error) {
        throw error;
    }
};

// Lấy tổng số phiếu nhập kho với ngày tìm kiếm (hoặc tất cả nếu không có ngày tìm kiếm)
const getTotalImportWarehouses = async (searchDate) => {
    try {
        let query = `SELECT COUNT(*) AS total FROM nhapkho`;  // Mặc định tính tổng số phiếu nhập kho

        if (searchDate) {
            query += ` WHERE DATE(ngaynhapkho) = ?`;  // Nếu có ngày tìm kiếm, lọc theo ngày
        }

        const [rows] = await connectDB.execute(query, [searchDate]);
        return rows[0].total;  // Trả về tổng số phiếu nhập kho
    } catch (error) {
        throw error;
    }
};

// Lấy chi tiết của một phiếu nhập kho
const getImportWarehouseDetails = async (manhapkho) => {
    try {
        const query = `SELECT ct.masach, s.tensach, ct.soluong, s.hinhanh 
                       FROM chitietnhapkho ct
                       JOIN sach s ON ct.masach = s.masach
                       WHERE ct.manhapkho = ?`;
        const [rows] = await connectDB.execute(query, [manhapkho]);
        return rows;
    } catch (error) {
        throw error;
    }
};

// Tìm sách theo từ khóa
const searchBooks = async (query) => {
    try {
        const sql = `SELECT masach, tensach, hinhanh FROM sach WHERE masach LIKE ? OR tensach LIKE ?`;
        const searchQuery = `%${query}%`;
        const [rows] = await connectDB.execute(sql, [searchQuery, searchQuery]);
        return rows;
    } catch (error) {
        throw error;
    }
};


// Thêm nhập kho mới vào bảng nhapkho
const addImportWarehouse = async (ngaynhapkho, ghichu) => {
    try {
        const query = `INSERT INTO nhapkho (ngaynhapkho, ghichu) VALUES (?, ?)`;
        const [result] = await connectDB.execute(query, [ngaynhapkho, ghichu]);

        if (!result || !result.insertId) {
            throw new Error('Không thể lấy mã nhập kho');
        }

        console.log('Mã nhập kho:', result.insertId);  // Log kết quả
        return result.insertId;  // Trả về manhapkho vừa thêm
    } catch (error) {
        console.error('Lỗi khi thêm nhập kho:', error.message);  // Log lỗi
        throw error;
    }
};

// Thêm chi tiết nhập kho vào bảng chitietnhapkho
const addImportWarehouseDetails = async (manhapkho, masach, soluong) => {
    try {
        // Kiểm tra masach và soluong trước khi truy vấn SQL
        if (masach === undefined || soluong === undefined || soluong <= 0) {
            throw new Error('Mã sách hoặc số lượng không hợp lệ');
        }
        const query = `INSERT INTO chitietnhapkho (manhapkho, masach, soluong) VALUES (?, ?, ?)`;
        await connectDB.execute(query, [manhapkho, masach, soluong]);
    } catch (error) {
        throw error;
    }
};
export default {getAllBooks, addImportWarehouse, addImportWarehouseDetails, searchBooks, getImportWarehouseList, getImportWarehouseDetails, getTotalImportWarehouses};
