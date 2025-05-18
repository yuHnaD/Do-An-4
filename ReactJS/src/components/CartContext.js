// import React, { createContext, useContext, useState, useEffect } from 'react';

// // Tạo context cho giỏ hàng
// const CartContext = createContext();

// export const useCart = () => {
//   return useContext(CartContext);
// };

// export const CartProvider = ({ children }) => {
//   // Lấy giỏ hàng từ localStorage hoặc khởi tạo giỏ hàng trống
//   const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
//   const [cart, setCart] = useState(storedCart);

//   useEffect(() => {
//     // Lưu giỏ hàng vào localStorage mỗi khi giỏ hàng thay đổi
//     localStorage.setItem('cart', JSON.stringify(cart));
//   }, [cart]);

//   // Hàm thêm sản phẩm vào giỏ hàng
//   const addToCart = (product) => {
//     setCart((prevCart) => {
//       const existingProduct = prevCart.find((item) => item.masach === product.masach);
  
//       const updatedProduct = {
//         ...product,
//         gia: product.giaKhuyenMai && product.giaKhuyenMai < product.giaGoc ? product.giaKhuyenMai : product.giaGoc
//       };
  
//       if (existingProduct) {
//         // Nếu sản phẩm đã tồn tại trong giỏ hàng, tăng số lượng
//         return prevCart.map((item) =>
//           item.masach === product.masach
//             ? { ...item, quantity: item.quantity + 1 }
//             : item
//         );
//       }
  
//       // Nếu sản phẩm chưa tồn tại, thêm sản phẩm mới
//       return [...prevCart, { ...updatedProduct, quantity: 1 }];
//     });
//   };  

//   const updateCartPrices = (productListFromAPI) => {
//     setCart((prevCart) =>
//       prevCart.map((item) => {
//         const latestProduct = productListFromAPI.find((p) => p.masach === item.masach);
  
//         if (latestProduct) {
//           const newPrice =
//             latestProduct.giaKhuyenMai && latestProduct.giaKhuyenMai < latestProduct.giaGoc
//               ? latestProduct.giaKhuyenMai
//               : latestProduct.giaGoc;
  
//           return {
//             ...item,
//             gia: newPrice, // Cập nhật giá hiện tại (ưu tiên khuyến mãi)
//             giaGoc: latestProduct.giaGoc,
//             giaKhuyenMai: latestProduct.giaKhuyenMai,
//           };
//         }
//         return item;
//       })
//     );
//   };  

//   // Hàm xóa sản phẩm khỏi giỏ hàng
//   const removeFromCart = (productId) => {
//     setCart((prevCart) => {
//       // Lọc ra sản phẩm có id khớp và xóa sản phẩm đó khỏi giỏ hàng
//       return prevCart.filter(item => item.masach !== productId);
//     });
//   };

//   // Hàm cập nhật số lượng sản phẩm trong giỏ hàng
//   const updateQuantity = (productId, quantity) => {
//     setCart((prevCart) => {
//       return prevCart.map(item =>
//         item.masach === productId ? { ...item, quantity: Math.max(1, quantity) } : item
//       );
//     });
//   };

//   // Hàm tính tổng tiền giỏ hàng
//   const getTotalPrice = () => {
//     return cart.reduce((total, item) => total + item.gia * item.quantity, 0);
//   };

//   // Hàm xóa tất cả sản phẩm trong giỏ hàng
//   const clearCart = () => {
//     setCart([]);
//     localStorage.removeItem('cart');
//   };

//   return (
//     <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, getTotalPrice, clearCart, updateCartPrices }}>
//       {children}
//     </CartContext.Provider>
//   );
// };
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Tạo context cho giỏ hàng
const CartContext = createContext();

