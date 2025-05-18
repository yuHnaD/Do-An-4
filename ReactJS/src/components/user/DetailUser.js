import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useUser } from "../UserContext";

const UserDetail = () => {
    const { userid } = useParams();
    const { setUser } = useUser();
    const [user, setLocalUser] = useState({
        tennguoidung: "",
        email: "",
        gioitinh: "",
        diachi: "",
        sodienthoai: "",
        avatar: ""
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);

    useEffect(() => {
        const fetchUserDetail = async () => {
            try {
                const response = await axios.get(`http://localhost:4000/api/detail-user/${userid}`);
                setLocalUser(response.data.user);
                setUser(response.data.user); // Cập nhật UserContext
                setLoading(false);
            } catch (err) {
                setError("Không thể tải thông tin người dùng.");
                setLoading(false);
            }
        };

        fetchUserDetail();
    }, [userid]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setLocalUser((prevState) => ({ ...prevState, [name]: value }));
    };

    const handleAvatarChange = (e) => {
        setAvatarFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append("tennguoidung", user.tennguoidung);
            formData.append("email", user.email);
            formData.append("gioitinh", user.gioitinh);
            formData.append("diachi", user.diachi);
            formData.append("sodienthoai", user.sodienthoai);
            if (avatarFile) {
                formData.append("hinhanh", avatarFile);
            }

            // Gửi yêu cầu cập nhật thông tin và avatar
            await axios.post(`http://localhost:4000/api/detail-user/${userid}/update`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            // Lấy thông tin người dùng mới nhất
            const response = await axios.get(`http://localhost:4000/api/detail-user/${userid}`);
            const updatedUser = response.data.user;
            setLocalUser(updatedUser);
            setUser(updatedUser); // Cập nhật UserContext

            // Gửi sự kiện để thông báo cập nhật
            window.dispatchEvent(new Event('userUpdated'));

            alert("Cập nhật thông tin thành công!");

            // Cập nhật thông tin trong Context
            setUser((prevState) => ({
                ...prevState,
                tennguoidung: user.tennguoidung,
                avatar: user.avatar
            }));

            // Cập nhật localStorage
            localStorage.setItem("fullname", user.tennguoidung);
        } catch (err) {
            console.error(err);
            alert("Có lỗi xảy ra khi cập nhật thông tin.");
        }
    };

    if (loading) return <div className="text-center">Đang tải thông tin người dùng...</div>;
    if (error) return <div className="alert alert-danger">{error}</div>;

    return (
        <div className="container my-4">
            <h1 className="mb-4 text-center">Thông Tin Người Dùng</h1>
            <div className="card shadow-sm mx-auto" style={{ maxWidth: "600px" }}>
                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3 text-center">
                            <label className="form-label">Ảnh đại diện</label>
                            <div>
                                <img
                                    src={user.avatar ? `http://localhost:4000/uploads/${user.avatar}` : "http://localhost:4000/uploads/default-avatar.png"}
                                    alt="Avatar"
                                    className="rounded-circle mb-2"
                                    style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                                />
                            </div>
                            <input
                                type="file"
                                name="hinhanh"
                                className="form-control"
                                accept="image/*"
                                onChange={handleAvatarChange}
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Họ và tên</label>
                            <input
                                type="text"
                                name="tennguoidung"
                                className="form-control"
                                value={user.tennguoidung}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Email</label>
                            <input
                                type="email"
                                name="email"
                                className="form-control"
                                value={user.email}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Giới tính</label>
                            <select
                                name="gioitinh"
                                className="form-select"
                                value={user.gioitinh}
                                onChange={handleInputChange}
                            >
                                <option value="Male">Nam</option>
                                <option value="Female">Nữ</option>
                                <option value="Other">Khác</option>
                            </select>
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Địa chỉ</label>
                            <input
                                type="text"
                                name="diachi"
                                className="form-control"
                                value={user.diachi}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Số điện thoại</label>
                            <input
                                type="tel"
                                name="sodienthoai"
                                className="form-control"
                                value={user.sodienthoai}
                                onChange={handleInputChange}
                                pattern="[0-9]*"
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary w-100">
                            Lưu Thay Đổi
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default UserDetail;