import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

export default function Login() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });

    const [message, setMessage] = useState("");

    // Kiểm tra nếu đã đăng nhập
    useEffect(() => {
        const token = localStorage.getItem("jwt");
        if (token) {
            navigate("/");
        }
    }, [navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.username || !formData.password) {
            alert("Giá trị rỗng");
        } else {
            try {
                const response = await axios.post(
                    "http://localhost:4000/api/loginUser",
                    formData,
                    {
                        headers: {
                            "Content-Type": "application/json",
                            Accept: "application/json",
                        },
                        withCredentials: true,
                    }
                );

                const token = response.data.token;
                const user = response.data.user;

                localStorage.setItem("jwt", token); // Lưu token vào localStorage
                localStorage.setItem("userid", user.manguoidung); //Lưu userid vào localStorage
                localStorage.setItem("fullname", user.tennguoidung); //Lưu userid vào localStorage

                // Log để kiểm tra
                console.log(`Đăng nhập thành công, userid: ${user.manguoidung}, role: ${user.role}`);
                console.log(`localStorage userid: ${localStorage.getItem("userid")}`);

                setMessage(response.data.message);

                if (user.role === "admin") {
                    localStorage.removeItem('jwt');
                    window.location.href = "http://localhost:4000/";
                    
                } else {
                    window.location.href = "http://localhost:3000/home";
                }
            } catch (error) {
                setMessage(error.response ? error.response.data.message : "An error occurred");
            }
        }
    };

    return (
        <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
            <div className="card shadow-lg p-4" style={{ width: "25rem" }}>
                <h2 className="text-center mb-4 text-dark">Đăng nhập</h2>
                {message && <div className="alert alert-warning">{message}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="username" className="form-label">
                            Tài khoản:
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
                            Mật khẩu:
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
                    <button
                        type="submit"
                        className="btn btn-dark w-100"
                    >
                        Đăng nhập
                    </button>
                </form>
                <div className="mt-3 text-center">
                    <Link to="/register" className="text-decoration-none">
                        Bạn không có tài khoản? Đăng ký ở đây
                    </Link>
                </div>
            </div>
        </div>
    );
}
