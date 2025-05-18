import connectDB from "../configs/connectDB.js";

// Thêm cửa hàng mới
const insertStore = async (store) => {
    const { tencuahang, diachi, lat, lng, hinhanh } = store;
    const [result] = await connectDB.execute(
        `INSERT INTO bansach_cuahang (tencuahang, diachi, lat, lng, hinhanh) VALUES (?, ?, ?, ?, ?)`,
        [tencuahang, diachi, lat, lng, hinhanh || null]
    );
    return result.insertId;
};

// Lấy danh sách cửa hàng
const getAllStores = async () => {
    const [rows] = await connectDB.execute(`SELECT * FROM bansach_cuahang`);
    return rows;
};

// Cập nhật cửa hàng
const updateStore = async (macuahang, store) => {
    const { tencuahang, diachi, lat, lng, hinhanh } = store;
    const [result] = await connectDB.execute(
        `UPDATE bansach_cuahang SET tencuahang = ?, diachi = ?, lat = ?, lng = ?, hinhanh = ? WHERE macuahang = ?`,
        [tencuahang, diachi, lat, lng, hinhanh || null, macuahang]
    );
    return result.affectedRows > 0;
};

// Xóa cửa hàng
const deleteStore = async (macuahang) => {
    const [result] = await connectDB.execute(
        `DELETE FROM bansach_cuahang WHERE macuahang = ?`,
        [macuahang]
    );
    return result.affectedRows > 0;
};

export default { insertStore, getAllStores, updateStore, deleteStore };