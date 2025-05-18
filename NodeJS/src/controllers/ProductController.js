import express from "express";
import productModel from "../services/productModel.js";
import upload from "../../middleware/upload.js"; 
import { formatPrice } from "../utils/utils.js";
// // Lấy tất cả sản phẩm Admin (có phân trang)
// const getAllProduct = async (req, res) => {
//     const page = parseInt(req.query.page) || 1; // Trang hiện tại
//     const itemsPerPage = 5; // Số sản phẩm mỗi trang
//     const offset = (page - 1) * itemsPerPage; // Vị trí bắt đầu
//     const category = req.query.category || ''; // Danh mục được chọn

//     try {
//         // Gọi model để lấy sản phẩm với phân trang và bộ lọc danh mục
//         const { products, totalItems } = await productModel.getAllProductWithPagination(offset, itemsPerPage, category);

//         if (products && products.length > 0) {
//             // Định dạng giá cho từng sản phẩm
//             products.forEach(product => {
//                 product.gia = formatPrice(product.gia);
//             });
//         }

//         // Lấy danh sách danh mục
//         const categories = await productModel.getAllNhom();

//         // Tính tổng số trang
//         const totalPages = Math.ceil(totalItems / itemsPerPage);

//         res.render('home', {
//             data: {
//                 title: 'Sản phẩm',
//                 page: 'product',
//                 products: products,
//                 currentPage: page,
//                 totalPages: totalPages,
//                 limit: itemsPerPage,
//                 categories: categories,
//                 selectedCategory: category,
//             },
//         });
//     } catch (error) {
//         console.error('Lỗi khi lấy sản phẩm:', error);
//         res.status(500).send('Lỗi server');
//     }
// };

const getAllProduct = async (req, res) => {
    const page = parseInt(req.query.page) || 1; // Trang hiện tại
    const itemsPerPage = 5; // Số sản phẩm mỗi trang
    const offset = (page - 1) * itemsPerPage; // Vị trí bắt đầu
    const category = req.query.category || ''; // Danh mục được chọn
    const query = req.query.query ? req.query.query.trim() : ''; // Từ khóa tìm kiếm

    try {
        // Gọi model để lấy sản phẩm với phân trang, tìm kiếm và bộ lọc danh mục
        const { products, totalItems } = await productModel.getAllProductWithPagination(offset, itemsPerPage, category, query);

        if (products && products.length > 0) {
            // Định dạng giá cho từng sản phẩm
            products.forEach(product => {  
                product.gia = formatPrice(product.gia);
            });
        }

        // Lấy danh sách danh mục
        const categories = await productModel.getAllNhom();

        // Tính tổng số trang
        const totalPages = Math.ceil(totalItems / itemsPerPage);

        res.render('home', {
            data: {
                title: 'Sản phẩm',
                page: 'product',
                products: products,
                currentPage: page,
                totalPages: totalPages,
                limit: itemsPerPage,
                categories: categories,
                selectedCategory: category,
                query: query,
            },
        });
    } catch (error) {
        console.error('Lỗi khi lấy sản phẩm:', error);
        res.status(500).send('Lỗi server');
    }
};


const searchAndPaginateProducts = async (req, res) => {
    const query = req.query.query || ''; // Từ khóa tìm kiếm
    const category = req.query.category || ''; // Danh mục sản phẩm
    const page = parseInt(req.query.page) || 1; // Trang hiện tại
    const itemsPerPage = 5; // Số sản phẩm mỗi trang

    try {
        // Lấy danh mục sản phẩm
        const categories = await productModel.getAllNhom();

        // Tìm kiếm và phân trang sản phẩm
        const { products, totalItems } = await productModel.searchAndPaginateProducts(query, category, page, itemsPerPage);

        if (products && products.length > 0) {
            // Định dạng giá cho từng sản phẩm
            products.forEach(product => {
                product.gia = formatPrice(product.gia);
            });
        }

        res.render('home', {
            data: {
                title: 'Danh sách sản phẩm',
                page: 'productSearch',
                products: products,
                currentPage: page,
                totalPages: Math.ceil(totalItems / itemsPerPage),
                query: query,
                selectedCategory: category, // Lưu danh mục đã chọn
                categories: categories,
                limit: itemsPerPage
            },
        });
    } catch (error) {
        console.error('Lỗi khi tìm kiếm và phân trang sản phẩm:', error);
        res.status(500).send('Lỗi server khi tìm kiếm và phân trang sản phẩm');
    }
};

