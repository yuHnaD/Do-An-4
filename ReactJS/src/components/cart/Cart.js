// import React from "react";
// import { useCart } from "../CartContext";
// import { Link } from "react-router-dom";
// import { formatPrice } from "../../utils/utils";
// import { useEffect } from "react";
// import axios from "axios";

// const Cart = () => {
//   const { cart, removeFromCart, updateQuantity, getTotalPrice, updateCartPrices } = useCart();

//   useEffect(() => {
//     const fetchProductUpdates = async () => {
//       try {
//         const response = await axios.get("http://localhost:4000/api/product"); // API để lấy sản phẩm mới nhất
//         updateCartPrices(response.data); // Cập nhật lại giá trong giỏ hàng
//       } catch (error) {
//         console.error("Lỗi khi cập nhật giá sản phẩm:", error);
//       }
//     };
  
//     fetchProductUpdates();
//   }, []);

//   if (cart.length === 0) {
//     return (
//       <div className="text-center my-5">
//         <h2>Giỏ hàng của bạn đang trống</h2>
//         {/* Hình ảnh khi giỏ hàng trống */}
//         <img
//           src="http://localhost:4000/uploads/mythikore-anime-girl.gif"  // Thay đổi đường dẫn hình ảnh của bạn ở đây
//           alt="Giỏ hàng trống"
//           className="img-fluid"
//           style={{ maxWidth: '300px' }}  // Điều chỉnh kích thước nếu cần
//         />
//         <div className="mt-3">
//           <Link to="/product" className="btn btn-primary mt-3">Quay lại mua sắm</Link>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="container my-4">
//       <h2 className="mb-4">Giỏ hàng của bạn</h2>
//       <div className="table-responsive">
//         <table className="table table-bordered table-hover">
//           <thead className="table-dark">
//             <tr>
//               <th>Ảnh</th>
//               <th>Tên sản phẩm</th>
//               <th>Giá</th>
//               <th>Số lượng</th>
//               <th>Tổng</th>
//               <th>Thao tác</th>
//             </tr>
//           </thead>
//           <tbody>
//             {cart.map(item => (
//               <tr key={item.masach}>
//                 <td>
//                   <img
//                     src={`http://localhost:4000/uploads/${item.hinhanh}`}
//                     alt={item.hinhanh}
//                     className="img-fluid"
//                     style={{ maxWidth: '50px' }}
//                   />
//                 </td>
//                 <td>{item.tenSP}</td>
//                 <td>
//                   {item.giaKhuyenMai && item.giaKhuyenMai < item.giaGoc ? (
//                     // Nếu sản phẩm còn khuyến mãi
//                     <>
//                       <span style={{ textDecoration: 'line-through', marginRight: '10px', color: '#6c757d' }}>
//                         {formatPrice(item.giaGoc)}
//                       </span>
//                       <span className="text-danger">{formatPrice(item.giaKhuyenMai)}</span>
//                     </>
//                   ) : (
//                     // Nếu không còn khuyến mãi
//                     <span className="text-danger">{formatPrice(item.giaGoc)}</span>
//                   )}
//                 </td>
//                 <td>
//                   <input
//                     type="number"
//                     value={item.quantity}
//                     min="1"
//                     className="form-control"
//                     onChange={(e) => updateQuantity(item.masach, parseInt(e.target.value))}
//                   />
//                 </td>
//                 <td>{formatPrice(item.gia * item.quantity)}</td>
//                 <td>
//                   <button
//                     className="btn btn-danger btn-sm"
//                     onClick={() => removeFromCart(item.masach)}
//                   >
//                     <i className="bi bi-trash"></i> Xóa
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       <div className="d-flex justify-content-between align-items-center mt-3">
//         <h3>Tổng tiền: <span style={{ color: 'red' }}>{formatPrice(getTotalPrice())}</span></h3>
//         <div>
//           <Link to="/checkout" className="btn btn-success">
//             <i className="bi bi-credit-card"></i> Tiến hành đặt hàng
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Cart;
import React from "react";
import { useCart } from "../CartContext";
import { Link } from "react-router-dom";
import { formatPrice } from "../../utils/utils";
import { useEffect } from "react";
import axios from "axios";

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, getTotalPrice, updateCartPrices } = useCart();

  useEffect(() => {
    const fetchProductUpdates = async () => {
      try {
        const response = await axios.get("http://localhost:4000/api/product"); // API để lấy sản phẩm mới nhất
        updateCartPrices(response.data); // Cập nhật lại giá và số lượng tồn kho trong giỏ hàng
      } catch (error) {
        console.error("Lỗi khi cập nhật giá sản phẩm:", error);
      }
    };

    fetchProductUpdates();
  }, []);

  if (cart.length === 0) {
    return (
      <div className="text-center my-5">
        <h2>Giỏ hàng của bạn đang trống</h2>
        {/* Hình ảnh khi giỏ hàng trống */}
        <img
          src="http://localhost:4000/uploads/mythikore-anime-girl.gif"
          alt="Giỏ hàng trống"
          className="img-fluid"
          style={{ maxWidth: "300px" }}
        />
        <div className="mt-3">
          <Link to="/product" className="btn btn-primary mt-3">Quay lại mua sắm</Link>
        </div>
      </div>
    );
  }

  const handleQuantityChange = (masach, value) => {
    const newQuantity = parseInt(value);

    // Kiểm tra nếu giá trị bị bỏ trống hoặc không hợp lệ (NaN)
    if (isNaN(newQuantity) || value === "") {
      alert("Số lượng không được để trống! Đặt lại về 1.");
      updateQuantity(masach, 1); // Đặt lại về 1 nếu trống
      return;
    }

    const item = cart.find((i) => i.masach === masach);

    if (newQuantity < 1) {
      alert("Số lượng tối thiểu là 1!");
      updateQuantity(masach, 1); // Đặt lại về 1 nếu nhỏ hơn
    } else if (newQuantity > item.tongsoluong) {
      alert(`Số lượng không được vượt quá ${item.tongsoluong} (số lượng tồn kho)`);
      updateQuantity(masach, item.tongsoluong); // Đặt lại bằng tồn kho nếu vượt
    } else {
      updateQuantity(masach, newQuantity);
    }
  };

  return (
    <div className="container my-4">
      <h2 className="mb-4">Giỏ hàng của bạn</h2>
      <div className="table-responsive">
        <table className="table table-bordered table-hover">
          <thead className="table-dark">
            <tr>
              <th>Ảnh</th>
              <th>Tên sản phẩm</th>
              <th>Giá</th>
              <th>Số lượng</th>
              <th>Tổng</th>
              <th>Tồn kho</th> {/* Thêm cột hiển thị số lượng tồn kho */}
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {cart.map((item) => (
              <tr key={item.masach}>
                <td>
                  <img
                    src={`http://localhost:4000/uploads/${item.hinhanh}`}
                    alt={item.hinhanh}
                    className="img-fluid"
                    style={{ maxWidth: "50px" }}
                  />
                </td>
                <td>{item.tenSP || item.tensach}</td>
                <td>
                  {item.giaKhuyenMai && item.giaKhuyenMai < item.giaGoc ? (
                    <>
                      <span
                        style={{
                          textDecoration: "line-through",
                          marginRight: "10px",
                          color: "#6c757d",
                        }}
                      >
                        {formatPrice(item.giaGoc)}
                      </span>
                      <span className="text-danger">{formatPrice(item.giaKhuyenMai)}</span>
                    </>
                  ) : (
                    <span className="text-danger">{formatPrice(item.giaGoc)}</span>
                  )}
                </td>
                <td>
                  <input
                    type="number"
                    value={item.quantity}
                    min="1"
                    max={item.tongsoluong} // Giới hạn tối đa bằng tồn kho
                    className="form-control"
                    onChange={(e) => handleQuantityChange(item.masach, e.target.value)}
                    required // Ngăn bỏ trống trong HTML
                  />
                </td>
                <td>{formatPrice(item.gia * item.quantity)}</td>
                <td>{item.tongsoluong}</td> {/* Hiển thị số lượng tồn kho */}
                <td>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => removeFromCart(item.masach)}
                  >
                    <i className="bi bi-trash"></i> Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="d-flex justify-content-between align-items-center mt-3">
        <h3>
          Tổng tiền: <span style={{ color: "red" }}>{formatPrice(getTotalPrice())}</span>
        </h3>
        <div>
          <Link to="/checkout" className="btn btn-success">
            <i className="bi bi-credit-card"></i> Tiến hành đặt hàng
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Cart;