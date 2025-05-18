import connectDB from '../configs/connectDB.js';

// Lấy danh sách nhóm sản phẩm
const getAllNhom = async () => {
    const [rows] = await connectDB.execute('SELECT * FROM theloai');
    return rows;
};

// Thêm nhóm sản phẩm mới
const addNhom = async (ten) => {
    const [result] = await connectDB.execute('INSERT INTO theloai (tentheloai) VALUES (?)', [ten]);
    return result.insertId;
};

// Kiểm tra xem tên nhóm đã tồn tại chưa
const getCategoryByName = async (ten) => {
    try {
        const [result] = await connectDB.execute('SELECT * FROM theloai WHERE tentheloai = ?', [ten]);
        return result[0];
    } catch (error) {
        console.error(error);
        throw error;
    }
};

// Lấy nhóm sản phẩm theo ID
const getCategoryById = async (idnhom) => {
    try {
        const [rows] = await connectDB.execute('SELECT * FROM theloai WHERE matheloai = ?', [idnhom]);
        return rows[0];
    } catch (error) {
        console.error(error);
        throw new Error('Không thể tìm thấy nhóm sản phẩm');
    }
};

// Cập nhật nhóm sản phẩm
const updateCategory = async (id, ten) => {
    const [result] = await connectDB.execute('UPDATE theloai SET tentheloai = ? WHERE matheloai = ?', [ten, id]);
    return result;
};

// Xóa nhóm sản phẩm
const deleteCategory = async (categoryId) => {
    const [result] = await connectDB.execute('DELETE FROM theloai WHERE matheloai = ?', [categoryId]);
    return result;
};

// Lấy danh sách nhóm sản phẩm theo phân trang và tìm kiếm
const getPaginatedNhom = async (search, offset, limit) => {
    const [rows] = await connectDB.execute(
        'SELECT * FROM theloai WHERE tentheloai LIKE ? LIMIT ? OFFSET ?', 
        [`%${search}%`, limit, offset]
    );
    return rows;
};

// Đếm tổng số nhóm sản phẩm theo tìm kiếm
const countNhom = async (search) => {
    const [rows] = await connectDB.execute(
        'SELECT COUNT(*) as total FROM theloai WHERE tentheloai LIKE ?', 
        [`%${search}%`]
    );
    return rows[0].total;
};

export default { getAllNhom, addNhom, getCategoryByName, getCategoryById, updateCategory, deleteCategory, getPaginatedNhom, countNhom };
