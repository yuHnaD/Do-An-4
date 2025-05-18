import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

export default function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        fullname: "",
        address: "",
        sex: "",
        email: "",
        sodienthoai: "",
        role: "user",
    });

    const [message, setMessage] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const validatePassword = (password) => {
        // Kiểm tra mật khẩu có ít nhất 8 ký tự, một chữ cái viết hoa, một chữ cái viết thường, một số và một ký tự đặc biệt
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return regex.test(password);
    };

    const validatePhoneNumber = (phone) => {
        // Kiểm tra số điện thoại có đủ 10 chữ số
        const regex = /^[0-9]{10}$/;
        return regex.test(phone);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Kiểm tra dữ liệu đầu vào
        if (!validatePassword(formData.password)) {
            setMessage("Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ cái hoa, thường, số và ký tự đặc biệt.");
            return;
        }
        if (!validatePhoneNumber(formData.sodienthoai)) {
            setMessage("Số điện thoại phải đủ 10 chữ số.");
            return;
        }

        try {
            await axios.post("http://localhost:4000/api/register", formData, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            setMessage("Tạo tài khoản thành công");
            navigate("/login");
        } catch (error) {
            setMessage(
                error.response ? error.response.data.message : "Đã có lỗi xảy ra"
            );
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
            <div className="card shadow-sm p-4" style={{ width: "30rem" }}>
                <h2 className="text-center mb-4">Đăng ký</h2>
                {message && (
                    <div className="alert alert-danger text-center" role="alert">
                        {message}
                    </div>
                )}
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="username" className="form-label">
                            Tài khoản
                        </label>
                        <input
                            value={formData.username}
                            onChange={handleChange}
                            type="text"
                            id="username"
                            name="username"
                            className="form-control"
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="password" className="form-label">
                            Mật khẩu
                        </label>
                        <input
                            value={formData.password}
                            onChange={handleChange}
                            type="password"
                            id="password"
                            name="password"
                            className="form-control"
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="fullname" className="form-label">
                            Họ tên
                        </label>
                        <input
                            value={formData.fullname}
                            onChange={handleChange}
                            type="text"
                            id="fullname"
                            name="fullname"
                            className="form-control"
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="address" className="form-label">
                            Địa chỉ
                        </label>
                        <input
                            value={formData.address}
                            onChange={handleChange}
                            type="text"
                            id="address"
                            name="address"
                            className="form-control"
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="sex" className="form-label">
                            Giới tính
                        </label>
                        <select
                            value={formData.sex}
                            onChange={handleChange}
                            id="sex"
                            name="sex"
                            className="form-select"
                        >
                            <option value="">Chọn</option>
                            <option value="Nam">Nam</option>
                            <option value="Nữ">Nữ</option>
                            <option value="Khác">Khác</option>
                        </select>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="email" className="form-label">
                            Email
                        </label>
                        <input
                            value={formData.email}
                            onChange={handleChange}
                            type="email"
                            id="email"
                            name="email"
                            className="form-control"
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="sdt" className="form-label">
                            Số điện thoại
                        </label>
                        <input
                            value={formData.sodienthoai}
                            onChange={handleChange}
                            type="text"
                            id="sdt"
                            name="sodienthoai"
                            className="form-control"
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-100">
                        Đăng ký
                    </button>
                </form>
                <p className="text-center mt-3">
                    Bạn đã có tài khoản?{" "}
                    <Link to="/login" className="text-primary">
                        Đăng nhập tại đây
                    </Link>
                </p>
            </div>
        </div>
    );
}
