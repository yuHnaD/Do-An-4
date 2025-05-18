import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";  // Import useNavigate
import { formatPrice } from "../../utils/utils";

function OrderDetail() {
    const { madh } = useParams();  // Lấy orderId từ URL
    const [order, setOrder] = useState(null);
    const navigate = useNavigate();  // Khởi tạo hook navigate

    useEffect(() => {
        const fetchOrderDetail = async () => {
            try {
                const response = await axios.get(`http://localhost:4000/api/order-details/${madh}`, {
                    withCredentials: true,
                });
                // Cập nhật state với dữ liệu chi tiết đơn hàng
                console.log(response.data.details);  // Kiểm tra dữ liệu trả về từ API
                setOrder(response.data.details); 
            } catch (error) {
                console.error("Error fetching order details:", error);
            }
        };

        fetchOrderDetail();
    }, [madh]);

    // Hàm quay lại danh sách đơn hàng
    const handleBackToOrders = () => {
        navigate("/orders");  // Chuyển hướng về trang danh sách đơn hàng
    };

    // Hàm chuyển trạng thái mã thành mô tả
    const getStatusText = (status) => {
        switch(status) {
            case '1': return "Chờ xử lý";
            case '2': return "Đã duyệt";
            case '3': return "Đã hủy";
            default: return "Không xác định";
        }
    };

    return (
        <div className="container mt-4">
            {order ? (
                <>
                    <h2 className="mb-4">Chi tiết đơn hàng</h2>
                    <div className="mb-3">
                        {/* <h4 className="text-dark">Mã đơn hàng: <span className="text-secondary">{order.madh}</span></h4> */}
                        <p><strong>Trạng thái:</strong> {getStatusText(order.trangthai)}</p> {/* Hiển thị trạng thái theo mã */}
                        <p><strong>Ngày đặt:</strong> {new Date(order.ngaydat).toLocaleDateString() || "Ngày không hợp lệ"}</p>
                        <p><strong>Tổng tiền:</strong> {formatPrice(order.gia)}</p>
                    </div>

                    <h4 className="mb-3">Danh sách sản phẩm</h4>
                    <div className="table-responsive">
                        <table className="table table-striped">
                            <thead>
                                <tr>
                                    <th className="text-center">STT</th>
                                    <th className="text-center">Hình ảnh</th>
                                    <th className="text-center">Tên sách</th>
                                    <th className="text-center">Số lượng</th>
                                    <th className="text-center">Đơn giá</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Hiển thị sản phẩm nếu có */}
                                {order.products && order.products.length > 0 ? (
                                    order.products.map((product, index) => (
                                        <tr key={product.masach}>
                                            <td className="text-center align-middle">{index + 1}</td>
                                            <td className="text-center align-middle">
                                                <img
                                                    src={`http://localhost:4000/uploads/${product.hinhanh}`}
                                                    alt={product.tensach}
                                                    className="img-fluid"
                                                    style={{ width: "50px", height: "50px", objectFit: "cover" }}
                                                />
                                            </td>
                                            <td className="align-middle">{product.tensach}</td>
                                            <td className="text-center align-middle">{product.soluong}</td>
                                            <td className="text-center align-middle">{formatPrice(product.gia)}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center text-muted">Không có sản phẩm trong đơn hàng.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Nút quay lại */}
                    <button className="btn btn-primary" onClick={handleBackToOrders}>Quay lại danh sách đơn hàng</button>
                </>
            ) : (
                <p className="text-center">Đang tải chi tiết đơn hàng...</p>
            )}
        </div>
    );
}

export default OrderDetail;