export const useCart = () => {
  return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
  // Lấy giỏ hàng từ localStorage hoặc khởi tạo giỏ hàng trống
  const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
  const [cart, setCart] = useState(storedCart);

  useEffect(() => {
    // Lưu giỏ hàng vào localStorage mỗi khi giỏ hàng thay đổi
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Hàm thêm sản phẩm vào giỏ hàng
  const addToCart = async (product) => {
    try {
      // Gọi API để lấy thông tin sản phẩm mới nhất, bao gồm số lượng tồn kho
      const response = await axios.get(`http://localhost:4000/api/detail-product/${product.masach}`);
      const latestProduct = response.data;

      if (!latestProduct || latestProduct.tongsoluong === undefined) {
        alert('Không thể lấy thông tin sản phẩm. Vui lòng thử lại sau.');
        return;
      }

      setCart((prevCart) => {
        const existingProduct = prevCart.find((item) => item.masach === product.masach);

        if (existingProduct) {
          // Kiểm tra số lượng tồn kho trước khi tăng số lượng
          const newQuantity = existingProduct.quantity + 1;
          if (newQuantity > latestProduct.tongsoluong) {
            alert(`Số lượng tồn kho không đủ! Chỉ còn ${latestProduct.tongsoluong} sản phẩm.`);
            return prevCart;
          }

          // Nếu sản phẩm đã tồn tại trong giỏ hàng, tăng số lượng
          return prevCart.map((item) =>
            item.masach === product.masach
              ? { ...item, quantity: newQuantity }
              : item
          );
        }

        // Kiểm tra số lượng tồn kho trước khi thêm sản phẩm mới
        if (latestProduct.tongsoluong < 1) {
          alert('Sản phẩm đã hết hàng!');
          return prevCart;
        }

        // Nếu sản phẩm chưa tồn tại, thêm sản phẩm mới
        const updatedProduct = {
          ...product,
          gia: product.giaKhuyenMai && product.giaKhuyenMai < product.giaGoc ? product.giaKhuyenMai : product.giaGoc,
          tongsoluong: latestProduct.tongsoluong, // Lưu số lượng tồn kho vào giỏ hàng
        };
        return [...prevCart, { ...updatedProduct, quantity: 1 }];
      });
    } catch (error) {
      console.error('Lỗi khi thêm sản phẩm vào giỏ hàng:', error);
      alert('Đã xảy ra lỗi khi thêm sản phẩm. Vui lòng thử lại sau.');
    }
  };

  // Hàm cập nhật giá và số lượng tồn kho trong giỏ hàng
  const updateCartPrices = (productListFromAPI) => {
    setCart((prevCart) =>
      prevCart.map((item) => {
        const latestProduct = productListFromAPI.find((p) => p.masach === item.masach);

        if (latestProduct) {
          const newPrice =
            latestProduct.giaKhuyenMai && latestProduct.giaKhuyenMai < latestProduct.giaGoc
              ? latestProduct.giaKhuyenMai
              : latestProduct.giaGoc;

          return {
            ...item,
            gia: newPrice, // Cập nhật giá hiện tại (ưu tiên khuyến mãi)
            giaGoc: latestProduct.giaGoc,
            giaKhuyenMai: latestProduct.giaKhuyenMai,
            tongsoluong: latestProduct.tongsoluong, // Cập nhật số lượng tồn kho
          };
        }
        return item;
      })
    );
  };

  // Hàm xóa sản phẩm khỏi giỏ hàng
  const removeFromCart = (productId) => {
    setCart((prevCart) => {
      return prevCart.filter(item => item.masach !== productId);
    });
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      const response = await axios.get(`http://localhost:4000/api/detail-product/${productId}`);
      const latestProduct = response.data;
  
      if (!latestProduct || latestProduct.tongsoluong === undefined) {
        alert("Không thể lấy thông tin sản phẩm. Vui lòng thử lại sau.");
        return;
      }
  
      setCart((prevCart) =>
        prevCart.map((item) => {
          if (item.masach === productId) {
            let newQuantity = Math.max(1, quantity); // Đảm bảo tối thiểu là 1
            if (newQuantity > latestProduct.tongsoluong) {
              alert(`Số lượng tồn kho không đủ! Chỉ còn ${latestProduct.tongsoluong} sản phẩm.`);
              newQuantity = latestProduct.tongsoluong; // Giới hạn tối đa bằng tồn kho
            }
            return { ...item, quantity: newQuantity };
          }
          return item;
        })
      );
    } catch (error) {
      console.error("Lỗi khi cập nhật số lượng:", error);
      alert("Đã xảy ra lỗi khi cập nhật số lượng. Vui lòng thử lại sau.");
    }
  };
  
  // Hàm tính tổng tiền giỏ hàng
  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.gia * item.quantity, 0);
  };

  // Hàm xóa tất cả sản phẩm trong giỏ hàng
  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cart');
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, getTotalPrice, clearCart, updateCartPrices }}>
      {children}
    </CartContext.Provider>
  );
};