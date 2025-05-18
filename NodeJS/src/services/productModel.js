import connectDB from "../configs/connectDB.js";
import natural from 'natural';

const getAllProduct = async () => {
    const [rows] = await connectDB.execute(`
      SELECT 
        s.masach,
        s.tensach,
        s.tacgia,
        s.hinhanh,
        s.mota,
        s.gia AS giaGoc,
        s.manhaxuatban,
        s.matheloai,
        km.phantramgiamgia,
        km.ngaybatdau,
        km.ngayketthuc,
        CASE 
          WHEN km.phantramgiamgia IS NOT NULL
            AND km.ngaybatdau <= NOW() 
            AND km.ngayketthuc >= NOW() 
          THEN s.gia * (1 - km.phantramgiamgia / 100)
          ELSE s.gia
        END AS giaKhuyenMai,
        s.luotxem,
        COALESCE(SUM(ctnk.soluong), 0) AS tongsoluong
      FROM 
        sach AS s
      LEFT JOIN 
        sachkhuyenmai AS skm ON s.masach = skm.masach
      LEFT JOIN 
        khuyenmai AS km ON skm.makhuyenmai = km.makhuyenmai
      LEFT JOIN 
        chitietnhapkho AS ctnk ON s.masach = ctnk.masach
      GROUP BY 
        s.masach
      ORDER BY s.masach DESC  
    `);
    return rows;
};
  
// const getAllProductWithPagination = async (offset, limit, category) => {
//     try {
//         // Điều kiện lọc theo danh mục (nếu có)
//         const categoryCondition = category ? `WHERE matheloai = ?` : '';

//         // Lấy tổng số lượng sản phẩm phù hợp
//         const totalItemsQuery = `
//             SELECT COUNT(*) AS total
//             FROM sach
//             ${categoryCondition}
//         `;
//         const totalItemsParams = category ? [category] : [];
//         const [totalResult] = await connectDB.execute(totalItemsQuery, totalItemsParams);
//         const totalItems = totalResult[0].total;

//         // Lấy sản phẩm với phân trang và lọc theo danh mục (nếu có)
//         const productsQuery = `
//             SELECT *
//             FROM sach
//             ${categoryCondition}
//             LIMIT ? OFFSET ?
//         `;
//         const productsParams = category ? [category, limit, offset] : [limit, offset];
//         const [products] = await connectDB.execute(productsQuery, productsParams);

//         return { products, totalItems };
//     } catch (error) {
//         console.error('Lỗi khi lấy sản phẩm với phân trang và lọc danh mục:', error);
//         throw error;
//     }
// };

const getAllProductWithPagination = async (offset, limit, category, query) => {
    try {
        // Điều kiện lọc theo danh mục và từ khóa tìm kiếm
        let whereConditions = '';
        const queryParams = [];

        if (category) {
            whereConditions += `WHERE matheloai = ? `;
            queryParams.push(category);
        }

        if (query) {
            whereConditions += category ? 'AND ' : 'WHERE ';
            whereConditions += `tensach LIKE ? `;
            queryParams.push(`%${query}%`);
        }

        // Lấy tổng số lượng sản phẩm phù hợp
        const totalItemsQuery = `
            SELECT COUNT(*) AS total
            FROM sach
            ${whereConditions}
        `;
        const [totalResult] = await connectDB.execute(totalItemsQuery, queryParams);
        const totalItems = totalResult[0].total;

        // Lấy sản phẩm với phân trang, lọc theo danh mục và tìm kiếm
        const productsQuery = `
            SELECT 
                sach.*, 
                COALESCE(SUM(chitietnhapkho.soluong), 0) AS tongsoluong
            FROM 
                sach
            LEFT JOIN 
                chitietnhapkho
            ON 
                sach.masach = chitietnhapkho.masach
            ${whereConditions}
            GROUP BY 
                sach.masach
            ORDER BY sach.masach DESC
            LIMIT ? OFFSET ?        
        `;
        queryParams.push(limit, offset);
        const [products] = await connectDB.execute(productsQuery, queryParams);

        return { products, totalItems };
    } catch (error) {
        console.error('Lỗi khi lấy sản phẩm với phân trang và lọc danh mục:', error);
        throw error;
    }
};


