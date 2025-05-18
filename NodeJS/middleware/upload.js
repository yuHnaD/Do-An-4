// import multer from 'multer';
// import path from 'path';
// import fs from 'fs';

// // Thiết lập multer để lưu vào thư mục tạm thời
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     // Sử dụng một thư mục tạm thời như './tmp'
//     const tempPath = './uploads';
    
//     cb(null, tempPath); // Upload file vào thư mục tạm thời
//   },
//   filename: (req, file, cb) => {
//     // Giữ tên file gốc
//     cb(null, file.originalname);
//   }
// });

// // Thiết lập upload file với giới hạn dung lượng
// const upload = multer({
//     storage: storage,
//     limits: { fileSize: 10 * 1024 * 1024 } // Giới hạn kích thước file là 10MB
// }).single('hinhanh');

// export default {upload}

import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Tạo thư mục uploads nếu chưa tồn tại
const ensureUploadsDirExists = () => {
  const uploadsDir = './uploads';
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
  }
};

// Thiết lập multer để lưu vào thư mục uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = './uploads';
    ensureUploadsDirExists(); // Đảm bảo thư mục tồn tại
    cb(null, uploadsDir); // Upload file vào thư mục uploads
  },
  filename: (req, file, cb) => {
    // Giữ tên file gốc và thêm timestamp để tránh trùng lặp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);
    cb(null, `${baseName}-${uniqueSuffix}${ext}`);
  }
});

// Lọc file để chỉ chấp nhận ảnh
const fileFilter = (req, file, cb) => {
  const fileTypes = /jpeg|jpg|png|gif|webp/;
  const mimeType = fileTypes.test(file.mimetype);
  const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());

  if (mimeType && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Lỗi: Chỉ hỗ trợ file ảnh (JPEG, PNG, GIF)'));
  }
};

// Thiết lập upload file với giới hạn dung lượng 10MB
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Giới hạn kích thước file là 10MB
  fileFilter: fileFilter
}).fields([
  { name: 'hinhanh', maxCount: 1 }, // 1 ảnh chính
  { name: 'hinhanhPhu', maxCount: 5 }, // Tối đa 5 ảnh phụ
  { name: 'new_hinhanhPhu', maxCount: 5 } // Tối đa 5 ảnh phụ
]);

export default { upload };
