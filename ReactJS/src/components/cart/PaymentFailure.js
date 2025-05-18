import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

const PaymentFailure = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const madh = new URLSearchParams(location.search).get("madh");

    return (
        <div className="container my-5 text-center">
            <h2 className="text-danger">Thanh Toán Thất Bại!</h2>
            <p>Đã có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại.</p>
            <p>Mã đơn hàng: {madh}</p>
            <button className="btn btn-primary" onClick={() => navigate("/cart")}>
                Quay lại giỏ hàng
            </button>
        </div>
    );
};

export default PaymentFailure;