const searchAndPaginateProducts = async (query, category, page, limit) => {
    try {
        const offset = (page - 1) * limit;

        // Câu lệnh SQL động dựa trên điều kiện lọc
        let baseQuery = `
            SELECT *
            FROM sach
            WHERE tensach LIKE ?
        `;
        let countQuery = `
            SELECT COUNT(*) AS total
            FROM sach
            WHERE tensach LIKE ?
        `;
        const params = [`%${query}%`];

        if (category) {
            baseQuery += ` AND matheloai = ?`;
            countQuery += ` AND matheloai = ?`;
            params.push(category);
        }

        baseQuery += ` LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        // Thực thi truy vấn
        const [products] = await connectDB.execute(baseQuery, params);
        const [countResult] = await connectDB.execute(countQuery, [`%${query}%`, ...(category ? [category] : [])]);
        const totalItems = countResult[0].total;

        return { products, totalItems };
    } catch (error) {
        console.error('Lỗi khi tìm kiếm và phân trang sản phẩm:', error);
        throw error;
    }
};

// Lấy tất cả nhóm sản phẩm
const getAllNhom = async () => {
    const [rows, fields] = await connectDB.execute('SELECT matheloai, tentheloai AS tenLoai FROM `theloai`');
    return rows;
};

// Lấy tất cả nhóm sản phẩm
const getAllNxb = async () => {
    const [rows, fields] = await connectDB.execute('SELECT manhaxuatban, tennhaxuatban AS tenNxb FROM `nhaxuatban`');
    return rows;
};

// // Thêm sản phẩm vào cơ sở dữ liệu
// const insertProduct = async (ten, gia, tacgia, hinhanh, mota, idnxb, idnhom) => {
//     await connectDB.execute("INSERT INTO `sach` (tensach, gia, tacgia, hinhanh, mota, manhaxuatban, matheloai) VALUES (?, ?, ?, ?, ?, ?, ?)", [ten, gia, tacgia, hinhanh, mota, idnxb, idnhom]);
// };

// const detailProduct = async (id) => {
//     const [rows] = await connectDB.execute(`
//         SELECT 
//             s.tensach AS tenSP, 
//             s.gia AS giaGoc, 
//             s.tacgia,
//             s.hinhanh, 
//             s.mota, 
//             s.matheloai, 
//             s.masach, 
//             s.manhaxuatban, 
//             nhaxuatban.tennhaxuatban AS tenNXB, 
//             theloai.tentheloai AS tenNhom,
//             km.phantramgiamgia,
//             km.ngaybatdau,
//             km.ngayketthuc,
//             CASE 
//                 WHEN km.phantramgiamgia IS NOT NULL 
//                 AND km.ngaybatdau <= NOW() 
//                 AND km.ngayketthuc >= NOW() 
//                 THEN s.gia * (1 - km.phantramgiamgia / 100)
//                 ELSE s.gia
//             END AS giaKhuyenMai,
//             s.luotxem,
//             COALESCE(SUM(ctnk.soluong), 0) AS tongsoluong
//         FROM 
//             sach AS s
//         JOIN 
//             theloai ON s.matheloai = theloai.matheloai
//         JOIN 
//             nhaxuatban ON s.manhaxuatban = nhaxuatban.manhaxuatban
//         LEFT JOIN 
//             sachkhuyenmai AS skm ON s.masach = skm.masach
//         LEFT JOIN 
//             khuyenmai AS km ON skm.makhuyenmai = km.makhuyenmai
//         LEFT JOIN 
//             chitietnhapkho AS ctnk ON s.masach = ctnk.masach
//         WHERE 
//             s.masach = ?
//         GROUP BY 
//             s.masach
//     `, [id]);

//     if (rows.length === 0) {
//         throw new Error('Không tìm thấy sản phẩm');
//     }

//     return rows[0];
// };

const insertProduct = async (ten, gia, tacgia, hinhanh, mota, idnxb, idnhom, hinhanhPhu) => {
    await connectDB.execute(
        "INSERT INTO `sach` (tensach, gia, tacgia, hinhanh, mota, manhaxuatban, matheloai, hinhanh_phu) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [ten, gia, tacgia, hinhanh, mota, idnxb, idnhom, hinhanhPhu]
    );
};

const detailProduct = async (id) => {
    const [rows] = await connectDB.execute(`
        SELECT 
            s.tensach AS tenSP, 
            s.gia AS giaGoc, 
            s.tacgia,
            s.hinhanh, 
            s.mota, 
            s.matheloai, 
            s.masach, 
            s.manhaxuatban, 
            nhaxuatban.tennhaxuatban AS tenNXB, 
            theloai.tentheloai AS tenNhom,
            km.phantramgiamgia,
            km.ngaybatdau,
            km.ngayketthuc,
            CASE 
                WHEN km.phantramgiamgia IS NOT NULL 
                AND km.ngaybatdau <= NOW() 
                AND km.ngayketthuc >= NOW() 
                THEN s.gia * (1 - km.phantramgiamgia / 100)
                ELSE s.gia
            END AS giaKhuyenMai,
            s.luotxem,
            COALESCE(SUM(ctnk.soluong), 0) AS tongsoluong,
            s.hinhanh_phu  -- Thêm cột hinhanh_phu vào query
        FROM 
            sach AS s
        JOIN 
            theloai ON s.matheloai = theloai.matheloai
        JOIN 
            nhaxuatban ON s.manhaxuatban = nhaxuatban.manhaxuatban
        LEFT JOIN 
            sachkhuyenmai AS skm ON s.masach = skm.masach
        LEFT JOIN 
            khuyenmai AS km ON skm.makhuyenmai = km.makhuyenmai
        LEFT JOIN 
            chitietnhapkho AS ctnk ON s.masach = ctnk.masach
        WHERE 
            s.masach = ?
        GROUP BY 
            s.masach
    `, [id]);

    if (rows.length === 0) {
        throw new Error('Không tìm thấy sản phẩm');
    }

    return rows[0];
};

const increaseViewCount = async (id) => {
    const [result] = await connectDB.execute(`
        UPDATE sach
        SET luotxem = luotxem + 1
        WHERE masach = ?
    `, [id]);
    return result;
};

// // Cập nhật thông tin sản phẩm
// const updateProduct = async (id, ten, gia, tacgia, hinhanh, mota, idnhom, idnxb) => {
//     if (!hinhanh) {
//         // Nếu không có ảnh mới, giữ nguyên ảnh cũ
//         await connectDB.execute(
//             `UPDATE sach SET tensach = ?, gia = ?, tacgia = ?, mota = ?, matheloai = ?, manhaxuatban = ? WHERE masach = ?`,
//             [ten, gia, tacgia, mota, idnhom, idnxb, id]
//         );
//     } else {
//         // Nếu có ảnh mới, cập nhật ảnh mới vào cơ sở dữ liệu
//         await connectDB.execute(
//             `UPDATE sach SET tensach = ?, gia = ?, tacgia = ?, hinhanh = ?, mota = ?, matheloai = ?, manhaxuatban = ? WHERE masach = ?`,
//             [ten, gia, tacgia, hinhanh, mota, idnhom, idnxb, id]
//         );
//     }
// };

// Cập nhật thông tin sản phẩm, bao gồm cả hình ảnh phụ
const updateProduct = async (id, ten, gia, tacgia, hinhanh, mota, idnhom, idnxb, hinhanhPhu) => {
    if (!hinhanh) {
        // Nếu không có ảnh mới, giữ nguyên ảnh cũ và cập nhật hinhanh_phu
        await connectDB.execute(
            `UPDATE sach SET tensach = ?, gia = ?, tacgia = ?, mota = ?, matheloai = ?, manhaxuatban = ?, hinhanh_phu = ? WHERE masach = ?`,
            [ten, gia, tacgia, mota, idnhom, idnxb, hinhanhPhu, id]
        );
    } else {
        // Nếu có ảnh mới, cập nhật cả ảnh chính và hinhanh_phu
        await connectDB.execute(
            `UPDATE sach SET tensach = ?, gia = ?, tacgia = ?, hinhanh = ?, mota = ?, matheloai = ?, manhaxuatban = ?, hinhanh_phu = ? WHERE masach = ?`,
            [ten, gia, tacgia, hinhanh, mota, idnhom, idnxb, hinhanhPhu, id]
        );
    }
};


// const deleteProduct = async(masp) => {
//     await connectDB.execute("DELETE FROM `sach` WHERE masach=?", [masp])
// }
const deleteProduct = async (masp) => {
    try {
        // Xóa các bản ghi liên quan trong các bảng con
        await connectDB.execute("DELETE FROM `danhgia` WHERE masach = ?", [masp]);
        await connectDB.execute("DELETE FROM `sachkhuyenmai` WHERE masach = ?", [masp]);
        await connectDB.execute("DELETE FROM `chitietnhapkho` WHERE masach = ?", [masp]);
        await connectDB.execute("DELETE FROM `luotxem` WHERE masach = ?", [masp]);

        // Sau đó xóa bản ghi trong bảng sach
        await connectDB.execute("DELETE FROM `sach` WHERE masach = ?", [masp]);
    } catch (error) {
        console.error('Lỗi khi xóa sản phẩm:', error);
        throw error;
    }
};

// Lấy sản phẩm theo nhóm
const getProductsByGroup = async (matheloai) => {
    const [rows, fields] = await connectDB.execute(`
        SELECT 
            s.masach,
            s.tensach,
            s.tacgia,
            s.hinhanh,
            s.mota,
            s.gia AS giaGoc,
            s.manhaxuatban,
            s.matheloai,
            km.phantramgiamgia,
            km.ngaybatdau,
            km.ngayketthuc,
            CASE 
                WHEN km.phantramgiamgia IS NOT NULL 
                AND km.ngaybatdau <= NOW() 
                AND km.ngayketthuc >= NOW() 
                THEN s.gia * (1 - km.phantramgiamgia / 100)
                ELSE s.gia
            END AS giaKhuyenMai,
            s.luotxem
        FROM 
            sach AS s
        LEFT JOIN 
            sachkhuyenmai AS skm ON s.masach = skm.masach
        LEFT JOIN 
            khuyenmai AS km ON skm.makhuyenmai = km.makhuyenmai
        WHERE 
            s.matheloai = ?
    `, [matheloai]);
    return rows;
};

// Lấy sản phẩm theo trang
const getProductsByPage = async (page, itemsPerPage) => {
    const offset = (page - 1) * itemsPerPage;
    const [rows, fields] = await connectDB.execute(`
        SELECT * FROM sach 
        LIMIT ? OFFSET ?
    `, [itemsPerPage, offset]);

    const [countRows] = await connectDB.execute('SELECT COUNT(*) AS total FROM sach');
    const totalItems = countRows[0].total;

    return {
        products: rows,
        totalItems
    };
};

// Hàm tìm kiếm sản phẩm theo tên
const searchProducts = async (searchQuery) => {
    const [rows] = await connectDB.execute(`
        SELECT 
            s.masach,
            s.tensach,
            s.tacgia,
            s.hinhanh,
            s.mota,
            s.gia AS giaGoc,
            s.manhaxuatban,
            s.matheloai,
            km.phantramgiamgia,
            km.ngaybatdau,
            km.ngayketthuc,
            CASE 
                WHEN km.phantramgiamgia IS NOT NULL 
                AND km.ngaybatdau <= NOW() 
                AND km.ngayketthuc >= NOW() 
                THEN s.gia * (1 - km.phantramgiamgia / 100)
                ELSE s.gia
            END AS giaKhuyenMai,
            s.luotxem
        FROM 
            sach AS s
        LEFT JOIN 
            sachkhuyenmai AS skm ON s.masach = skm.masach
        LEFT JOIN 
            khuyenmai AS km ON skm.makhuyenmai = km.makhuyenmai
        WHERE 
            s.tensach LIKE ?
    `, [`%${searchQuery}%`]); // Chèn từ khóa tìm kiếm vào câu lệnh SQL
    return rows;
};

// Lấy bình luận của một sách theo mã sách
const getCommentsByBookId = async (bookId) => {
    const [rows] = await connectDB.execute(
        'SELECT d.binhluan, d.ngaydanhgia, n.tennguoidung, d.manguoidung, d.madanhgia, n.avatar FROM danhgia d JOIN nguoidung n ON d.manguoidung = n.manguoidung WHERE d.masach = ? ORDER BY d.ngaydanhgia DESC',
        [bookId]
    );
    return rows;  // Trả về danh sách bình luận
};

// Thêm bình luận cho sách
const addComment = async (bookId, content, userId) => {
    const [result] = await connectDB.execute(
        'INSERT INTO danhgia (masach, binhluan, ngaydanhgia, manguoidung) VALUES (?, ?, NOW(), ?)',
        [bookId, content, userId]
    );
    return result;  // Trả về kết quả của câu lệnh INSERT
};

const updateComment = async (commentId, content, userId) => {
    const query = `UPDATE danhgia SET binhluan = ? WHERE madanhgia = ? AND manguoidung = ?`;
    const [result] = await connectDB.execute(query, [content, commentId, userId]);
    return result.affectedRows > 0; // Trả về true nếu sửa thành công
};

const deleteComment = async (commentId, userId) => {
    const query = `DELETE FROM danhgia WHERE madanhgia = ? AND manguoidung = ?`;
    const [result] = await connectDB.execute(query, [commentId, userId]);
    return result.affectedRows > 0; // Trả về true nếu xóa thành công
};

// Lấy 10 sản phẩm có lượt xem nhiều nhất
const getTopViewedProducts = async () => {
    const [rows] = await connectDB.execute(`
        SELECT s.masach, s.tensach, s.tacgia, s.hinhanh, s.gia AS giaGoc, km.phantramgiamgia, s.luotxem,
            CASE 
                WHEN km.phantramgiamgia IS NOT NULL 
                AND km.ngaybatdau <= NOW() 
                AND km.ngayketthuc >= NOW() 
                THEN s.gia * (1 - km.phantramgiamgia / 100)
                ELSE s.gia
            END AS giaKhuyenMai
        FROM sach AS s
        LEFT JOIN sachkhuyenmai AS skm ON s.masach = skm.masach
        LEFT JOIN khuyenmai AS km ON skm.makhuyenmai = km.makhuyenmai
        ORDER BY s.luotxem DESC
        LIMIT 10
    `);
    return rows;
};

// Lấy 10 sản phẩm giảm giá
const getDiscountedProducts = async () => {
    const [rows] = await connectDB.execute(`
        SELECT s.masach, s.tensach, s.tacgia, s.hinhanh, s.gia AS giaGoc, km.phantramgiamgia, s.luotxem,
            CASE 
                WHEN km.phantramgiamgia IS NOT NULL 
                AND km.ngaybatdau <= NOW() 
                AND km.ngayketthuc >= NOW() 
                THEN s.gia * (1 - km.phantramgiamgia / 100)
                ELSE s.gia
            END AS giaKhuyenMai
        FROM sach AS s
        LEFT JOIN sachkhuyenmai AS skm ON s.masach = skm.masach
        LEFT JOIN khuyenmai AS km ON skm.makhuyenmai = km.makhuyenmai
        WHERE km.phantramgiamgia IS NOT NULL
        ORDER BY km.ngaybatdau DESC
        LIMIT 10
    `);
    return rows;
};

// Lấy 10 sản phẩm mới nhất
const getNewProducts = async () => {
    const [rows] = await connectDB.execute(`
        SELECT s.masach, s.tensach, s.tacgia, s.hinhanh, s.gia AS giaGoc, km.phantramgiamgia, s.luotxem,
            CASE 
                WHEN km.phantramgiamgia IS NOT NULL 
                AND km.ngaybatdau <= NOW() 
                AND km.ngayketthuc >= NOW() 
                THEN s.gia * (1 - km.phantramgiamgia / 100)
                ELSE s.gia
            END AS giaKhuyenMai
        FROM sach AS s
        LEFT JOIN sachkhuyenmai AS skm ON s.masach = skm.masach
        LEFT JOIN khuyenmai AS km ON skm.makhuyenmai = km.makhuyenmai
        ORDER BY s.masach DESC
        LIMIT 10
    `);
    return rows;
};

const getProductQuantity = async () => {
    const [rows] = await connectDB.execute(`
        SELECT 
            s.masach,
            s.tensach,
            COALESCE(SUM(ct.soluong), 0) AS tongSoLuong
        FROM 
            sach AS s
        LEFT JOIN 
            chitietnhapkho AS ct ON s.masach = ct.masach
        LEFT JOIN 
            nhapkho AS nk ON ct.manhapkho = nk.manhapkho
        GROUP BY 
            s.masach, s.tensach;
    `);
    return rows;
};
const saveViewedProduct = async (manguoidung, masach) => {
    try {
        // Kiểm tra xem bản ghi đã tồn tại chưa
        const [existing] = await connectDB.execute(
            'SELECT * FROM luotxem WHERE manguoidung = ? AND masach = ?',
            [manguoidung, masach]
        );

        if (existing.length > 0) {
            // Nếu đã tồn tại, cập nhật thời gian xem
            await connectDB.execute(
                'UPDATE luotxem SET ngayxem = NOW() WHERE manguoidung = ? AND masach = ?',
                [manguoidung, masach]
            );
        } else {
            // Nếu chưa tồn tại, thêm bản ghi mới
            await connectDB.execute(
                'INSERT INTO luotxem (manguoidung, masach, ngayxem) VALUES (?, ?, NOW())',
                [manguoidung, masach]
            );
        }
    } catch (error) {
        console.error('Lỗi khi lưu lịch sử xem:', error);
        throw error;
    }
};

const getViewedProducts = async (manguoidung) => {
    const [rows] = await connectDB.execute(`
        SELECT 
            s.*, 
            ls.ngayxem,
            km.phantramgiamgia,
            km.ngaybatdau,
            km.ngayketthuc,
            s.tensach AS tenSP, 
            s.gia AS giaGoc, 
            CASE 
                WHEN km.phantramgiamgia IS NOT NULL 
                AND km.ngaybatdau <= NOW() 
                AND km.ngayketthuc >= NOW() 
                THEN s.gia * (1 - km.phantramgiamgia / 100)
                ELSE s.gia
            END AS giaKhuyenMai,
            COALESCE(SUM(ctnk.soluong), 0) AS tongsoluong
        FROM 
            luotxem ls 
        JOIN 
            sach s ON ls.masach = s.masach 
        LEFT JOIN 
            sachkhuyenmai AS skm ON s.masach = skm.masach
        LEFT JOIN 
            khuyenmai AS km ON skm.makhuyenmai = km.makhuyenmai
        LEFT JOIN 
            chitietnhapkho AS ctnk ON s.masach = ctnk.masach
        WHERE 
            ls.manguoidung = ?
        GROUP BY 
            s.masach
        ORDER BY 
            ls.ngayxem DESC 
        LIMIT 10
    `, [manguoidung]);
    return rows;
};

// Trong ProductModel.js
const getSimilarProducts = async (matheloai, tacgia) => {
    const [rows] = await connectDB.execute(`
        SELECT 
            s.masach, s.tensach, s.tacgia, s.hinhanh, s.gia AS giaGoc, km.phantramgiamgia,
            CASE 
                WHEN km.phantramgiamgia IS NOT NULL 
                AND km.ngaybatdau <= NOW() 
                AND km.ngayketthuc >= NOW() 
                THEN s.gia * (1 - km.phantramgiamgia / 100)
                ELSE s.gia
            END AS giaKhuyenMai
        FROM 
            sach AS s
        LEFT JOIN 
            sachkhuyenmai AS skm ON s.masach = skm.masach
        LEFT JOIN 
            khuyenmai AS km ON skm.makhuyenmai = km.makhuyenmai
        WHERE 
            (s.matheloai = ? OR s.tacgia = ?)
        ORDER BY 
            s.luotxem DESC
    `, [matheloai, tacgia]);
    return rows;
};

const updateStock = async (masach, soluong) => {
    try {
      // Kiểm tra số lượng tồn kho hiện tại
      const [stockRows] = await connectDB.execute(
        `SELECT COALESCE(SUM(soluong), 0) AS tongsoluong 
         FROM chitietnhapkho 
         WHERE masach = ?`,
        [masach]
      );
      const currentStock = stockRows[0].tongsoluong;
  
      if (currentStock < soluong) {
        throw new Error(`Số lượng tồn kho không đủ! Chỉ còn ${currentStock} sản phẩm.`);
      }
  
      // Trừ số lượng tồn kho (giảm từ bản ghi đầu tiên có đủ số lượng)
      const [rows] = await connectDB.execute(
        `UPDATE chitietnhapkho 
         SET soluong = soluong - ? 
         WHERE masach = ? AND soluong >= ? 
         LIMIT 1`,
        [soluong, masach, soluong]
      );
  
      if (rows.affectedRows === 0) {
        throw new Error("Không thể cập nhật tồn kho!");
      }
  
      return true;  
    } catch (error) {
      console.error("Lỗi khi cập nhật tồn kho:", error);
      throw error;
    }
  };
  
  // Ngưỡng điểm tối thiểu để sản phẩm được gợi ý
  const MIN_SCORE = 0.4;
  
  // Hàm tính Cosine Similarity thủ công
  const calculateCosineSimilarity = (tfidf, docIndex1, docIndex2) => {
      try {
          const terms1 = tfidf.listTerms(docIndex1);
          const terms2 = tfidf.listTerms(docIndex2);
  
          const termMap = new Map();
          terms1.forEach(({ term, tfidf: weight }) => termMap.set(term, { doc1: weight, doc2: 0 }));
          terms2.forEach(({ term, tfidf: weight }) => {
              if (!termMap.has(term)) {
                  termMap.set(term, { doc1: 0, doc2: weight });
              } else {
                  termMap.get(term).doc2 = weight;
              }
          });
  
          let dotProduct = 0;
          let norm1 = 0;
          let norm2 = 0;
  
          termMap.forEach(({ doc1, doc2 }) => {
              dotProduct += doc1 * doc2;
              norm1 += doc1 * doc1;
              norm2 += doc2 * doc2;
          });
  
          norm1 = Math.sqrt(norm1);
          norm2 = Math.sqrt(norm2);
  
          if (norm1 === 0 || norm2 === 0) return 0;
          return dotProduct / (norm1 * norm2);
      } catch (error) {
          console.error('Lỗi khi tính Cosine Similarity:', error);
          return 0;
      }
  };
  
  // Hàm lấy sản phẩm gợi ý
  const getRecommendedProducts = async (masach, manguoidung) => {
      try {
          // Lấy chi tiết sản phẩm hiện tại
          const [currentProduct] = await connectDB.execute(`
              SELECT 
                  s.masach, s.tensach, s.tacgia, s.hinhanh, s.gia AS giaGoc, 
                  s.mota, s.matheloai, s.manhaxuatban, s.luotxem,
                  km.phantramgiamgia, km.ngaybatdau, km.ngayketthuc,
                  CASE 
                      WHEN km.phantramgiamgia IS NOT NULL 
                      AND km.ngaybatdau <= NOW() 
                      AND km.ngayketthuc >= NOW() 
                      THEN s.gia * (1 - km.phantramgiamgia / 100)
                      ELSE s.gia
                  END AS giaKhuyenMai,
                  COALESCE(SUM(ctnk.soluong), 0) AS tongsoluong,
                  s.hinhanh_phu
              FROM 
                  sach AS s
              LEFT JOIN 
                  sachkhuyenmai AS skm ON s.masach = skm.masach
              LEFT JOIN 
                  khuyenmai AS km ON skm.makhuyenmai = km.makhuyenmai
              LEFT JOIN 
                  chitietnhapkho AS ctnk ON s.masach = ctnk.masach
              WHERE 
                  s.masach = ?
              GROUP BY 
                  s.masach
          `, [masach]);
  
          if (!currentProduct[0]) {
              throw new Error('Không tìm thấy sản phẩm');
          }
  
          const product = currentProduct[0];
  
          // Lấy tất cả sản phẩm khác (trừ sản phẩm hiện tại)
          const [allProducts] = await connectDB.execute(`
              SELECT 
                  s.masach, s.tensach, s.tacgia, s.hinhanh, s.gia AS giaGoc, 
                  s.mota, s.matheloai, s.manhaxuatban, s.luotxem,
                  km.phantramgiamgia, km.ngaybatdau, km.ngayketthuc,
                  CASE 
                      WHEN km.phantramgiamgia IS NOT NULL 
                      AND km.ngaybatdau <= NOW() 
                      AND km.ngayketthuc >= NOW() 
                      THEN s.gia * (1 - km.phantramgiamgia / 100)
                      ELSE s.gia
                  END AS giaKhuyenMai,
                  COALESCE(SUM(ctnk.soluong), 0) AS tongsoluong,
                  s.hinhanh_phu
              FROM 
                  sach AS s
              LEFT JOIN 
                  sachkhuyenmai AS skm ON s.masach = skm.masach
              LEFT JOIN 
                  khuyenmai AS km ON skm.makhuyenmai = km.makhuyenmai
              LEFT JOIN 
                  chitietnhapkho AS ctnk ON s.masach = ctnk.masach
              WHERE 
                  s.masach != ?
              GROUP BY 
                  s.masach
              ORDER BY s.luotxem DESC
              LIMIT 100
          `, [masach]);
  
        //   // Tính độ tương đồng
        //   const tfidf = new natural.TfIdf();
        //   const productScores = [];
  
        //   // Thêm mô tả của sản phẩm hiện tại vào TF-IDF
        //   const currentMota = product.mota && typeof product.mota === 'string' ? product.mota : '';
        //   tfidf.addDocument(currentMota);
  
        //   // Thêm mô tả của các sản phẩm khác, lọc bỏ mô tả không hợp lệ
        //   const validProducts = allProducts.filter(prod => prod.mota && typeof prod.mota === 'string');
        //   validProducts.forEach(prod => tfidf.addDocument(prod.mota));

        // Hàm chuẩn hóa văn bản
        const normalizeText = (text) => {
            if (!text || typeof text !== 'string') return '';
            return text
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
                .replace(/\s+/g, ' ')
                .trim();
        };

        // Tính độ tương đồng
        const tfidf = new natural.TfIdf();
        const productScores = [];

        // Thêm mô tả của sản phẩm hiện tại vào TF-IDF
        const currentMota = normalizeText(product.mota || '');
        tfidf.addDocument(currentMota);

        // Thêm mô tả của các sản phẩm khác, lọc bỏ mô tả không hợp lệ
        const validProducts = allProducts.filter(prod => prod.mota && typeof prod.mota === 'string');
        validProducts.forEach(prod => tfidf.addDocument(normalizeText(prod.mota)));
  
          // Nếu có người dùng, lấy lịch sử xem
        //   let viewedIds = [];
        //   if (manguoidung) {
        //       const [viewedRows] = await connectDB.execute(`
        //           SELECT s.masach
        //           FROM luotxem lx
        //           JOIN sach s ON lx.masach = s.masach
        //           WHERE lx.manguoidung = ?
        //           ORDER BY lx.thoigianxem DESC
        //       `, [manguoidung]);
        //       viewedIds = viewedRows.map(p => p.masach);
        //   }
          
          // Lưu tất cả sản phẩm với score để sử dụng khi không đủ MIN_SCORE
          const allProductScores = [];

          // So sánh từng sản phẩm
          allProducts.forEach((prod, index) => {
              let score = 0;
  
              // 1. Tương đồng dựa trên tên sách (40%)
              const tensachScore = natural.JaroWinklerDistance(
                  product.tensach || '',
                  prod.tensach || '',
                  { caseSensitive: false }
              );
              score += tensachScore * 0;
  
              // 2. Tương đồng dựa trên matheloai (30%)
              if (prod.matheloai === product.matheloai) {
                  score += 0;
              }
  
              // 3. Tương đồng dựa trên tacgia (20%)
              if (prod.tacgia === product.tacgia) {
                  score += 0;
              }
  
              // 4. Tương đồng dựa trên mô tả (10%)
              let tfidfScore = 0;
              if (validProducts.includes(prod)) {
                  const validIndex = validProducts.indexOf(prod);
                  tfidfScore = calculateCosineSimilarity(tfidf, 0, validIndex + 1);
              }
              score += tfidfScore * 1;
  
              // 5. Ưu tiên sản phẩm trong lịch sử xem (thêm 0.2 nếu có)
            //   if (viewedIds.includes(prod.masach)) {
            //       score += 0.2;
            //   }

              // Lưu tất cả sản phẩm với score
              allProductScores.push({ product: prod, score, tfidfScore });
  
              // Chỉ giữ sản phẩm có score >= MIN_SCORE
              if (score >= MIN_SCORE) {
                  // Log để debug
                  console.log(`Sản phẩm: ${prod.tensach}, tfidfScore: ${tfidfScore * 0.9}, score tên sách: ${tensachScore * 0.05}, score tổng: ${score}`);
                  productScores.push({ product: prod, score });
              }
          });
  
          // Sắp xếp theo điểm tương đồng và lấy top 24
          let recommended = productScores
              .sort((a, b) => b.score - a.score)
              .slice(0, 24)
              .map(item => item.product);

          // Nếu không có sản phẩm nào đạt MIN_SCORE, ưu tiên cùng matheloai hoặc tacgia
            if (recommended.length === 0) {
                const fallbackProducts = allProductScores
                    .filter(item => item.product.matheloai === product.matheloai || item.product.tacgia === product.tacgia)
                    .sort((a, b) => b.score - a.score || b.product.luotxem - a.product.luotxem) // Ưu tiên score, rồi luotxem
                    .slice(0, 24)
                    .map(item => {
                        console.log(`Sản phẩm bổ sung: ${item.product.tensach}, tfidfScore: ${item.tfidfScore}, score tổng: ${item.score}, matheloai: ${item.product.matheloai === product.matheloai ? 1 : 0}, tacgia: ${item.product.tacgia === product.tacgia ? 1 : 0}`);
                        return item.product;
                    });
                recommended = fallbackProducts;
            }
  
          // Nếu không đủ 24 sản phẩm, bổ sung từ allProducts (sắp xếp theo luotxem)
          if (recommended.length < 24) {
              const remainingProducts = allProducts
                  .filter(prod => !recommended.some(rec => rec.masach === prod.masach))
                  .sort((a, b) => b.luotxem - a.luotxem)
                  .slice(0, 24 - recommended.length);
              recommended = [...recommended, ...remainingProducts];
          }
  
          // Nếu có người dùng, ưu tiên sản phẩm từ lịch sử xem
        //   if (manguoidung && viewedIds.length > 0) {
        //       recommended.sort((a, b) => {
        //           const aInHistory = viewedIds.includes(a.masach) ? 1 : 0;
        //           const bInHistory = viewedIds.includes(b.masach) ? 1 : 0;
        //           return bInHistory - aInHistory;
        //       });
        //   }
  
          return recommended;
      } catch (error) {
          console.error('Lỗi khi lấy sản phẩm gợi ý:', error);
          throw error;
      }
  };

  const getProductsByMultipleGroups = async (groupIds) => {
    const placeholders = groupIds.map(() => '?').join(',');
    const [rows] = await connectDB.execute(
      `
      SELECT 
        s.masach,
        s.tensach,
        s.tacgia,
        s.hinhanh,
        s.mota,
        s.gia AS giaGoc,
        s.manhaxuatban,
        s.matheloai,
        km.phantramgiamgia,
        km.ngaybatdau,
        km.ngayketthuc,
        CASE 
          WHEN km.phantramgiamgia IS NOT NULL 
          AND km.ngaybatdau <= NOW() 
          AND km.ngayketthuc >= NOW() 
          THEN s.gia * (1 - km.phantramgiamgia / 100)
          ELSE s.gia
        END AS giaKhuyenMai,
        s.luotxem,
        COALESCE(SUM(ctnk.soluong), 0) AS tongsoluong
      FROM 
        sach AS s
      LEFT JOIN 
        sachkhuyenmai AS skm ON s.masach = skm.masach
      LEFT JOIN 
        khuyenmai AS km ON skm.makhuyenmai = km.makhuyenmai
      LEFT JOIN 
        chitietnhapkho AS ctnk ON s.masach = ctnk.masach
      WHERE 
        s.matheloai IN (${placeholders})
      GROUP BY 
        s.masach
      ORDER BY s.masach DESC
    `,
      groupIds
    );
    return rows;
  };

export default { getProductsByMultipleGroups, getRecommendedProducts, updateStock, getSimilarProducts, saveViewedProduct, getViewedProducts, getProductQuantity, getDiscountedProducts, getNewProducts, getTopViewedProducts, updateComment, deleteComment, increaseViewCount, getAllProduct, insertProduct, getAllNhom, detailProduct, updateProduct, deleteProduct, getProductsByGroup, getAllNxb, getProductsByPage, searchProducts, getCommentsByBookId, addComment, searchAndPaginateProducts, getAllProductWithPagination};