//Lấy tất cả sản phẩm người dùng
const getAllProducts = async (req, res) => {
    try {
        const products = await productModel.getAllProduct();
        res.json(products);
        // // Trả về thông điệp và sản phẩm
        // res.status(200).json({
        //     message: "Dữ liệu sản phẩm",
        //     products: products
        // });
    } catch (error) {
        console.error('Lỗi khi lấy sản phẩm:', error);
        res.status(500).send('Lỗi server');
    }
};

// Lấy danh sách thể loại và nhà xuất bản sản phẩm và render trang thêm sản phẩm
const insertProduct = async (req, res) => {
    try {
        const nhom = await productModel.getAllNhom(); // Lấy danh sách nhóm sản phẩm
        const nxb = await productModel.getAllNxb();   // Lấy danh sách nhà xuất bản
        res.render('home', { 
            data: { 
                title: 'Thêm sản phẩm', 
                page: 'addProduct',
                nhom: nhom,   // Truyền danh sách nhóm sản phẩm vào view
                nxb: nxb     // Truyền danh sách nhà xuất bản vào view
            } 
        });
    } catch (error) {
        console.error('Lỗi khi lấy nhóm sản phẩm:', error);
        res.status(500).send('Lỗi server');
    }
};


// const addProduct = (req, res) => {
//     upload.upload(req, res, async (err) => {  // Đảm bảo sử dụng đúng `upload`
//         if (err) {
//             console.error('Lỗi khi upload file:', err);
//             return res.status(500).send('Lỗi khi tải lên hình ảnh');
//         }

//         const { ten, gia, tacgia, mota, idnxb, idnhom } = req.body;
//         const hinhanh = req.file ? req.file.filename : null;  // Kiểm tra nếu có file hình ảnh

//         if (!ten || !gia || !mota || !idnxb || !idnhom) {
//             return res.status(400).send('Vui lòng điền đầy đủ thông tin sản phẩm.');
//         }

//         try {
//             await productModel.insertProduct(ten, gia, tacgia, hinhanh, mota, idnxb, idnhom);
//             res.redirect('/list-product');  // Sau khi thêm, chuyển hướng đến danh sách sản phẩm
//         } catch (error) {
//             console.error('Lỗi khi thêm sản phẩm:', error);
//             res.status(500).send('Lỗi server khi thêm sản phẩm');
//         }
//     });
// };

const addProduct = (req, res) => {
    upload.upload(req, res, async (err) => {
        if (err) {
            console.error('Lỗi khi upload file:', err);
            return res.status(500).send('Lỗi khi tải lên hình ảnh: ' + err);
        }

        const { ten, gia, tacgia, mota, idnxb, idnhom } = req.body;
        const hinhanh = req.files['hinhanh'] ? req.files['hinhanh'][0].filename : null; // Lấy tên file ảnh chính
        const hinhanhPhu = req.files['new_hinhanhPhu'] ? req.files['new_hinhanhPhu'].map(file => file.filename) : []; // Lấy mảng tên file ảnh phụ

        if (!ten || !gia || !mota || !idnxb || !idnhom) {
            return res.status(400).send('Vui lòng điền đầy đủ thông tin sản phẩm.');
        }

        try {
            // Chuyển mảng hinhanhPhu thành chuỗi JSON để lưu vào cột hinhanh_phu
            const hinhanhPhuJson = hinhanhPhu.length > 0 ? JSON.stringify(hinhanhPhu) : null;

            await productModel.insertProduct(ten, gia, tacgia, hinhanh, mota, idnxb, idnhom, hinhanhPhuJson);
            res.redirect('/list-product');  // Sau khi thêm, chuyển hướng đến danh sách sản phẩm
        } catch (error) {
            console.error('Lỗi khi thêm sản phẩm:', error);
            res.status(500).send('Lỗi server khi thêm sản phẩm');
        }
    });
};

// const detailProduct = async (req, res) => {
//     try {
//         let id = req.params.id;
//         let dataProduct = await productModel.detailProduct(id);

//         if (dataProduct) {
//             // Định dạng giá trước khi truyền dữ liệu đến view
//             dataProduct.giaGoc = formatPrice(dataProduct.giaGoc);
//         }

