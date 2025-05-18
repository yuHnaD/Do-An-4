import express from "express";
import getHomePage from '../controllers/HomeController.js';
import userController from '../controllers/UserController.js';
import productController from '../controllers/ProductController.js';
import orderController from '../controllers/OrderController.js';
import categoryController from "../controllers/CategoryController.js";
import warehouseController from "../controllers/WarehouseController.js";
import promotionController from "../controllers/PromotionController.js";
import publishingController from "../controllers/PublishingController.js";
import homeController from "../controllers/HomeController.js";
import storeController from "../controllers/StoreController.js";
import mdw from "../../middleware/upload.js";
import auth from "../../middleware/jwt.js";
const router = express.Router()
const initWebRoute = (app) => {
    router.get('/', auth.isAuth, homeController.filterOrders)

    router.get('/filter-orders', auth.isAuth, homeController.filterOrders);

    router.get('/list-user',  auth.isAuth,userController.getAllUser)

    router.get('/list-user/:username', auth.isAuth, userController.detailUser)

    router.get('/edit-user/:username', auth.isAuth, userController.editUser)

    router.post('/update-user/:username', auth.isAuth, userController.updateUser)

    router.post('/delete-user',  auth.isAuth, userController.deleteUser)

    router.get('/create-new-user', auth.isAuth, userController.createUser)

    router.post('/insert-new-user', auth.isAuth, userController.insertUser)

    //Sản phẩm
    router.get('/list-product', auth.isAuth, productController.getAllProduct);  // Danh sách sản phẩm
    router.get('/add-product', auth.isAuth, productController.insertProduct);  // Trang thêm sản phẩm
    router.post('/add-product', auth.isAuth, productController.addProduct);  // Xử lý thêm sản phẩm
    router.get('/detail-product/:id', auth.isAuth, productController.detailProduct); //Xem chi tiết sản phẩm
    router.get('/edit-product/:id', auth.isAuth, productController.editProduct); // Trang chỉnh sửa sản phẩm
    router.post('/update-product/:id', auth.isAuth, productController.updateProduct); // Xử lý cập nhật sản phẩm
    router.post('/delete-product', auth.isAuth, productController.deleteProduct);
    // router.get('/search', productController.searchAndPaginateProducts);// Route tìm kiếm và phân trang

    //Khuyến mãi
    // Route hiển thị danh sách khuyến mãi
    router.get('/list-promotion', auth.isAuth, promotionController.getPromotionList);
    // Route hiển thị form thêm khuyến mãi cho sản phẩm
    router.get('/import-promotion', auth.isAuth, promotionController.getAddPromotionPage);
    // Route xử lý thêm khuyến mãi cho sản phẩm
    router.post('/add-promotion', auth.isAuth, promotionController.addPromotion);
    // Route để hiển thị trang sửa khuyến mãi
    router.get('/edit-promotion/:promotionId', auth.isAuth, promotionController.getEditPromotionPage);
    // Route để xử lý việc sửa khuyến mãi
    router.post('/edit-promotion/:promotionId', auth.isAuth, promotionController.editPromotion);
    // Route để xóa khuyến mãi
    router.get('/delete-promotion/:promotionId', auth.isAuth, promotionController.deletePromotion);
    router.get('/apply-promotion',  auth.isAuth, promotionController.getApplyPromotionPage);
    router.post('/apply-promotion',  auth.isAuth, promotionController.applyPromotion);
    router.post('/remove-promotion',  auth.isAuth, promotionController.removePromotion);

    
    //Nhập kho
    router.get('/import-warehouse', auth.isAuth, warehouseController.showImportWareHouse);
    // Route xử lý POST khi nhập kho
    router.post('/import-warehouse',  auth.isAuth, warehouseController.importWareHouse);  
    router.get('/search-books',  auth.isAuth, warehouseController.searchBooks); // Route tìm kiếm sản phẩm
    // Route xem danh sách phiếu nhập kho
    router.get('/list-warehouse',  auth.isAuth, warehouseController.showImportWarehouseList);
    // Route xem chi tiết phiếu nhập kho
    router.get('/detail-warehouse/:id',  auth.isAuth, warehouseController.showImportWarehouseDetails);

    //Đăng nhập, đăng xuất
    router.get('/login', userController.loginAdmin)
    router.post('/login', userController.getAdmin)
    // router.post('/api/logoutAPI', userController.logoutAPI);
    router.get('/logout', userController.logout);

    // router.get('/logout', user.logout);

    // router.get('/login', userController.formLoginUser)

    // router.get('/logout', userController.logOut)

    // router.post('/verify-login', userController.loginUser)

    // router.get('/upload-file', userController.uploadFile)

    // router.post('/save-file', userController.saveFileUpload)

    //Đơn hàng
    router.get('/list-orders', auth.isAuth, orderController.getOrders); // Lấy danh sách đơn hàng
    router.get('/order-detail/:madonhang', auth.isAuth, orderController.detailOrder); // Chi tiết đơn hàng
    router.post('/approve-order', auth.isAuth, orderController.updateOrderStatus); // Duyệt đơn hàng
    router.post('/cancel-order', auth.isAuth, orderController.updateOrderStatus); // Hủy đơn hàng
    // router.patch('/orders/:madh/status', orderController.updateOrderStatus); // Duyệt hoặc hủy đơn hàng

    // Danh sách nhóm thể loại
    router.get('/list-category', auth.isAuth, categoryController.getAllNhom);
    // Thêm nhóm thể loại
    router.get('/add-category', auth.isAuth, categoryController.addCategory);
    router.post('/insert-category', auth.isAuth, categoryController.addNhom);
    // Sửa nhóm thể loại
    router.get('/edit-category/:matheloai', auth.isAuth, categoryController.getCategoryForEdit);
    router.post('/edit-category/:matheloai', auth.isAuth, categoryController.updateCategory);
    // Xóa nhóm thể loại
    router.post('/delete-category/:matheloai', auth.isAuth, categoryController.deleteCategory);

    //Nhà xuất bản
    router.get('/list-publishing', auth.isAuth, publishingController.getAllPublishing);
    // Thêm nhóm thể loại
    router.get('/add-publishing', auth.isAuth, publishingController.addPublishing);
    router.post('/insert-publishing', auth.isAuth, publishingController.addPublishings);
    // Sửa nhóm thể loại
    router.get('/edit-publishing/:manhaxuatban', auth.isAuth, publishingController.getPublishingForEdit);
    router.post('/edit-publishing/:manhaxuatban', auth.isAuth, publishingController.updatePublishing);
    // Xóa nhóm thể loại
    router.post('/delete-publishing/:manhaxuatban', auth.isAuth, publishingController.deletePublishing);    

    // API đăng nhập
    router.post('/api/loginUser', userController.loginUser)
    // API đăng ký
    router.post('/api/register',  userController.registerUser)
    // API đăng xuất
    router.get('/api/logoutAPI', userController.logoutAPI);
    // API lấy danh sách sản phẩm
    router.get('/api/product', productController.getAllProducts);
    // API lấy chi tiết sản phẩm
    router.get('/api/detail-product/:id', productController.detailProducts);
    // API lấy chi tiết người dùng
    router.get('/api/detail-user/:userid', userController.getUserDetail);
    // API sửa chi tiết người dùng
    router.post('/api/detail-user/:userid/update', mdw.upload, userController.updateUserDetail);
    // API lấy danh sách nhóm sản phẩm
    router.get('/api/product/groups', productController.getAllNhom);  // Trả về danh sách nhóm thể loại
    router.get('/api/product/group/:matheloai', productController.getProductsByGroup);  // Tìm sản phẩm theo nhóm thể loại
    // API tìm kiếm sản phẩm
    router.get("/api/product/search", productController.searchProducts);
    // API đặt hàng
    router.post('/api/orders', orderController.placeOrder);
    // API lấy danh sách đơn hàng của từng người dùng theo từng
    router.get('/api/orders/:userid', orderController.getUserOrders);
    // API Lấy chi tiết đơn hàng
    router.get('/api/order-details/:madh', orderController.getOrderDetails);
    // Lấy bình luận của sản phẩm
    router.get('/api/comments/:id', productController.getComments);
    // Thêm bình luận cho sản phẩm
    router.post('/api/add-comments/:id',auth.authMiddleware, productController.addComment);
    // API sửa bình luận cho sản phẩm
    router.put('/api/comments/:commentId', auth.authMiddleware, productController.updateComment);
    // API xóa bình luận của sản phẩm
    // Đảm bảo route được định nghĩa đúng
    router.delete('/api/comments/:commentId', auth.authMiddleware,productController.deleteComment);
    // Tăng lượt xem
    router.put('/api/product/increase-view/:id', productController.increaseView);
    //Lấy sản phẩm giảm giá và nhiều lượt xem và mới nhất
    router.get('/api/products/highlighted', productController.getHighlightedProducts);
    // API lưu lịch sử xem
    router.post('/api/viewed-products', auth.authMiddleware, productController.saveViewedProduct);
    // API lấy danh sách sản phẩm đã xem
    router.get('/api/viewed-products/:manguoidung', auth.authMiddleware, productController.getViewedProducts);
    // Trong webRoute.js
    router.get('/api/product/similar', productController.getSimilarProducts);
    // API thanh toán VNPay
    router.post('/api/create-payment', orderController.createPaymentUrl);
    router.get('/payment-return', orderController.paymentReturn);
    // Quản lý cửa hàng (Admin)
    router.get('/list-stores', auth.isAuth, storeController.getAllStores); // Danh sách cửa hàng
    router.get('/add-store', auth.isAuth, mdw.upload, storeController.addStorePage); // Trang thêm cửa hàng
    router.post('/add-store', auth.isAuth, mdw.upload, storeController.addStore); // Xử lý thêm cửa hàng
    router.get('/edit-store/:macuahang', auth.isAuth, storeController.editStorePage);
    router.post('/edit-store/:macuahang', auth.isAuth, mdw.upload, storeController.editStore);
    router.post('/delete-store/:macuahang', auth.isAuth, storeController.deleteStore);
    // API lấy danh sách cửa hàng (cho frontend)
    router.get('/api/stores', storeController.getStoresAPI);
    router.get('/api/recommended-products/:masach', productController.getRecommendedProducts);
    // Trong webRoute.js
    router.get('/api/product/multiple-groups', productController.getProductsByMultipleGroups);
    return app.use('/', router)
}
export default initWebRoute