import orderModel from '../services/oderModel.js';
import productModel from '../services/productModel.js';
import { formatPrice } from '../utils/utils.js';
import crypto from 'crypto';
import querystring from 'querystring';
// // Đặt hàng mới
// const placeOrder = async (req, res) => {
//     try {
//         const { userid, ngaydat, trangthai, tonggia, diachinhanhang, chitietdonhang } = req.body;

//         // Thêm đơn hàng vào bảng `donhang`
//         const madh = await orderModel.insertOrder({
//             userid,
//             ngaydat,
//             trangthai,
//             tonggia,
//             diachinhanhang,
//         });

//         // Thêm chi tiết đơn hàng vào bảng `chitietdonhang`
//         const orderDetails = chitietdonhang.map(detail => ({
//             madh,
//             masach: detail.masach,
//             gia: detail.gia,
//             soluong: detail.soluong,
//         }));
//         await orderModel.insertOrderDetails(orderDetails);

//         res.status(200).json({ message: 'Đặt hàng thành công', madh });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Lỗi đặt hàng', error });
//     }
// };

// Lấy danh sách đơn hàng theo người dùng
const getUserOrders = async (req, res) => {
    try {
        const { userid } = req.params;
        const orders = await orderModel.getOrdersByUserId(userid);
        res.status(200).json({ orders });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi lấy danh sách đơn hàng', error });
    }
};

// Lấy chi tiết đơn hàng
const getOrderDetails = async (req, res) => {
    try {
        const { madh } = req.params;
        const details = await orderModel.getOrderDetails(madh);
        
        // Kiểm tra nếu không có sản phẩm trong chi tiết đơn hàng
        if (details.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy chi tiết đơn hàng' });
        }

        // Tạo đối tượng order để gửi về cho frontend
        const order = {
            madh: madh,
            trangthai: details[0].trangthai,
            ngaydat: details[0].ngaydat,  // Giả sử ngày đặt là chung cho tất cả sản phẩm
            gia: details.reduce((total, item) => total + item.gia * item.soluong, 0),  // Tính tổng tiền
            products: details.map(item => ({
                masach: item.masach,
                tensach: item.tensach,
                gia:item.gia,
                hinhanh: item.hinhanh,
                soluong: item.soluong,
            }))
        };

        res.status(200).json({ details: order });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi lấy chi tiết đơn hàng', error });
    }
};


// Order Admin
// Lấy danh sách đơn hàng
const getOrders = async (req, res) => {
    const page = parseInt(req.query.page) || 1; // Trang hiện tại, mặc định là trang 1
    const itemsPerPage = 5; // Số đơn hàng hiển thị mỗi trang
    const offset = (page - 1) * itemsPerPage; // Vị trí bắt đầu
    const status = req.query.status || ''; // Trạng thái đơn hàng (chờ xử lý, đã duyệt, đã hủy)

    try {
        // Lấy danh sách đơn hàng từ model, với lọc theo trạng thái và phân trang
        const { rows, count } = await orderModel.getOrders(offset, itemsPerPage, status);

        // Tính tổng số trang
        const totalPages = Math.ceil(count / itemsPerPage);

        res.render('home', { 
            data: { 
                title: 'Đơn hàng', 
                page: 'order', 
                orders: rows, // Truyền danh sách đơn hàng
                currentPage: page,
                totalPages: totalPages,
                status: status, // Truyền trạng thái lọc để hiển thị lại trong filter
                limit: itemsPerPage
            } 
        });
    } catch (error) {
        console.error('Lỗi khi lấy danh sách đơn hàng:', error);
        res.status(500).render('home', { 
            data: { 
                title: 'Đơn hàng', 
                page: 'order', 
                orders: [], 
                error: 'Không thể lấy danh sách đơn hàng!'
            } 
        });
    }
};

// // Duyệt hoặc hủy đơn hàng
// const updateOrderStatus = async (req, res) => {
//     try {
//         const { madh } = req.body;  // Lấy mã đơn hàng từ form
//         const status = req.url.includes('approve') ? '2' : '3';  // Duyệt là 2, Hủy là 3

//         const isUpdated = await orderModel.updateOrderStatus(madh, status);

//         if (isUpdated) {
//             const message = status === '2' ? 'Duyệt' : 'Hủy';
//             res.redirect('/list-orders');  // Chuyển hướng về trang danh sách đơn hàng
//         } else {
//             res.status(400).json({ message: 'Cập nhật trạng thái đơn hàng thất bại' });
//         }
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Lỗi khi cập nhật trạng thái đơn hàng', error });
//     }
// };