//         res.render('home', { 
//             data: { 
//                 title: 'Detail Product', 
//                 page: 'detailProduct', 
//                 product: dataProduct 
//             } 
//         });
//     } catch (err) {
//         console.error('Error fetching product details:', err);
//         res.status(500).send('Lỗi khi lấy chi tiết sản phẩm.');
//     }
// };
const detailProduct = async (req, res) => {
    try {
        let id = req.params.id;
        let dataProduct = await productModel.detailProduct(id);

        if (dataProduct) {
            // Định dạng giá trước khi truyền dữ liệu đến view
            dataProduct.giaGoc = formatPrice(dataProduct.giaGoc);
            // Parse hinhanhPhu từ chuỗi JSON thành mảng
            dataProduct.hinhanhPhu = dataProduct.hinhanh_phu ? JSON.parse(dataProduct.hinhanh_phu) : [];
        }

        res.render('home', { 
            data: { 
                title: 'Detail Product', 
                page: 'detailProduct', 
                product: dataProduct 
            } 
        });
    } catch (err) {
        console.error('Error fetching product details:', err);
        res.status(500).send('Lỗi khi lấy chi tiết sản phẩm.');
    }
};

// Đảm bảo rằng API trả về chi tiết sản phẩm đúng với ID
const detailProducts = async (req, res) => {
    let id = req.params.id;
    try {
        let dataProduct = await productModel.detailProduct(id);
        res.json(dataProduct);  // Trả dữ liệu sản phẩm dưới dạng JSON
    } catch (error) {
        console.error('Lỗi khi lấy chi tiết sản phẩm:', error);
        res.status(500).send('Lỗi server khi lấy chi tiết sản phẩm');
    }
};

