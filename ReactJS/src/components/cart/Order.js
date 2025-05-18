// import { useEffect, useState } from "react"; 
// import axios from "axios";
// import { Link } from "react-router-dom";
// import { formatPrice } from "../../utils/utils";

// function Order() {
//     const [orders, setOrders] = useState([]);
//     const userid = localStorage.getItem("userid"); // Lấy userid từ localStorage

//     useEffect(() => {
//         const fetchOrders = async () => {
//             try {
//                 if (!userid) {
//                     console.warn("User ID không tồn tại trong localStorage.");
//                     return;
//                 }
//                 const response = await axios.get(`http://localhost:4000/api/orders/${userid}`, {
//                     withCredentials: true,
//                 });
//                 setOrders(response.data.orders); // Giả sử API trả về một mảng orders
//             } catch (error) {
//                 console.error("Error fetching orders:", error);
//             }
//         };

//         if (userid) {
//             fetchOrders();
//         }
//     }, [userid]);

//     return (
//         <div className="container mt-4">
//             <h2 className="mb-4">Danh sách đơn hàng</h2>
            
//             {/* Kiểm tra xem có đơn hàng hay không */}
//             {orders.length > 0 ? (
//                 <div className="table-responsive">
//                     <table className="table table-striped table-bordered">
//                         <thead>
//                             <tr>
//                                 <th>STT</th>
//                                 {/* <th>Mã đơn hàng</th> */}
//                                 <th>Ngày đặt</th>
//                                 <th>Tổng tiền</th>
//                                 <th>Chi tiết</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {/* Hiển thị thông tin đơn hàng */}
//                             {orders.map((order, index) => (
//                                 <tr key={order.madonhang}>
//                                     <td>{index + 1}</td>
//                                     {/* <td>{order.madonhang}</td> */}
//                                     <td>{new Date(order.ngaydat).toLocaleDateString()}</td>
//                                     <td className="text-danger">{formatPrice(order.tonggia)}</td>
//                                     <td>
//                                         <Link to={`/order-details/${order.madonhang}`} className="btn btn-primary btn-sm">Xem chi tiết</Link>
//                                     </td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 </div>
//             ) : (
//                 <div className="alert alert-warning">Không có đơn hàng nào.</div>
//             )}
//             <img src="http://localhost:4000/uploads/order.gif" alt="Image" width="160"  className="fixed-image" />
//         </div>
//     );
// }

// export default Order;
import { useEffect, useState } from "react"; 
import axios from "axios";
import { Link } from "react-router-dom";
import { formatPrice } from "../../utils/utils";

function Order() {
    const [orders, setOrders] = useState([]);
    const userid = localStorage.getItem("userid");

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                if (!userid) {
                    console.warn("User ID không tồn tại trong localStorage.");
                    return;
                }
                const response = await axios.get(`http://localhost:4000/api/orders/${userid}`, {
                    withCredentials: true,
                });
                setOrders(response.data.orders);
            } catch (error) {
                console.error("Error fetching orders:", error);
            }
        };

        if (userid) {
            fetchOrders();
        }
    }, [userid]);

    return (
        <div className="container mt-4">
            <h2 className="mb-4">Danh sách đơn hàng</h2>
            
            {orders.length > 0 ? (
                <div className="table-responsive">
                    <table className="table table-striped table-bordered">
                        <thead>
                            <tr>
                                <th>STT</th>
                                <th>Ngày đặt</th>
                                <th>Tổng tiền</th>
                                <th>Phương thức thanh toán</th>
                                <th>Chi tiết</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order, index) => (
                                <tr key={order.madonhang}>
                                    <td>{index + 1}</td>
                                    <td>{new Date(order.ngaydat).toLocaleDateString()}</td>
                                    <td className="text-danger">{formatPrice(order.tonggia)}</td>
                                    <td>
                                        {order.phuongthucthanhtoan}
                                    </td>
                                    <td>
                                        <Link to={`/order-details/${order.madonhang}`} className="btn btn-primary btn-sm">Xem chi tiết</Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="alert alert-warning">Không có đơn hàng nào.</div>
            )}
            <img src="http://localhost:4000/uploads/order.gif" alt="Image" width="160" className="fixed-image" />
        </div>
    );
}

export default Order;