const updateOrderStatus = async (req, res) => {
    try {
      const { madh } = req.body;
      const status = req.url.includes("approve") ? "2" : "3"; // Duyệt là 2, Hủy là 3
  
      const isUpdated = await orderModel.updateOrderStatus(madh, status);
  
      if (isUpdated && status === "2") {
        // Nếu duyệt đơn hàng, trừ tồn kho
        const orderDetails = await orderModel.getOrderDetails(madh);
        for (const detail of orderDetails) {
          await productModel.updateStock(detail.masach, detail.soluong);
        }
      }
  
      if (isUpdated) {
        const message = status === "2" ? "Duyệt" : "Hủy";
        res.redirect("/list-orders");
      } else {
        res.status(400).json({ message: "Cập nhật trạng thái đơn hàng thất bại" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Lỗi khi cập nhật trạng thái đơn hàng", error });
    }
  };

const detailOrder = async (req, res) => {
    let madh = req.params.madonhang; // Mã đơn hàng (madh)
    let detailCart = await orderModel.getOrderDetails(madh); // Lấy chi tiết đơn hàng
    console.log(detailCart); // Để kiểm tra thông tin chi tiết đơn hàng trong console
    res.render('home', { 
        data: { 
            title: 'Chi tiết đơn hàng', 
            page: 'detailOrder', 
            detailCarts: detailCart 
        } 
    });
};

// Cấu hình VNPay
const vnp_TmnCode = "U7E7T1EO";
const vnp_HashSecret = "CQOTX3ZU5CXMOWP5I88WYC49ZW7RUHI3";
const vnp_Url = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
const vnp_ReturnUrl = "http://localhost:4000/payment-return";

const getVietnamISOString = () => {
    // Lấy thời gian theo múi giờ Việt Nam
    const vietnamTime = new Date().toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' });
    const date = new Date(vietnamTime);

    // Định dạng thủ công thành YYYY-MM-DD HH:mm:ss
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Tháng bắt đầu từ 0
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

// Đặt hàng mới
const placeOrder = async (req, res) => {
    try {
        const { userid, ngaydat, trangthai, tonggia, diachinhanhang, chitietdonhang, phuongthucthanhtoan } = req.body;

        // Thêm đơn hàng vào bảng `donhang`
        const madh = await orderModel.insertOrder({
            userid,
            ngaydat: getVietnamISOString(),
            trangthai,
            tonggia,
            diachinhanhang,
        });

        // Thêm chi tiết đơn hàng vào bảng `chitietdonhang`
        const orderDetails = chitietdonhang.map(detail => ({
            madh,
            masach: detail.masach,
            gia: detail.gia,
            soluong: detail.soluong,
        }));
        await orderModel.insertOrderDetails(orderDetails);

        // Thêm thông tin thanh toán vào bảng `thanh_toan`
        const paymentData = {
            madonhang: madh,
            phuongthucthanhtoan,
            ngaythanhtoan: phuongthucthanhtoan === "COD" ? null : getVietnamISOString(),
            trangthai: phuongthucthanhtoan === "COD" ? "Chưa thanh toán" : "Đã thanh toán",
            magiaodichnganhang: null,
            sotien: Number(tonggia), // Thêm số tiền từ tonggia
        };
        await orderModel.insertPayment(paymentData);

        res.status(200).json({ message: 'Đặt hàng thành công', madh });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi đặt hàng', error });
    }
};

const createPaymentUrl = async (req, res) => {
    try {
        const { madh, amount, returnUrl } = req.body;

        // Kiểm tra dữ liệu đầu vào
        if (!madh || !amount || isNaN(amount) || amount <= 0) {
            return res.status(400).json({ message: 'Dữ liệu không hợp lệ: madh hoặc amount không đúng.' });
        }

        // Chuẩn hóa dữ liệu
        const vnpAmount = Math.round(Number(amount) * 100); // Đảm bảo vnp_Amount là số nguyên
        const vnpTxnRef = String(madh); // Đảm bảo vnp_TxnRef là chuỗi

        let vnp_Params = {};
        vnp_Params['vnp_Version'] = '2.1.0';
        vnp_Params['vnp_Command'] = 'pay';
        vnp_Params['vnp_TmnCode'] = vnp_TmnCode;
        vnp_Params['vnp_Amount'] = vnpAmount;
        vnp_Params['vnp_CreateDate'] = getVietnamISOString().replace(/[^0-9]/g, '').slice(0, 14);
        vnp_Params['vnp_CurrCode'] = 'VND';
        vnp_Params['vnp_IpAddr'] = req.ip || '127.0.0.1';
        vnp_Params['vnp_Locale'] = 'vn';
        vnp_Params['vnp_OrderInfo'] = `Thanh toan don hang ${vnpTxnRef}`.replace(/[^a-zA-Z0-9\s]/g, '');
        vnp_Params['vnp_OrderType'] = 'billpayment';
        vnp_Params['vnp_ReturnUrl'] = returnUrl;
        vnp_Params['vnp_TxnRef'] = vnpTxnRef;

        console.log("vnp_Params before sorting:", vnp_Params);

        vnp_Params = sortObject(vnp_Params);

        console.log("vnp_Params after sorting:", vnp_Params);

        // Tạo signData thủ công
        const signData = Object.keys(vnp_Params)
            .map(key => `${key}=${encodeURIComponent(vnp_Params[key]).replace(/%20/g, '+')}`)
            .join('&');
        console.log("signData:", signData);

        const hmac = crypto.createHmac('sha512', vnp_HashSecret);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
        vnp_Params['vnp_SecureHash'] = signed;

        console.log("vnp_SecureHash:", signed);

        // Tạo paymentUrl
        const paymentUrl = vnp_Url + '?' + querystring.stringify(vnp_Params);
        console.log("paymentUrl:", paymentUrl);

        res.status(200).json({ paymentUrl });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi tạo URL thanh toán', error });
    }
};

const paymentReturn = async (req, res) => {
    try {
        let vnp_Params = req.query;
        const secureHash = vnp_Params['vnp_SecureHash'];

        // Xóa các tham số không cần thiết để tạo hash
        delete vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHashType'];

        // Sắp xếp các tham số theo thứ tự alphabet
        vnp_Params = sortObject(vnp_Params);

        // Tạo chuỗi signData thủ công
        const signData = Object.keys(vnp_Params)
            .map(key => `${key}=${encodeURIComponent(vnp_Params[key]).replace(/%20/g, '+')}`)
            .join('&');

        console.log("signData:", signData); // Log để kiểm tra

        // Tạo hash với vnp_HashSecret
        const hmac = crypto.createHmac('sha512', vnp_HashSecret);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

        console.log("Generated hash (signed):", signed); // Log để kiểm tra
        console.log("Received hash (secureHash):", secureHash); // Log để kiểm tra

        const madh = vnp_Params['vnp_TxnRef'];
        const magiaodichnganhang = vnp_Params['vnp_TransactionNo'];

        // Lấy tonggia từ bảng donhang
        const order = await orderModel.getOrderById(madh);
        if (!order) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
        }
        const tonggia = order.tonggia;

        if (secureHash === signed) {
            if (vnp_Params['vnp_ResponseCode'] === '00') {
                // Thanh toán thành công
                await orderModel.updatePayment(madh, {
                    ngaythanhtoan: getVietnamISOString(),
                    trangthai: "Đã thanh toán",
                    magiaodichnganhang,
                    sotien: Number(tonggia),
                });
                res.redirect('http://localhost:3000/payment-success?madh=' + madh); // Thêm domain đầy đủ
            } else {
                // Thanh toán thất bại
                await orderModel.updatePayment(madh, {
                    ngaythanhtoan: getVietnamISOString(),
                    trangthai: "Thất bại",
                    magiaodichnganhang,
                    sotien: Number(tonggia),
                });
                res.redirect('http://localhost:3000/payment-failure?madh=' + madh); // Thêm domain đầy đủ
            }
        } else {
            res.status(400).json({ message: 'Chữ ký không hợp lệ' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi xử lý kết quả thanh toán', error });
    }
};

// Hàm sắp xếp object theo key
function sortObject(obj) {
    const sorted = {};
    const keys = Object.keys(obj).sort();
    keys.forEach(key => {
        sorted[key] = obj[key];
    });
    return sorted;
}
export default {createPaymentUrl, paymentReturn, sortObject, placeOrder, getUserOrders, getOrderDetails, getOrders, updateOrderStatus, detailOrder}