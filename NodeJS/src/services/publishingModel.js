import connectDB from '../configs/connectDB.js';

// Lấy danh sách nhà xuất bản
const getAllPublishing = async () => {
    const [rows] = await connectDB.execute('SELECT * FROM nhaxuatban');
    return rows;
};

// Thêm nhà xuất bản mới
const addPublishing = async (ten) => {
    const [result] = await connectDB.execute('INSERT INTO nhaxuatban (tennhaxuatban) VALUES (?)', [ten]);
    return result.insertId;
};

// Kiểm tra xem tên nhà xuất bản có trùng không
const getPublishingByName = async (ten) => {
    try {
        const [result] = await connectDB.execute('SELECT * FROM nhaxuatban WHERE tennhaxuatban = ?', [ten]);
        return result[0];
    } catch (error) {
        console.error(error);
        throw error;
    }
};

// Lấy nhà xuất bản theo ID
const getPublishingById = async (idnhom) => {
    try {
        const [rows] = await connectDB.execute('SELECT * FROM nhaxuatban WHERE manhaxuatban = ?', [idnhom]);
        return rows[0];
    } catch (error) {
        console.error(error);
        throw new Error('Không thể tìm thấy nhóm sản phẩm');
    }
};

// Cập nhật nhà xuất bản
const updatePublishing = async (id, ten) => {
    const [result] = await connectDB.execute('UPDATE nhaxuatban SET tennhaxuatban = ? WHERE manhaxuatban = ?', [ten, id]);
    return result;
};

// Xóa nhà xuất bản
const deletePublishing = async (publishingId) => {
    const [result] = await connectDB.execute('DELETE FROM nhaxuatban WHERE manhaxuatban = ?', [publishingId]);
    return result;
};

// Lấy danh sách nhà xuất bản theo phân trang và tìm kiếm
const getPaginatedPublishing = async (search, offset, limit) => {
    const [rows] = await connectDB.execute(
        'SELECT * FROM nhaxuatban WHERE tennhaxuatban LIKE ? LIMIT ? OFFSET ?', 
        [`%${search}%`, limit, offset]
    );
    return rows;
};

// Đếm tổng số nhà xuất bản theo tìm kiếm
const countPubishing = async (search) => {
    const [rows] = await connectDB.execute(
        'SELECT COUNT(*) as total FROM nhaxuatban WHERE tennhaxuatban LIKE ?', 
        [`%${search}%`]
    );
    return rows[0].total;
};

export default { getAllPublishing, addPublishing, getPublishingByName, getPublishingById, updatePublishing, deletePublishing, getPaginatedPublishing, countPubishing };
