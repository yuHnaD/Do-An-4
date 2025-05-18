import jwt from 'jsonwebtoken';
import dotenv from 'dotenv/config'

const createJWT = (payload) => {
    const key = process.env.JWT_SECRET;
    let token = null;
  
    try {
  
        token = jwt.sign(payload, key, { expiresIn: '2h' });
    } catch (err) {
        console.error('Lỗi tạo JWT:', err);
    }
  
    return token;
  };
  
  const verifyToken = (token) => {
    const key = process.env.JWT_SECRET;
    let decoded = null;
    
    try {
        decoded = jwt.verify(token, key);
    } catch (err) {
        console.error('Error verifying token:', err);
    }
    
    return decoded;
  };
  
  const authMiddleware = (req, res, next) => {
    const token = req.cookies.jwt;
    // console.log("Cookies trong request:", req.cookies);
    // console.log("Token nhận từ cookie:", req.cookies.jwt);

    // console.log("Token nhận từ cookie:", token); // Kiểm tra token
    if (!token) return res.status(401).json({ message: 'Không tìm thấy token' });

    try {
        const decoded = verifyToken(token); // Xác minh token
        // console.log("Decoded payload:", decoded); // Log payload sau khi giải mã
        req.user = decoded; // Lưu thông tin người dùng vào request
        req.userId = decoded.userId; // Gán `userId` từ payload vào `req`
        next(); // Tiếp tục đến middleware hoặc route tiếp theo
    } catch (error) {
        console.error("Lỗi trong middleware:", error);
        return res.status(401).json({ message: 'Token không hợp lệ' });
    }
};


  const isAuth = (req, res, next) => {
    if (req.session.isAuth && req.session.admin.role === 'admin') {
        next();
    } else {
        res.redirect("/login");
    }
  }
  export default {createJWT, verifyToken, authMiddleware, isAuth};