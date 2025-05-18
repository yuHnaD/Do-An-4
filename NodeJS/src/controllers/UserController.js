import express from "express";
import bcrypt from "bcrypt";
import userModel from "../services/userModel.js";
import JWTAction from '../../middleware/jwt.js';
import jwt from 'jsonwebtoken';
const getAllUser = async (req, res) => {
    const page = parseInt(req.query.page) || 1; // Trang hiện tại, mặc định là trang 1
    const itemsPerPage = 5; // Số người dùng hiển thị mỗi trang
    const offset = (page - 1) * itemsPerPage; // Vị trí bắt đầu
    const query = req.query.query ? req.query.query.trim() : ''; // Từ khóa tìm kiếm
    const role = req.query.role || ''; // Vai trò người dùng (user hoặc admin)

    try {
        // Lấy danh sách người dùng từ model, với phân trang và tìm kiếm
        const { rows, count } = await userModel.getAllUser(offset, itemsPerPage, query, role);

        // Tính tổng số trang
        const totalPages = Math.ceil(count / itemsPerPage);

        res.render('home', {
            data: {
                title: 'List User',
                page: 'listUser',
                rows: rows,
                currentPage: page,
                totalPages: totalPages,
                limit: itemsPerPage,
                query: query || '', // Dữ liệu tìm kiếm
                role: role || '', // Vai trò người dùng (user hoặc admin)
            },
        });
    } catch (error) {
        console.error('Lỗi khi lấy người dùng:', error);
        res.status(500).send('Lỗi server');
    }
};

const createUser = (req, res) => {
    res.render('home', {data: {title: 'Create New User', page: 'insertUser'} })
}

// const insertUser = async (req, res) => {
//     let {username, password, fullname, address, sex, email} = req.body
//     if (!userModel.isUserExist(username)) {
//         await userModel.insertUser(username, password, fullname, address, sex, email)
//         res.redirect("/")
//     }
//     else
//         res.send("User exist")
// }

const insertUser = async (req, res) => {
    let { username, password, fullname, address, sex, email, sodienthoai } = req.body;

    // Chờ kết quả của isUserExist
    const userExists = await userModel.isUserExist(username);

    if (!userExists) {
        try {
            // Gọi hàm insertUser để thêm người dùng vào cơ sở dữ liệu
            await userModel.insertUser(username, password, fullname, address, sex, email, sodienthoai);
            res.redirect("/"); // Điều hướng về trang chủ sau khi thêm người dùng thành công
        } catch (error) {
            res.status(500).send("Error inserting user");
        }
    } else {
        res.send("User already exists");
    }
};

const detailUser = async (req, res) => {
    // if (isAuthentication(req, res) == true) {}
    let user = req.params.username
    let dataUser = await userModel.detailUser(user)
    res.render('home', {data: {title: 'Detail User', page: 'detailUser', rows: dataUser} })
}

const editUser = async (req, res) => {
    let user = req.params.username
    let dataUser = await userModel.detailUser(user)
    res.render('home', {data: {title: 'Edit User', page: 'editUser', rows: dataUser} })
}

const updateUser = async (req, res) => {
    console.log(req.body);
    const { username } = req.params; // Lấy username từ URL
    const { password, fullname, address, sex, email } = req.body;
    await userModel.updateUser(username, password, fullname, address, sex, email);
    res.redirect("/list-user");
}

const deleteUser = async (req, res) => {
    let {username} = req.body
    await userModel.deleteUser(username)
    res.redirect("/list-user")
}

