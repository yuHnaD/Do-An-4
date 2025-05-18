import connectDB from "../configs/connectDB.js";
import bcrypt from 'bcrypt';

const getAllUser = async (offset, limit, query, role) => {
    let sql = 'SELECT * FROM `nguoidung`';
    let values = [];

    // Nếu có từ khóa tìm kiếm, ta thêm điều kiện WHERE vào câu truy vấn
    if (query && query.trim()) {
        sql += ' WHERE (`tentaikhoan` LIKE ? OR `tennguoidung` LIKE ?)';
        values.push(`%${query}%`, `%${query}%`);
    }

    // Nếu có vai trò (role), thêm điều kiện lọc theo vai trò
    if (role) {
        if (query && query.trim()) {
            sql += ' AND `role` = ?';
        } else {
            sql += ' WHERE `role` = ?';
        }
        values.push(role);
    }

    // Thêm phân trang vào câu truy vấn
    sql += ' LIMIT ? OFFSET ?';
    values.push(limit, offset);

    try {
        // Thực thi câu truy vấn với phân trang và tìm kiếm
        const [rows] = await connectDB.execute(sql, values);
        
        // Lấy tổng số người dùng để tính số trang
        let countQuery = 'SELECT COUNT(*) AS total FROM `nguoidung`';
        let countValues = [];

        if (query && query.trim()) {
            countQuery += ' WHERE `tentaikhoan` LIKE ? OR `tennguoidung` LIKE ?';
            countValues.push(`%${query}%`, `%${query}%`);
        }

        if (role) {
            countQuery += countValues.length > 0 ? ' AND `role` = ?' : ' WHERE `role` = ?';
            countValues.push(role);
        }

        const [countResult] = await connectDB.execute(countQuery, countValues);
        const count = countResult[0].total;

        return { rows, count }; // Trả về danh sách người dùng và tổng số người dùng
    } catch (error) {
        console.error('Lỗi khi lấy người dùng với phân trang:', error);
        throw error;
    }
};
// const createNewUser = async (userData) => {
//     const { username, password, fullname, address, sex, email } = userData; // Lấy thông tin từ userData
//     const [rows] = await connectDB.execute(
//         'INSERT INTO users (username, password, fullname, address) VALUES (?, ?, ?, ?)',
//         [username, password, fullname, address, sex, email]
//     );
//     return rows; // Trả về kết quả của thao tác chèn
// }
const isUserExist = async (username) => {
    const [rows] = await connectDB.execute('SELECT * FROM nguoidung WHERE tentaikhoan = ?', [username]);
    return rows.length > 0; 
}
const saltRounds = 10; // Số vòng băm
const insertUser = async (username, password, fullname, address, sex, email, sodienthoai) => {
    try {
        // Băm mật khẩu trước khi lưu vào cơ sở dữ liệu
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Chỉ định rõ các cột trong câu lệnh INSERT
        await connectDB.execute(
            "INSERT INTO nguoidung (tentaikhoan, matkhau, tennguoidung, diachi, gioitinh, email, sodienthoai, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", 
            [username, hashedPassword, fullname, address, sex, email, sodienthoai, 'admin']
        );
    } catch (error) {
        console.error("Error inserting user:", error);
        throw error;
    }
};
const detailUser = async (user) => {
    const [rows, fields] = await connectDB.execute('SELECT * FROM `nguoidung` WHERE tentaikhoan=?', [user])
    return rows[0]
}
const updateUser = async (username, password, fullname, address, sex, email) => {
    await connectDB.execute('UPDATE nguoidung SET matkhau=?, tennguoidung=?, diachi=?, gioitinh=?, email=? WHERE tentaikhoan=?',[password, fullname, address, sex, email, username])
}
const deleteUser = async(user) => {
    await connectDB.execute("DELETE FROM nguoidung WHERE tentaikhoan=?", [user])
}

const getUserByUsername = async (username) => {
    const [rows, fields] = await connectDB.execute('SELECT * FROM `nguoidung` WHERE `tentaikhoan`=?', [username]);
    return rows[0]; // Trả về người dùng nếu có, nếu không sẽ trả về undefined
};

const registerUser = async (userid, username, password, fullname, sex, address, email, sodienthoai, ngaydangky = new Date(), role) => { 
    const [rows, fields] = await connectDB.execute(
        'INSERT INTO `nguoidung` VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 
        [
            userid,
            username, 
            password, 
            fullname,  
            sex,   
            address,     
            email,
            sodienthoai,  
            ngaydangky,    
            role,        
        ]
    );
    return rows;
}

//Thông tin người dùng client
const getUserById = async (userid) => {
    try {
        const [rows] = await connectDB.execute('SELECT * FROM `nguoidung` WHERE `manguoidung` = ?', [userid]);
        return rows[0]; // Trả về người dùng đầu tiên tìm thấy (hoặc undefined nếu không có)
    } catch (error) {
        console.error("Lỗi khi lấy thông tin người dùng theo ID:", error);
        throw error;
    }
};

const updateUserDetail = async (userid, tennguoidung, email, gioitinh, diachi, sodienthoai, avatar) => {
    try {
        let query = "UPDATE nguoidung SET tennguoidung = ?, email = ?, gioitinh = ?, diachi = ?, sodienthoai = ?";
        let values = [tennguoidung, email, gioitinh, diachi, sodienthoai];

        if (avatar) {
            query += ", avatar = ?";
            values.push(avatar);
        }

        query += " WHERE manguoidung = ?";
        values.push(userid);

        const [result] = await connectDB.execute(query, values);
        return result;
    } catch (error) {
        console.error("Lỗi khi cập nhật thông tin người dùng:", error);
        throw error;
    }
};
export default { getAllUser, detailUser, updateUser, deleteUser, insertUser, isUserExist, getUserByUsername, registerUser, getUserById, updateUserDetail}