const increaseView = async (req, res) => {
    const id = req.params.id; // Lấy id từ params
    try {
      // Gọi model để cập nhật lượt xem
      const result = await productModel.increaseViewCount(id);

      if (result.affectedRows > 0) {
        return res.status(200).json({ message: 'Tăng lượt xem thành công!' });
      } else {
        return res.status(404).json({ message: 'Sản phẩm không tồn tại!' });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Lỗi server!' });
    }
};

// // Lấy thông tin sản phẩm và render trang cập nhật sản phẩm
// const editProduct = async (req, res) => {
//     let id = req.params.id;
//     try {
//         let product = await productModel.detailProduct(id);
//         let nhom = await productModel.getAllNhom();  // Lấy tất cả nhóm sản phẩm
//         let nxb = await productModel.getAllNxb(); // Lấy danh sách nhà xuất bản
//         res.render('home', {
//             data: {
//                 title: 'Chỉnh Sửa Sản Phẩm',
//                 page: 'editProduct',
//                 product: product,
//                 nhom: nhom,  // Truyền danh sách nhóm vào view
//                 nxb: nxb     // Truyền danh sách nhà xuất bản vào view
//             }
//         });
//     } catch (error) {
//         console.error('Lỗi khi lấy thông tin sản phẩm:', error);
//         res.status(500).send('Lỗi server');
//     }
// };

const editProduct = async (req, res) => {
    let id = req.params.id;
    try {
        let product = await productModel.detailProduct(id);
        let nhom = await productModel.getAllNhom();  // Lấy tất cả nhóm sản phẩm
        let nxb = await productModel.getAllNxb(); // Lấy danh sách nhà xuất bản
        res.render('home', { 
            data: {
                title: 'Chỉnh Sửa Sản Phẩm',
                page: 'editProduct',
                product: product,
                nhom: nhom,  // Truyền danh sách nhóm vào view
                nxb: nxb     // Truyền danh sách nhà xuất bản vào view
            }
        });
    } catch (error) {
        console.error('Lỗi khi lấy thông tin sản phẩm:', error);
        res.status(500).send('Lỗi server');
    }
};

// // Cập nhật thông tin sản phẩm
// const updateProduct = async (req, res) => {
//     upload.upload(req, res, async (err) => {
//         if (err) {
//             console.error('Lỗi khi upload file:', err);
//             return res.status(500).send('Lỗi khi tải lên hình ảnh');
//         }

//         let id = req.params.id;
//         const { ten, gia, tacgia, mota, idnhom, idnxb } = req.body;
//         const hinhanh = req.file ? req.file.filename : null;  // Kiểm tra nếu có file hình ảnh
//         if (!ten || !gia || !tacgia || !mota || !idnhom || !idnxb) {
//             return res.status(400).send('Vui lòng điền đầy đủ thông tin sản phẩm.');
//         }

//         try {
//             await productModel.updateProduct(id, ten, gia, tacgia, hinhanh, mota, idnhom, idnxb);
//             res.redirect(`/detail-product/${id}`);  // Sau khi cập nhật, chuyển hướng về trang chi tiết sản phẩm
//         } catch (error) {
//             console.error('Lỗi khi cập nhật sản phẩm:', error);
//             res.status(500).send('Lỗi server khi cập nhật sản phẩm');
//         }
//     });
// };

const updateProduct = async (req, res) => {
    upload.upload(req, res, async (err) => {
        if (err) {
            console.error('Lỗi khi upload file:', err);
            return res.status(500).send('Lỗi khi tải lên hình ảnh: ' + err);
        }

        const id = req.params.id;
        const { ten, gia, tacgia, mota, idnhom, idnxb } = req.body;
        const hinhanh = req.files['hinhanh'] ? req.files['hinhanh'][0].filename : null;
        const newHinhanhPhu = req.files['new_hinhanhPhu'] ? req.files['new_hinhanhPhu'].map(file => file.filename) : [];

        // Lấy danh sách hình ảnh phụ hiện tại
        let currentProduct = await productModel.detailProduct(id);
        let existingHinhanhPhu = currentProduct.hinhanh_phu ? JSON.parse(currentProduct.hinhanh_phu || '[]') : [];

        // Lấy danh sách hình ảnh cần giữ lại (từ checkbox keep_images)
        let keepImages = req.body.keep_images ? req.body.keep_images : [];

        // Chỉ giữ lại các ảnh được chọn trong keepImages và thêm ảnh mới (loại bỏ trùng lặp)
        let finalHinhanhPhu = [];
        if (keepImages.length > 0 || newHinhanhPhu.length > 0) {
            finalHinhanhPhu = [...new Set([...keepImages, ...newHinhanhPhu])];
        }

        // Chuyển mảng finalHinhanhPhu thành chuỗi JSON, hoặc null nếu rỗng
        const hinhanhPhuJson = finalHinhanhPhu.length > 0 ? JSON.stringify(finalHinhanhPhu) : null;

        console.log('keepImages:', keepImages);
        console.log('newHinhanhPhu:', newHinhanhPhu);
        console.log('existingHinhanhPhu:', existingHinhanhPhu);
        console.log('finalHinhanhPhu:', finalHinhanhPhu);
        console.log('hinhanhPhuJson:', hinhanhPhuJson);

        try {
            await productModel.updateProduct(id, ten, gia, tacgia, hinhanh, mota, idnhom, idnxb, hinhanhPhuJson);
            // Render the edit page again with updated data
            const updatedProduct = await productModel.detailProduct(id);
            const nhom = await productModel.getAllNhom();
            const nxb = await productModel.getAllNxb();
            res.redirect(`/edit-product/${id}`);
        } catch (error) {
            console.error('Lỗi khi cập nhật sản phẩm:', error);
            res.status(500).send('Lỗi server khi cập nhật sản phẩm');
        }
    });
};

const deleteProduct = async (req, res) => {
    let { masp } = req.body;  // Lấy mã sản phẩm từ body
    if (!masp) {
        return res.status(400).send('Mã sản phẩm không hợp lệ');
    }

    try {
        await productModel.deleteProduct(masp);  // Xóa sản phẩm
        res.redirect('/list-product');  // Chuyển hướng về danh sách sản phẩm
    } catch (error) {
        console.error('Lỗi khi xóa sản phẩm:', error);
        res.status(500).send('Lỗi server khi xóa sản phẩm');
    }
};

// Thêm phương thức lấy tất cả nhóm sản phẩm
const getAllNhom = async (req, res) => {
    try {
        const nhom = await productModel.getAllNhom(); // Lấy danh sách nhóm sản phẩm từ model
        res.json(nhom);  // Trả về danh sách nhóm sản phẩm dưới dạng JSON
    } catch (error) {
        console.error('Lỗi khi lấy nhóm sản phẩm:', error);
        res.status(500).send('Lỗi server khi lấy nhóm sản phẩm');
    }
};
// Thêm phương thức lấy tất cả nhà xuất bản
const getAllNxb = async (req, res) => {
    try {
        const nxb = await productModel.getAllNxb(); // Lấy danh sách nhóm sản phẩm từ model
        res.json(nxb);  // Trả về danh sách nhóm sản phẩm dưới dạng JSON
    } catch (error) {
        console.error('Lỗi khi lấy nhóm sản phẩm:', error);
        res.status(500).send('Lỗi server khi lấy nhóm sản phẩm');
    }
};
// Tìm sản phẩm theo nhóm
const getProductsByGroup = async (req, res) => {
    const { matheloai } = req.params;
    try {
        const products = await productModel.getProductsByGroup(matheloai); // Lấy sản phẩm theo id nhóm
        res.json(products);  // Trả về danh sách sản phẩm theo nhóm
    } catch (error) {
        console.error('Lỗi khi tìm sản phẩm theo nhóm:', error);
        res.status(500).send('Lỗi server khi tìm sản phẩm theo nhóm');
    }
};

// Lấy sản phẩm theo phân trang
const getPaginatedProducts = async (req, res) => {
    const page = parseInt(req.query.page) || 1; // Trang hiện tại (mặc định là 1)
    const itemsPerPage = parseInt(req.query.limit) || 10; // Số sản phẩm mỗi trang (mặc định là 10)

    try {
        const { products, totalItems } = await productModel.getProductsByPage(page, itemsPerPage);

        res.json({
            currentPage: page,
            totalPages: Math.ceil(totalItems / itemsPerPage),
            totalItems,
            products
        });
    } catch (error) {
        console.error('Lỗi khi phân trang sản phẩm:', error);
        res.status(500).send('Lỗi server khi phân trang sản phẩm');
    }
};

// Tìm sản phẩm theo từ khóa
const searchProducts = async (req, res) => {
    const { query } = req.query;  // Lấy từ khóa tìm kiếm từ query string
    if (!query) {
        return res.status(400).send('Vui lòng cung cấp từ khóa tìm kiếm');
    }

    try {
        const products = await productModel.searchProducts(query);  // Gọi hàm tìm kiếm từ model

        if (products.length === 0) {
            return res.status(404).send('Không tìm thấy sản phẩm');
        }

        res.status(200).json({
            message: "Sản phẩm tìm thấy",
            products: products
        });
    } catch (error) {
        console.error('Lỗi khi tìm kiếm sản phẩm:', error);
        res.status(500).send('Lỗi server khi tìm kiếm sản phẩm');
    }
};
// Lấy bình luận của sách
const getComments = async (req, res) => {
    const bookId = req.params.id;  // Lấy mã sách từ tham số URL
    try {
        const comments = await productModel.getCommentsByBookId(bookId);
        res.json(comments);  // Trả về danh sách bình luận
    } catch (error) {
        console.error('Lỗi khi lấy bình luận:', error);
        res.status(500).send('Lỗi server khi lấy bình luận');
    }
};

// Thêm bình luận cho sách
const addComment = async (req, res) => {
    const bookId = req.params.id;  // Lấy mã sách từ tham số URL
    const { content } = req.body;  // Bình luận gửi từ frontend
    const userId = req.userId;  // Giả sử bạn đã có manguoidung trong session hoặc token
    console.log("UserId từ middleware:", req.userId);
    if (!content) {
        return res.status(400).send('Bình luận không được để trống');
    }

    if (!userId) {
        return res.status(400).send('Vui lòng đăng nhập để bình luận');
    }

    try {
        await productModel.addComment(bookId, content, userId);
        res.status(201).send('Bình luận đã được thêm');
    } catch (error) {
        console.error('Lỗi khi thêm bình luận:', error);
        res.status(500).send('Lỗi server khi thêm bình luận');
    }
};

const updateComment = async (req, res) => {
    const commentId = req.params.commentId; // ID bình luận từ URL
    const { content } = req.body;   // Nội dung sửa bình luận
    const userId = req.userId;     // Lấy ID người dùng từ middleware

    if (!content) return res.status(400).send('Bình luận không được để trống.');

    try {
        const updated = await productModel.updateComment(commentId, content, userId);
        if (!updated) return res.status(403).send('Bạn không có quyền sửa bình luận này.');
        res.status(200).send('Bình luận đã được cập nhật.');
    } catch (error) {
        console.error('Lỗi khi sửa bình luận:', error);
        res.status(500).send('Lỗi server khi sửa bình luận.');
    }
};

const deleteComment = async (req, res) => {
    const commentId = req.params.commentId; // ID bình luận từ URL
    const userId = req.userId;     // Lấy ID người dùng từ middleware

    try {
        const deleted = await productModel.deleteComment(commentId, userId);
        if (!deleted) return res.status(403).send('Bạn không có quyền xóa bình luận này.');
        res.status(200).send('Bình luận đã được xóa.');
    } catch (error) {
        console.error('Lỗi khi xóa bình luận:', error);
        res.status(500).send('Lỗi server khi xóa bình luận.');
    }
};

const getHighlightedProducts = async (req, res) => {
    try {
        const topViewedProducts = await productModel.getTopViewedProducts(); // Lượt xem nhiều nhất
        const discountedProducts = await productModel.getDiscountedProducts(); // Sản phẩm giảm giá
        const newProducts = await productModel.getNewProducts(); //Sản phẩm mới nhất

        res.json({
            topViewed: topViewedProducts,
            discounted: discountedProducts,
            new: newProducts
        });
    } catch (error) {
        console.error('Lỗi khi lấy sản phẩm nổi bật:', error);
        res.status(500).send('Lỗi server khi lấy sản phẩm nổi bật');
    }
};
const saveViewedProduct = async (req, res) => {
    const { manguoidung, masach } = req.body;

    if (!manguoidung || !masach) {
        return res.status(400).json({ message: 'Thiếu thông tin người dùng hoặc sản phẩm.' });
    }

    try {
        await productModel.saveViewedProduct(manguoidung, masach);
        res.status(200).json({ message: 'Đã lưu lịch sử xem.' });
    } catch (error) {
        console.error('Lỗi khi lưu lịch sử xem:', error);
        res.status(500).json({ message: 'Lỗi server.' });
    }
};

const getViewedProducts = async (req, res) => {
    const { manguoidung } = req.params;

    if (!manguoidung) {
        return res.status(400).json({ message: 'Thiếu thông tin người dùng.' });
    }

    try {
        const viewedProducts = await productModel.getViewedProducts(manguoidung);
        res.status(200).json(viewedProducts);
    } catch (error) {
        console.error('Lỗi khi lấy lịch sử xem:', error);
        res.status(500).json({ message: 'Lỗi server.' });
    }
};

// Trong ProductController.js
const getSimilarProducts = async (req, res) => {
    const { matheloai, tacgia } = req.query;
    try {
        const products = await productModel.getSimilarProducts(matheloai, tacgia);
        res.json(products.slice(0, 4)); // Giới hạn 5 sản phẩm
    } catch (error) {
        console.error('Lỗi khi lấy sản phẩm tương tự:', error);
        res.status(500).send('Lỗi server');
    }
};

const getRecommendedProducts = async (req, res) => {
    const { masach } = req.params;
    const manguoidung = req.userId; // Lấy từ middleware auth
    try {
        const recommendedProducts = await productModel.getRecommendedProducts(masach, manguoidung);
        res.json(recommendedProducts);
    } catch (error) {
        console.error('Lỗi khi lấy sản phẩm gợi ý:', error);
        res.status(500).send('Lỗi server khi lấy sản phẩm gợi ý');
    }
};

const getProductsByMultipleGroups = async (req, res) => {
    const { groups } = req.query;
    try {
      if (!groups) {
        // Nếu không có groups, trả về tất cả sản phẩm
        const products = await productModel.getAllProduct();
        return res.json(products);
      }
  
      const groupIds = groups.split(',').map((id) => parseInt(id));
      const products = await productModel.getProductsByMultipleGroups(groupIds);
      res.json(products);
    } catch (error) {
      console.error('Lỗi khi lấy sản phẩm theo nhiều nhóm:', error);
      res.status(500).send('Lỗi server khi lấy sản phẩm theo nhiều nhóm');
    }
  };

export default { getProductsByMultipleGroups, getRecommendedProducts, getSimilarProducts, getViewedProducts, saveViewedProduct, getHighlightedProducts, deleteComment, updateComment, increaseView ,getAllProduct, insertProduct, addProduct, detailProduct, editProduct, updateProduct, deleteProduct, getAllProducts, detailProducts, getAllNhom, getProductsByGroup, getAllNxb, getPaginatedProducts, searchProducts, getComments, addComment, searchAndPaginateProducts};
 