import connectDB from "../configs/connectDB.js";

const getAllBooks = async () => {
    const [books] = await connectDB.execute('SELECT * FROM sach');
    return books;
};

const getBookById = async (bookId) => {
    const [book] = await connectDB.execute('SELECT * FROM sach WHERE masach = ?', [bookId]);
    return book[0];
};

const getPromotionById = async (promotionId) => {
    const [promotion] = await connectDB.execute('SELECT * FROM khuyenmai WHERE makhuyenmai = ?', [promotionId]);
    return promotion[0];
};

const createPromotion = async (promotion) => {
    const { tenkhuyenmai, phantramgiamgia, ngaybatdau, ngayketthuc } = promotion;
    await connectDB.execute(
        'INSERT INTO khuyenmai (tenkhuyenmai, phantramgiamgia, ngaybatdau, ngayketthuc) VALUES (?, ?, ?, ?)',
        [tenkhuyenmai, phantramgiamgia, ngaybatdau, ngayketthuc]
    );
};

const getAllPromotions = async () => {
    const [promotions] = await connectDB.execute('SELECT * FROM khuyenmai');
    return promotions;
};

// Cập nhật khuyến mãi
const updatePromotion = async (promotionId, promotion) => {
    const { tenkhuyenmai, phantramgiamgia, ngaybatdau, ngayketthuc } = promotion;
    await connectDB.execute(
        'UPDATE khuyenmai SET tenkhuyenmai = ?, phantramgiamgia = ?, ngaybatdau = ?, ngayketthuc = ? WHERE makhuyenmai = ?',
        [tenkhuyenmai, phantramgiamgia, ngaybatdau, ngayketthuc, promotionId]
    );
};

// Xóa khuyến mãi
const deletePromotion = async (promotionId) => {
    await connectDB.execute(
        'DELETE FROM khuyenmai WHERE makhuyenmai = ?',
        [promotionId]
    );
};

const applyPromotionToProduct = async (promotionId, productId = null) => {
    // Gán khuyến mãi cho sản phẩm cụ thể hoặc toàn bộ sản phẩm
    await connectDB.execute(
        'INSERT INTO sachkhuyenmai (makhuyenmai, masach) VALUES (?, ?)',
        [promotionId, productId]
    );
};

const getPromotionProducts = async (promotionId) => {
    // Lấy danh sách sản phẩm được áp dụng khuyến mãi
    const [products] = await connectDB.execute(
        `SELECT p.* FROM sach p
         JOIN sachkhuyenmai pp ON p.masach = pp.masach
         WHERE pp.makhuyenmai = ?`,
        [promotionId]
    );
    return products;
};

const checkPromotionForProduct = async (productId) => {
    const [result] = await connectDB.execute(
        'SELECT * FROM sachkhuyenmai WHERE masach = ?',
        [productId]
    );
    return result.length > 0; 
};

// Kiểm tra khuyến mãi còn hợp lệ
const isPromotionValid = async (promotionId) => {
    const [result] = await connectDB.execute(`
        SELECT * FROM khuyenmai 
        WHERE makhuyenmai = ? AND ngayketthuc >= NOW()
    `, [promotionId]);
    return result.length > 0; // Trả về true nếu khuyến mãi hợp lệ
};

const getProductsWithPromotion = async () => {
    const [results] = await connectDB.execute(`
        SELECT 
            sach.masach, 
            sach.tensach, 
            khuyenmai.makhuyenmai, 
            khuyenmai.tenkhuyenmai, 
            khuyenmai.phantramgiamgia 
        FROM sach
        LEFT JOIN sachkhuyenmai ON sach.masach = sachkhuyenmai.masach
        LEFT JOIN khuyenmai ON sachkhuyenmai.makhuyenmai = khuyenmai.makhuyenmai
        
    `);
    return results;
};

const cleanUpExpiredPromotions = async () => {
    try {
        // Xóa các khuyến mãi đã hết hạn khỏi bảng sachkhuyenmai
        const [result] = await connectDB.execute(`
            DELETE sachkhuyenmai
            FROM sachkhuyenmai
            JOIN khuyenmai ON sachkhuyenmai.makhuyenmai = khuyenmai.makhuyenmai
            WHERE khuyenmai.ngayketthuc < NOW()
        `);
        // console.log(`Đã xóa ${result.affectedRows} khuyến mãi hết hạn.`);
    } catch (err) {
        console.error('Lỗi khi xóa khuyến mãi hết hạn:', err);
    }
};

const getProductsWithPromotionAndSearch = async (search, page, limit) => {
    const offset = (page - 1) * limit;
    const searchQuery = `%${search}%`;

    // Đếm tổng số sản phẩm phù hợp
    const [[{ totalItems }]] = await connectDB.execute(
        `SELECT COUNT(*) as totalItems 
         FROM sach 
         LEFT JOIN sachkhuyenmai ON sach.masach = sachkhuyenmai.masach 
         LEFT JOIN khuyenmai ON sachkhuyenmai.makhuyenmai = khuyenmai.makhuyenmai
         WHERE sach.tensach LIKE ?`,
        [searchQuery]
    );

    // Lấy sản phẩm theo trang và tìm kiếm
    const [products] = await connectDB.execute(
        `SELECT 
            sach.masach, 
            sach.tensach, 
            sach.hinhanh,
            khuyenmai.makhuyenmai, 
            khuyenmai.tenkhuyenmai, 
            khuyenmai.phantramgiamgia 
         FROM sach 
         LEFT JOIN sachkhuyenmai ON sach.masach = sachkhuyenmai.masach 
         LEFT JOIN khuyenmai ON sachkhuyenmai.makhuyenmai = khuyenmai.makhuyenmai
         WHERE sach.tensach LIKE ?
         LIMIT ? OFFSET ?`,
        [searchQuery, limit, offset]
    );

    return { products, totalItems };
};

const removePromotionFromProduct = async (productId) => {
    await connectDB.execute(
        'DELETE FROM sachkhuyenmai WHERE masach = ?',
        [productId]
    );
};

const getPromotionsWithSearchAndPagination = async (search, page, limit) => {
    const offset = (page - 1) * limit; // Tính offset cho phân trang
    const searchQuery = `%${search}%`; // Tìm kiếm không phân biệt chữ hoa/chữ thường

    // Đếm tổng số khuyến mãi phù hợp
    const [[{ totalItems }]] = await connectDB.execute(
        `SELECT COUNT(*) as totalItems 
         FROM khuyenmai 
         WHERE tenkhuyenmai LIKE ?`,
        [searchQuery]
    );

    // Lấy danh sách khuyến mãi theo trang và tìm kiếm
    const [promotions] = await connectDB.execute(
        `SELECT 
            makhuyenmai, 
            tenkhuyenmai, 
            phantramgiamgia, 
            ngaybatdau, 
            ngayketthuc 
         FROM khuyenmai 
         WHERE tenkhuyenmai LIKE ?
         LIMIT ? OFFSET ?`,
        [searchQuery, limit, offset]
    );

    return { promotions, totalItems };
};


export default {getAllPromotions, getPromotionById, createPromotion, getAllBooks, getBookById, updatePromotion, deletePromotion, applyPromotionToProduct, getPromotionProducts, checkPromotionForProduct, getProductsWithPromotion, cleanUpExpiredPromotions, isPromotionValid, getProductsWithPromotionAndSearch, removePromotionFromProduct, getPromotionsWithSearchAndPagination};