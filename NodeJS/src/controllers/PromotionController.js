import cron from 'node-cron';
import promotionModel from '../services/promotionModel.js';

const getAddPromotionPage = (req, res) => {
    res.render('home', { data: { title: "Thêm phiếu giảm giá", page: 'addPromotion' } });
};

const addPromotion = async (req, res) => {
    try {
        const { promotionName, discountPercentage, startDate, endDate } = req.body;

        // Tạo phiếu giảm giá mới
        await promotionModel.createPromotion({
            tenkhuyenmai: promotionName,
            phantramgiamgia: discountPercentage,
            ngaybatdau: startDate,
            ngayketthuc: endDate
        });

        // Sau khi tạo thành công, chuyển hướng đến danh sách khuyến mãi
        res.redirect('/list-promotion');
    } catch (err) {
        console.error(err);
        res.status(500).send('Lỗi khi tạo phiếu khuyến mãi');
    }
};
const getPromotionList = async (req, res) => {
    try {
        const { page = 1, search = '' } = req.query; // Lấy giá trị page và search từ query
        const limit = 5; // Số lượng khuyến mãi mỗi trang

        // Lấy danh sách khuyến mãi có tìm kiếm và phân trang
        const { promotions, totalItems } = await promotionModel.getPromotionsWithSearchAndPagination(search, page, limit);

        res.render('home', {
            data: {
                title: "Danh sách phiếu khuyến mãi",
                page: 'listPromotion',
                promotions,
                search,
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalItems / limit),
                limit,
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Lỗi khi lấy danh sách khuyến mãi');
    }
};


// Hiển thị trang sửa khuyến mãi
const getEditPromotionPage = async (req, res) => {
    try {
        const { promotionId } = req.params;
        const promotion = await promotionModel.getPromotionById(promotionId);

        // Định dạng ngày bắt đầu và ngày kết thúc cho datetime-local
        const formatDateForInput = (date) => {
            const d = new Date(date);
            const year = d.getFullYear();
            const month = ('0' + (d.getMonth() + 1)).slice(-2); // Đảm bảo tháng có 2 chữ số
            const day = ('0' + d.getDate()).slice(-2); // Đảm bảo ngày có 2 chữ số
            const hours = ('0' + d.getHours()).slice(-2); // Đảm bảo giờ có 2 chữ số
            const minutes = ('0' + d.getMinutes()).slice(-2); // Đảm bảo phút có 2 chữ số
            return `${year}-${month}-${day}T${hours}:${minutes}`;
        };
    
        const formattedStartDate = formatDateForInput(promotion.ngaybatdau);
        const formattedEndDate = formatDateForInput(promotion.ngayketthuc);

        res.render('home', { data: { title: "Sửa khuyến mãi", page: 'editPromotion', promotion: {
            ...promotion,
            formattedStartDate,
            formattedEndDate
        } } });
    } catch (err) {
        console.error(err);
        res.status(500).send('Lỗi khi lấy khuyến mãi');
    }
};

// Cập nhật khuyến mãi
const editPromotion = async (req, res) => {
    try {
        const { promotionId } = req.params;
        const { promotionName, discountPercentage, startDate, endDate } = req.body;
        
        await promotionModel.updatePromotion(promotionId, {
            tenkhuyenmai: promotionName,
            phantramgiamgia: discountPercentage,
            ngaybatdau: startDate,
            ngayketthuc: endDate
        });
        
        res.redirect('/list-promotion');
    } catch (err) {
        console.error(err);
        res.status(500).send('Lỗi khi cập nhật khuyến mãi');
    }
};

// Xóa khuyến mãi
const deletePromotion = async (req, res) => {
    try {
        const { promotionId } = req.params;
        await promotionModel.deletePromotion(promotionId);
        res.redirect('/list-promotion');
    } catch (err) {
        console.error(err);
        res.status(500).send('Lỗi khi xóa khuyến mãi');
    }
};

const getApplyPromotionPage = async (req, res) => {
    try {
        const { page = 1, search = '', message = '', messageType = '' } = req.query;
        const limit = 5; // Số sản phẩm mỗi trang

        // Lấy danh sách sản phẩm có tìm kiếm và phân trang
        const { products, totalItems } = await promotionModel.getProductsWithPromotionAndSearch(search, page, limit);
        const promotions = await promotionModel.getAllPromotions();

        res.render('home', {
            data: {
                title: "Áp dụng phiếu giảm giá",
                page: 'applyPromotion',
                products,
                promotions,
                search,
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalItems / limit),
                limit,
                message,
                messageType, // Truyền thêm messageType để xác định kiểu thông báo (thành công hoặc lỗi)
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Lỗi khi lấy dữ liệu');
    }
};

const applyPromotion = async (req, res) => {
    try {
        const { productId, promotionId } = req.body;

        // Kiểm tra khuyến mãi còn hợp lệ
        const isValidPromotion = await promotionModel.isPromotionValid(promotionId);
        if (!isValidPromotion) {
            return res.redirect('/apply-promotion?message=Khuyến mãi không hợp lệ hoặc đã hết hạn.&messageType=danger');
        }

        if (productId === 'all') {
            // Áp dụng khuyến mãi cho tất cả sản phẩm
            const products = await promotionModel.getAllBooks(); // Lấy tất cả sản phẩm
            const tasks = products.map(async (product) => {
                const isAlreadyPromoted = await promotionModel.checkPromotionForProduct(product.masach);
                if (!isAlreadyPromoted) {
                    await promotionModel.applyPromotionToProduct(promotionId, product.masach);
                }
            });

            // Chờ tất cả các tác vụ áp dụng khuyến mãi hoàn thành
            await Promise.all(tasks);
            return res.redirect('/apply-promotion?message=Áp dụng khuyến mãi cho tất cả sản phẩm thành công.&messageType=success');
        } else {
            // Kiểm tra sản phẩm đã có khuyến mãi
            const isAlreadyPromoted = await promotionModel.checkPromotionForProduct(productId);
            if (isAlreadyPromoted) {
                return res.redirect('/apply-promotion?message=Sản phẩm đã áp dụng khuyến mãi!&messageType=danger');
            }

            // Áp dụng khuyến mãi cho sản phẩm đã chọn
            await promotionModel.applyPromotionToProduct(promotionId, productId);
            return res.redirect('/apply-promotion?message=Áp dụng khuyến mãi cho sản phẩm thành công.&messageType=success');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Lỗi khi áp dụng khuyến mãi');
    }
};

const removePromotion = async (req, res) => {
    try {
        const { productId } = req.body;

        // Kiểm tra sản phẩm có khuyến mãi hay không
        const isAlreadyPromoted = await promotionModel.checkPromotionForProduct(productId);
        if (!isAlreadyPromoted) {
            return res.status(400).send('Sản phẩm không có khuyến mãi để xóa!');
        }

        // Xóa khuyến mãi khỏi sản phẩm
        await promotionModel.removePromotionFromProduct(productId);

        res.redirect('/apply-promotion');
    } catch (err) {
        console.error(err);
        res.status(500).send('Lỗi khi xóa khuyến mãi');
    }
};


cron.schedule('* * * * * *', async () => {
    // console.log('Đang dọn dẹp khuyến mãi hết hạn...');
    await promotionModel.cleanUpExpiredPromotions();
});

export default {getPromotionList, getAddPromotionPage, addPromotion, getEditPromotionPage, editPromotion, deletePromotion, getApplyPromotionPage, applyPromotion, removePromotion};