//Client
const getUserDetail = async (req, res) => {
    try {
        const { userid } = req.params;
        const user = await userModel.getUserById(userid);

        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy người dùng." });
        }

        res.status(200).json({ user });
    } catch (error) {
        console.error("Lỗi khi lấy thông tin người dùng:", error);
        res.status(500).json({ message: "Lỗi server." });
    }
};
//Cập nhật thông tin người dùng bên React
const updateUserDetail = async (req, res) => {
    try {
        const { userid } = req.params;
        const { tennguoidung, email, gioitinh, diachi, sodienthoai } = req.body;
        let avatarPath = null;

        // Kiểm tra nếu có file hinhanh được upload
        if (req.files && req.files['hinhanh']) {
            avatarPath = `${req.files['hinhanh'][0].filename}`;
        }

        const result = await userModel.updateUserDetail(userid, tennguoidung, email, gioitinh, diachi, sodienthoai, avatarPath);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Người dùng không tồn tại." });
        }

        // Lấy thông tin người dùng đã cập nhật để trả về
        const updatedUser = await userModel.getUserById(userid);
        res.status(200).json({ message: "Cập nhật thông tin thành công.", user: updatedUser });
    } catch (error) {
        console.error("Lỗi khi cập nhật thông tin người dùng:", error);
        res.status(500).json({ message: "Lỗi server." });
    }
};
// Client
const registerUser = async (req, res) => {
    try {
        const { username, password, fullname, sex, address, email, sodienthoai, role } = req.body;
        const acc = await userModel.getUserByUsername(username);
        
        if (acc) {
            return res.status(400).json({ message: 'Tài khoản đã tồn tại' });
        }

        // Băm mật khẩu
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Chèn vào cơ sở dữ liệu
        await userModel.registerUser(null, username, hashedPassword, fullname,  sex, address, email, sodienthoai, new Date(), role);

        res.status(200).json({ message: 'Created successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Lấy thông tin người dùng từ cơ sở dữ liệu
        const acc = await userModel.getUserByUsername(username);

        if (!acc) {
            return res.status(400).json({ message: 'Username không tồn tại' });
        }

        // Kiểm tra xem mật khẩu có hợp lệ không
        const isPasswordMatch = await bcrypt.compare(password, acc.matkhau);

        // console.log("Password from request:", password);
        // console.log("Hashed password from DB:", acc.matkhau);
        // console.log(isPasswordMatch);

        if (!isPasswordMatch) {
            return res.status(401).json({ message: 'Mật khẩu không đúng' });
        }

        const payload = {
            userId: acc.manguoidung,
            username: acc.tennguoidung,
            role: acc.role,
            haha: "haha"
        };
        // console.log("Payload tạo JWT:", payload);
        // Tạo JWT token
        const token = JWTAction.createJWT(payload);
        // console.log("Token JWT tạo ra:", token);

        // Thiết lập cookie với JWT token
        res.cookie("jwt", token, { path: "/", httpOnly: true, secure: false, sameSite: 'Lax' });

        // // Lưu thông tin vào session
        // req.session.isAuth = true;
        req.session.user = acc;  // Lưu thông tin user vào session
        // req.session.role = acc.role;

        // Trả về thông báo đăng nhập thành công
        return res.status(200).json({ message: 'Đăng nhập thành công', token, user: acc });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Lỗi xảy ra bên server' });
    }
};

const loginAdmin = async (req, res) => {
    res.render('login', { data: { title: 'Login' } });
}

const getAdmin = async (req, res) => {
    const { username, password } = req.body;

    try {
        // Lấy thông tin tài khoản từ DB
        const acc = await userModel.getUserByUsername(username);

        if (!acc) {
            return res.status(400).send("Username không tồn tại.");
        }

        // So sánh mật khẩu
        const isPasswordValid = await bcrypt.compare(password, acc.matkhau);

        if (!isPasswordValid) {
            return res.status(401).send("Mật khẩu không đúng.");
        }

        // Thiết lập session và cookie
        req.session.isAuth = true;
        req.session.admin = acc; // Lưu thông tin admin vào session

        // Điều hướng về trang chủ
        return res.redirect('/');
    } catch (error) {
        console.error("Lỗi trong getAdmin:", error);
        return res.status(500).send("Lỗi hệ thống.");
    }
};

const logout = (req, res) => {
    res.set('Cache-Control', 'no-store');
    res.clearCookie('connect.sid');  // Xóa cookie session
    res.redirect("/login"); // Chuyển hướng về trang đăng nhập
};


const logoutAPI = (req, res) => {
    res.clearCookie('jwt');
    res.status(200).json({ message: 'Đăng xuất thành công'})
};


export default {getAllUser, createUser, detailUser, updateUser, editUser, insertUser, deleteUser, loginUser, loginAdmin, registerUser, logout, logoutAPI, getAdmin, getUserDetail, updateUserDetail}