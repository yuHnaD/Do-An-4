import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../CartContext";

const PaymentSuccess = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { clearCart } = useCart();

    useEffect(() => {
        const madh = new URLSearchParams(location.search).get("madh");
        if (madh) {
            clearCart(); // Xóa giỏ hàng sau khi thanh toán thành công
            setTimeout(() => {
                navigate("/cart");
            }, 3000);
        }
    }, [location, clearCart, navigate]);

    return (
        <div className="container my-5 text-center">
            <h2 className="text-success">Thanh Toán Thành Công!</h2>
            <p>Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn đã được ghi nhận.</p>
            <p>Bạn sẽ được chuyển hướng về giỏ hàng trong giây lát...</p>
        </div>
    );
};

export default PaymentSuccess;