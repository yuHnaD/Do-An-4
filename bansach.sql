-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 18, 2025 at 12:44 PM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `bansach`
--

-- --------------------------------------------------------

--
-- Table structure for table `bansach_cuahang`
--

CREATE TABLE `bansach_cuahang` (
  `macuahang` int(11) NOT NULL,
  `tencuahang` varchar(250) NOT NULL,
  `diachi` varchar(500) NOT NULL,
  `lat` float NOT NULL,
  `lng` float NOT NULL,
  `hinhanh` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `bansach_cuahang`
--

INSERT INTO `bansach_cuahang` (`macuahang`, `tencuahang`, `diachi`, `lat`, `lng`, `hinhanh`) VALUES
(2, 'Cửa hàng', '149 Nguyễn Đệ, phường An Hòa, quận Ninh Kiều, Cần Thơ', 10.0504, 105.767, 'sach_tu_xb_CPTT-1744699525716-580277678.jpg'),
(5, 'Bán sách', '104/155, khóm Châu Long 5, phường Châu Phú B, Châu Đốc, An Giang', 10.6894, 105.111, '35w2ygo2hj3xmjdy3c-170874797391305-1744699873754-366187693.png'),
(6, 'Bán sách 3', '268/23 Nguyễn Tiểu La, Phường 8, Quận 10, Hồ Chí Minh, Vietnam', 10.764, 106.666, 'z4842488950480_07b9ab32210add2ed9d885d0edebd6b2-1744709016602-139563499.jpg'),
(8, 'Bán sách 4', 'Phường 12, District 10, Ho Chi Minh City, Vietnam', 10.823, 106.63, '10-cuon-sach-hay-nhat-ve-khoa-hoc-min-1-1744709233403-348393592.jpg');

-- --------------------------------------------------------

--
-- Table structure for table `chitietdonhang`
--

CREATE TABLE `chitietdonhang` (
  `madonhang` int(11) NOT NULL,
  `masach` int(11) NOT NULL,
  `gia` int(11) NOT NULL,
  `soluong` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `chitietdonhang`
--

INSERT INTO `chitietdonhang` (`madonhang`, `masach`, `gia`, `soluong`) VALUES
(55, 10, 62300, 1),
(56, 11, 7000, 1),
(57, 10, 62300, 1),
(58, 19, 62300, 1),
(59, 19, 62300, 1),
(60, 11, 7000, 1),
(61, 11, 7000, 1),
(61, 19, 62300, 1),
(62, 19, 62300, 9),
(63, 11, 10000, 1),
(64, 10, 89000, 1),
(65, 10, 89000, 1),
(66, 35, 122500, 1),
(67, 7, 1000, 1),
(68, 10, 89000, 1);

-- --------------------------------------------------------

--
-- Table structure for table `chitietnhapkho`
--

CREATE TABLE `chitietnhapkho` (
  `manhapkho` int(11) NOT NULL,
  `masach` int(11) NOT NULL,
  `soluong` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `chitietnhapkho`
--

INSERT INTO `chitietnhapkho` (`manhapkho`, `masach`, `soluong`) VALUES
(31, 7, 10),
(32, 7, 10),
(33, 11, 8),
(34, 19, 0),
(35, 10, 9),
(36, 7, 10),
(36, 10, 10),
(37, 10, 1),
(38, 11, 2),
(39, 35, 9),
(40, 35, 10);

-- --------------------------------------------------------

--
-- Table structure for table `danhgia`
--

CREATE TABLE `danhgia` (
  `madanhgia` int(11) NOT NULL,
  `xephang` int(11) NOT NULL,
  `binhluan` varchar(500) NOT NULL,
  `ngaydanhgia` datetime NOT NULL,
  `manguoidung` int(11) NOT NULL,
  `masach` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `danhgia`
--

INSERT INTO `danhgia` (`madanhgia`, `xephang`, `binhluan`, `ngaydanhgia`, `manguoidung`, `masach`) VALUES
(44, 0, 'Truyện hay, xứng đáng từng đồng bỏ ra', '2024-12-18 00:40:06', 3, 7),
(45, 0, 'hay', '2024-12-18 01:19:25', 3, 16),
(46, 0, 'lala', '2024-12-18 01:19:36', 3, 16),
(55, 0, 'hay', '2024-12-25 05:19:53', 3, 10),
(68, 0, 'dad', '2025-03-05 02:18:55', 5, 19),
(80, 0, 'da', '2025-03-17 02:44:23', 3, 11),
(83, 0, 'aaaa', '2025-04-04 09:48:02', 3, 21),
(86, 0, 'hayy', '2025-04-12 01:29:49', 3, 19),
(90, 0, 'dadad', '2025-04-12 09:18:32', 3, 29),
(91, 0, 'hay hay', '2025-04-24 19:54:02', 3, 33),
(96, 0, 'dadada', '2025-05-04 09:18:11', 3, 36);

-- --------------------------------------------------------

--
-- Table structure for table `donhang`
--

CREATE TABLE `donhang` (
  `madonhang` int(11) NOT NULL,
  `manguoidung` int(11) NOT NULL,
  `ngaydat` datetime NOT NULL,
  `trangthai` varchar(500) NOT NULL,
  `tonggia` int(11) NOT NULL,
  `diachinhanhang` varchar(500) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `donhang`
--

INSERT INTO `donhang` (`madonhang`, `manguoidung`, `ngaydat`, `trangthai`, `tonggia`, `diachinhanhang`) VALUES
(55, 3, '2025-03-21 10:52:19', '2', 62300, 'Cần Thơ, Vietnam'),
(56, 3, '2025-03-21 11:00:17', '2', 7000, 'Cần Thơ, Vietnam'),
(57, 5, '2025-03-21 11:15:57', '2', 62300, 'Cần Thơ, Vietnam'),
(58, 5, '2025-03-21 11:26:47', '1', 62300, 'Cần Thơ, Vietnam'),
(59, 5, '2025-03-21 11:28:06', '1', 62300, 'Cần Thơ, Vietnam'),
(60, 5, '2025-03-21 12:33:07', '1', 7000, 'Cần Thơ, Vietnam'),
(61, 5, '2025-03-21 13:00:47', '2', 69300, 'Cần Thơ, Vietnam'),
(62, 5, '2025-03-21 13:15:16', '2', 560700, 'Cần Thơ, Vietnam'),
(63, 3, '2025-04-15 02:22:13', '1', 10000, 'Hẻm 76 Đường 3 Tháng 2, Ninh Kiều District, Cần Thơ, Vietnam'),
(64, 3, '2025-04-23 13:04:42', '1', 119000, 'N, Ngõ 115 Trần Cung, Cầu Giấy District, Hà Nội, Vietnam'),
(65, 3, '2025-04-28 09:07:00', '1', 119000, 'Can, 74 Bach Dang Street, Phường Minh An, Hội An, Quảng Nam Province, Vietnam'),
(66, 3, '2025-05-11 14:29:44', '2', 152500, 'Châu Đốc, An Giang Province, Vietnam'),
(67, 3, '2025-05-13 14:27:42', '1', 1000, 'Trường TH - THCS - THPT Quốc Văn Cần Thơ, Hẻm 22, Ninh Kiều District, Cần Thơ, Vietnam'),
(68, 3, '2025-05-13 16:50:13', '1', 123288, 'TH-Chị Huệ-Tổ 1- Ấp Cần Đôn- Minh Thạnh- Dầu Tiếng- Bình Dương-02743549119, Provincial Road 751, Xã Minh Thạnh, Bình Dương Province, Vietnam');

-- --------------------------------------------------------

--
-- Table structure for table `khuyenmai`
--

CREATE TABLE `khuyenmai` (
  `makhuyenmai` int(11) NOT NULL,
  `tenkhuyenmai` varchar(250) NOT NULL,
  `phantramgiamgia` int(11) NOT NULL,
  `ngaybatdau` datetime NOT NULL,
  `ngayketthuc` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `khuyenmai`
--

INSERT INTO `khuyenmai` (`makhuyenmai`, `tenkhuyenmai`, `phantramgiamgia`, `ngaybatdau`, `ngayketthuc`) VALUES
(4, 'Black GuyDay', 30, '2024-12-18 14:55:00', '2025-05-05 00:00:00'),
(5, 'Ngày báo ', 99, '2024-12-18 01:12:00', '2025-04-19 01:12:00'),
(6, 'ngày 30/4', 99, '2025-05-13 16:56:00', '2025-05-14 16:56:00');

-- --------------------------------------------------------

--
-- Table structure for table `luotlike`
--

CREATE TABLE `luotlike` (
  `maluotlike` int(11) NOT NULL,
  `masach` int(11) NOT NULL,
  `manguoidung` int(11) NOT NULL,
  `thoigianlike` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `luotxem`
--

CREATE TABLE `luotxem` (
  `maluotxem` int(11) NOT NULL,
  `masach` int(11) NOT NULL,
  `manguoidung` int(11) NOT NULL,
  `ngayxem` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `luotxem`
--

INSERT INTO `luotxem` (`maluotxem`, `masach`, `manguoidung`, `ngayxem`) VALUES
(1, 7, 5, '2025-03-21 12:08:42'),
(2, 7, 5, '2025-03-21 12:08:42'),
(3, 10, 5, '2025-03-21 11:15:46'),
(4, 11, 5, '2025-03-21 12:42:37'),
(5, 10, 3, '2025-05-13 16:57:45'),
(6, 10, 3, '2025-05-13 16:57:45'),
(7, 11, 3, '2025-05-13 13:07:39'),
(8, 12, 3, '2025-05-03 20:30:21'),
(9, 7, 3, '2025-05-13 16:42:17'),
(10, 7, 3, '2025-05-13 16:42:17'),
(11, 16, 3, '2025-05-13 13:58:10'),
(12, 16, 3, '2025-05-13 13:58:10'),
(13, 14, 3, '2025-05-13 13:07:39'),
(17, 13, 3, '2025-04-24 19:27:48'),
(18, 13, 3, '2025-04-24 19:27:48'),
(19, 21, 3, '2025-05-10 14:37:17'),
(21, 19, 3, '2025-05-13 16:42:56'),
(22, 15, 3, '2025-05-13 13:07:40'),
(23, 17, 3, '2025-04-24 09:44:23'),
(24, 19, 5, '2025-03-21 13:06:44'),
(25, 29, 3, '2025-05-13 16:45:47'),
(28, 18, 3, '2025-05-10 14:40:28'),
(30, 33, 3, '2025-05-13 14:27:05'),
(31, 33, 3, '2025-05-13 14:27:05'),
(32, 34, 3, '2025-05-10 14:31:46'),
(33, 34, 3, '2025-05-10 14:31:46'),
(35, 14, 8, '2025-04-24 13:06:16'),
(36, 18, 8, '2025-04-24 11:45:44'),
(37, 12, 8, '2025-04-24 11:45:46'),
(38, 16, 8, '2025-04-24 11:45:47'),
(39, 11, 8, '2025-04-24 13:06:16'),
(40, 10, 8, '2025-04-24 13:12:48'),
(41, 7, 8, '2025-04-24 11:45:58'),
(42, 33, 8, '2025-04-24 13:28:39'),
(43, 29, 8, '2025-04-24 13:28:04'),
(44, 19, 8, '2025-04-24 13:27:15'),
(45, 13, 8, '2025-04-24 13:06:12'),
(46, 15, 8, '2025-04-24 13:07:32'),
(47, 34, 8, '2025-04-24 13:27:08'),
(48, 36, 3, '2025-05-13 14:26:41'),
(49, 36, 3, '2025-05-13 14:26:41'),
(50, 35, 3, '2025-05-13 16:39:14'),
(51, 37, 3, '2025-05-13 16:43:07'),
(52, 38, 3, '2025-05-13 16:57:35'),
(53, 38, 3, '2025-05-13 16:57:35');

-- --------------------------------------------------------

--
-- Table structure for table `nguoidung`
--

CREATE TABLE `nguoidung` (
  `manguoidung` int(11) NOT NULL,
  `tentaikhoan` varchar(250) NOT NULL,
  `matkhau` varchar(500) NOT NULL,
  `tennguoidung` varchar(250) NOT NULL,
  `gioitinh` varchar(250) NOT NULL,
  `diachi` varchar(250) NOT NULL,
  `email` varchar(250) NOT NULL,
  `sodienthoai` int(11) NOT NULL,
  `ngaydangky` datetime NOT NULL,
  `role` varchar(250) NOT NULL DEFAULT 'user',
  `avatar` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `nguoidung`
--

INSERT INTO `nguoidung` (`manguoidung`, `tentaikhoan`, `matkhau`, `tennguoidung`, `gioitinh`, `diachi`, `email`, `sodienthoai`, `ngaydangky`, `role`, `avatar`) VALUES
(2, 'admin123', '$2b$10$bD5.aC4vEnNgRLzh/rUQ1uB8QacXCqDwsCeCN7dkDHV.vdxZMWMIe', 'Nguyễn Đan Huy', 'Nữ', '149 nguyen ', 'ngdanhuy147@gmail.com', 927033511, '2024-11-24 14:25:50', 'admin', NULL),
(3, 'user123', '$2b$10$Wnmcp.I7hOIlS9uni2IlL.Hx.UJw/oFaQ9UJD4wZp/dZ7s.7fsJe6', 'Nguyễn Đan Huy', 'Female', '149 nguyen', 'ngdanhuy147@gmail.com', 2147483647, '2024-11-24 14:30:55', 'user', 'Rover (1)-1746852800305-402468127.jpg'),
(5, 'keqing123', '$2b$10$IokcVizooIecxAEO9vy9Duj3/SYrV6RsDpe/EpZqYtCj9yya5zBLG', 'Aya', 'Nam', '149 nguyen de', 'ngdanhuy147@gmail.com', 927033511, '2024-12-05 04:09:41', 'user', NULL),
(7, 'admin147', '$2b$10$MzQPCVjQtdBXCUkdveA9jettblQnotJoYAkDC0hi994uOW9vUZouW', 'Nguyễn Võ Thành Đạt', 'Nam', 'Đồng Văn Cống', 'nvtdat@gmail.com', 927033511, '0000-00-00 00:00:00', 'admin', NULL),
(8, 'user999', '$2b$10$nBRkE5BCOfRDezU8mnUeeuA9LSuRk8SLGkUkPY0Yw7Tvu1KmEwRNm', 'Nguyễn Đan Huy', 'Nam', '149 nguyen de', 'ngdanhuy147@gmail.com', 927033511, '2024-12-24 12:17:28', 'user', 'chibi_keqing-1744941361587-420943169.png'),
(9, 'npc123', '$2b$10$KB5HBFW86aCZVL/I9D83AONDaU0sXxEXnrG8YrZSs8ZxyFxK.LfbO', 'NPC', 'Nam', 'NPC', 'NPC147@gmail.com', 927033511, '2025-04-12 10:26:15', 'user', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `nhapkho`
--

CREATE TABLE `nhapkho` (
  `manhapkho` int(11) NOT NULL,
  `ngaynhapkho` datetime NOT NULL,
  `ghichu` varchar(250) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `nhapkho`
--

INSERT INTO `nhapkho` (`manhapkho`, `ngaynhapkho`, `ghichu`) VALUES
(31, '2024-12-17 10:33:00', ''),
(32, '2024-12-24 10:44:00', 'tốt'),
(33, '2024-12-23 11:34:00', 'dadada'),
(34, '2024-12-26 05:35:00', 'dada'),
(35, '2024-12-25 10:12:00', 'dadadada'),
(36, '2024-12-25 10:13:00', 'dadada'),
(37, '2025-04-11 08:38:00', 'Đủ'),
(38, '2025-04-11 08:39:00', 'haha'),
(39, '2025-05-11 14:29:00', 'dada'),
(40, '2025-05-13 16:46:00', 'mới');

-- --------------------------------------------------------

--
-- Table structure for table `nhaxuatban`
--

CREATE TABLE `nhaxuatban` (
  `manhaxuatban` int(11) NOT NULL,
  `tennhaxuatban` varchar(250) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `nhaxuatban`
--

INSERT INTO `nhaxuatban` (`manhaxuatban`, `tennhaxuatban`) VALUES
(1, 'Kim Đồng'),
(3, 'Phương Nam');

-- --------------------------------------------------------

--
-- Table structure for table `sach`
--

CREATE TABLE `sach` (
  `masach` int(11) NOT NULL,
  `tensach` varchar(250) NOT NULL,
  `tacgia` varchar(250) NOT NULL DEFAULT 'Không rõ',
  `hinhanh` varchar(500) NOT NULL,
  `gia` int(11) NOT NULL,
  `mota` varchar(5000) NOT NULL,
  `luotxem` int(11) NOT NULL DEFAULT 0,
  `manhaxuatban` int(11) NOT NULL,
  `matheloai` int(11) NOT NULL,
  `hinhanh_phu` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sach`
--

INSERT INTO `sach` (`masach`, `tensach`, `tacgia`, `hinhanh`, `gia`, `mota`, `luotxem`, `manhaxuatban`, `matheloai`, `hinhanh_phu`) VALUES
(7, '3 báo ', 'Đồng Tháp', 'z4842488950480_07b9ab32210add2ed9d885d0edebd6b2.jpg', 1000, 'dadada', 7055, 1, 1, NULL),
(10, 'Hành trình của Elaina - Vol 1', ' Shiraishi Jogi', '966f23bdc109b0b897bf8af27e39a5be.jpg_720x720q80.jpg', 89000, 'Lấy bối cảnh trong một thế giới giống như thời Trung cổ nơi ma thuật tồn tại, xoay quanh cô phù thủy Elaina du hành trên thế giới, đến thăm nhiều nơi và con người khác nhau. Mỗi câu chuyện kể về từng mẩu chuyện mà cô trải qua trong chuyến phiên lưu.', 938, 1, 1, NULL),
(11, 'Hành trình của Elaina - Vol 2', ' Shiraishi Jogi', '766f22dbca3d6263cd9b74cb10dd330e.jpg', 10000, 'Lấy bối cảnh trong một thế giới giống như thời Trung cổ nơi ma thuật tồn tại, xoay quanh cô phù thủy Elaina du hành trên thế giới, đến thăm nhiều nơi và con người khác nhau. Mỗi câu chuyện kể về từng mẩu chuyện mà cô trải qua trong chuyến phiên lưu.', 44, 1, 1, NULL),
(12, 'Hành trình của Elaina - Vol 3', ' Shiraishi Jogi', 'LN_3-C_VN.webp', 89000, 'Lấy bối cảnh trong một thế giới giống như thời Trung cổ nơi ma thuật tồn tại, xoay quanh cô phù thủy Elaina du hành trên thế giới, đến thăm nhiều nơi và con người khác nhau. Mỗi câu chuyện kể về từng mẩu chuyện mà cô trải qua trong chuyến phiên lưu.', 7, 1, 1, NULL),
(13, 'Hành trình của Elaina - Vol 4', ' Shiraishi Jogi', 'vn-11134207-7r98o-lmmv724odb6nf5.jpg', 89000, 'Lấy bối cảnh trong một thế giới giống như thời Trung cổ nơi ma thuật tồn tại, xoay quanh cô phù thủy Elaina du hành trên thế giới, đến thăm nhiều nơi và con người khác nhau. Mỗi câu chuyện kể về từng mẩu chuyện mà cô trải qua trong chuyến phiên lưu.', 5, 1, 1, NULL),
(14, 'Hành trình của Elaina - Vol 5', ' Shiraishi Jogi', 'LN_5-C_VN.webp', 89000, 'Lấy bối cảnh trong một thế giới giống như thời Trung cổ nơi ma thuật tồn tại, xoay quanh cô phù thủy Elaina du hành trên thế giới, đến thăm nhiều nơi và con người khác nhau. Mỗi câu chuyện kể về từng mẩu chuyện mà cô trải qua trong chuyến phiên lưu.', 3, 1, 1, NULL),
(15, 'Hành trình của Elaina - Vol 6', ' Shiraishi Jogi', 'LN_6-C_VN.webp', 89000, 'Lấy bối cảnh trong một thế giới giống như thời Trung cổ nơi ma thuật tồn tại, xoay quanh cô phù thủy Elaina du hành trên thế giới, đến thăm nhiều nơi và con người khác nhau. Mỗi câu chuyện kể về từng mẩu chuyện mà cô trải qua trong chuyến phiên lưu.', 7, 1, 1, NULL),
(16, 'Hành trình của Elaina - Vol 7', ' Shiraishi Jogi', 'c5a543f7c9024a14103bb4d609f26803.jpg', 89000, 'Lấy bối cảnh trong một thế giới giống như thời Trung cổ nơi ma thuật tồn tại, xoay quanh cô phù thủy Elaina du hành trên thế giới, đến thăm nhiều nơi và con người khác nhau. Mỗi câu chuyện kể về từng mẩu chuyện mà cô trải qua trong chuyến phiên lưu.', 9, 1, 1, NULL),
(17, 'Hành trình của Elaina - Vol 8', ' Shiraishi Jogi', 'LN_8-C_VN.webp', 89000, 'Lấy bối cảnh trong một thế giới giống như thời Trung cổ nơi ma thuật tồn tại, xoay quanh cô phù thủy Elaina du hành trên thế giới, đến thăm nhiều nơi và con người khác nhau. Mỗi câu chuyện kể về từng mẩu chuyện mà cô trải qua trong chuyến phiên lưu.', 3, 1, 1, NULL),
(18, 'Hành trình của Elaina - Vol 9', ' Shiraishi Jogi', '262f0a4d21b757640f5d942a06dc911e.jpg', 89000, 'Lấy bối cảnh trong một thế giới giống như thời Trung cổ nơi ma thuật tồn tại, xoay quanh cô phù thủy Elaina du hành trên thế giới, đến thăm nhiều nơi và con người khác nhau. Mỗi câu chuyện kể về từng mẩu chuyện mà cô trải qua trong chuyến phiên lưu.', 2, 1, 1, NULL),
(19, 'Hành trình của Elaina - Vol 14', ' Shiraishi Jogi', 'vn-11134207-7r98o-lsl4cjxyzixl92.jpg', 89000, 'Lấy bối cảnh trong một thế giới giống như thời Trung cổ nơi ma thuật tồn tại, xoay quanh cô phù thủy Elaina du hành trên thế giới, đến thăm nhiều nơi và con người khác nhau. Mỗi câu chuyện kể về từng mẩu chuyện mà cô trải qua trong chuyến phiên lưu.', 58, 1, 1, '[\"269cf18d3dfb3834eff48bda08d329cb.jpg-1741115821737-185765441.webp\",\"f883f5d5258d3342333e3ffe2a19bf7d.jpg-1741115821737-526367274.webp\",\"sg-11134201-7rcf3-lsqg90e03wyfb3@resize_w900_nl-1741115821740-886786019.webp\"]'),
(21, 'Oregairu - Vol 1', ' Wataru Watari', 'Oregairu_vol01_englishcover.webp', 79000, 'Thanh xuân', 15, 1, 2, NULL),
(29, 'DẪU CÓ RA ĐI VẪN SẼ CƯỜI - Mộc Trầm (Thích Đạo Quang)', 'Thích Đạo Quang', '0300cca1bbb05ac0c1ca7eaa1ddde186.jpg-1744337900113-284573818.webp', 56000, '\"Chỉ muốn rằng, quyển sách này sẽ chạm đến trái tim của những con người đã từng lạc bước ngoài kia và cả những người trẻ đang chập chững bước vào đời. Mong sao, khi gấp quyển sách lại, người ta sẽ yêu nhiều hơn cái cuộc đời bình sinh ngắn ngủi này. Họ sẽ thương nau hơn, chấp nhận và bao dung hơn những điều còn khiếm khuyết trong cuộc sống. Để cho dù có bất chợt ra đi, họ vẫn sẽ mỉm cười vì không còn gì băn khoăn và nuối tiếc.\r\n\r\nGửi đến những người thương, những người đã và đang hiện hữu trong cuộc đời tôi lời nguyện cầu bình an và trân trọng. Xin cúi mình tạ lỗi với những ai tô đã vô tình làm tổn thương họ, đã từng lạc nhau trong khoảnh khắc nào đõ giữa chông chênh kiếp người. Cho dù có chuyện gì xảy ra đi nữa, tôi vẫn sẽ nhìn họ bằng con mắt nguyên sơ như ngày đầu mới gặp. Bởi vì sẽ không biết được rằng, giữa cuộc sống vô thường, tôi, họ, ai sẽ là người tiếp theo bước chân về cõi ấy, nơi của những linh hồn hội tụ.\r\n\r\nVậy nên, tôi thật lòng trân trọng.\r\n\r\nĐầy trân trọng!\"\r\n\r\n- Tác giả Mộc Trầm (Đại Đức Thích Đạo Quang)\r\n\r\n\"Dẫu có ra đi vẫn sẽ cười cho ta thấy được một cái kết mà chưa hết. Trong đó, cái chết chỉ là kết thúc một hành trình để bắt đầu cho một hành trình mới thiêng liêng và cao quý hơn nữa trong mỗi chúng ta trên cuộc đời này. Chính vì thế, cho dù cuộc đời này chúng ta có sai bao nhiêu lần đi chăng nữa, thì cuối cùng, nếu ta nhận biết lỗi lầm của mình mà tu sửa thì những gì ta tu sửa đó đáng giá không có gì đổi được. Vì thế, biết lỗi mà sửa lỗi là điều đáng trân trọng vô cùng.\"\r\n\r\n- Nguyễn Anh Dũng, Sáng lập SBOOKS.\r\n', 41, 3, 6, '[\"4cf48fd9962d35ca6f226d32fe69da57.jpg-1744337943969-764044619.webp\",\"9deae20fa8cc5ba255d21efc8e67b3c9.jpg-1744337943969-821441066.webp\",\"13f926f35994484d30b836aec2c9d7e4.jpg-1744337943971-867522456.webp\",\"87deb60ee30373fe970fb983f9e2481f.jpg-1744337943972-428268001.webp\"]'),
(33, 'Giữa Mênh Mông Cuộc Đời, Tôi Lạc Mất Thanh Xuân - Bản Quyền', 'Nguyễn Võ Thành Đạt', '9330587977b2fd24b0b14cbf4e538eab.jpg-1745467586042-402265398.webp', 74200, 'Sách - Giữa Mênh Mông Cuộc Đời, Tôi Lạc Mất Thanh Xuân\r\n\r\n\r\n\r\nThanh xuân như một cơn mưa rào, dù cho bạn từng bị cảm lạnh vì tắm mưa, bạn vẫn muốn được đắm mình trong cơn mưa ấy lần nữa.”\r\n\r\nKhánh Mây, hay còn được biết đến qua cái tên Mây Podcast, sẽ đưa bạn đắm chìm vào cơn mưa rào đầy những khoắc khoải nhớ thương ấy qua tác phẩm đầu tay “Giữa mênh mông cuộc đời, tôi lạc mất thanh xuân”.\r\n\r\nCuốn sách là bức tranh chân thực về tuổi trẻ và hành trình trưởng thành của chính tác giả, từ đó, ta như được sống lại một phần thanh xuân của mình qua từng trang sách.\r\n\r\nNhững ký ức thời thơ ấu, những rung động đầu đời, những bài học về gia đình, về tình bạn, về cuộc sống trên hành trình tập lớn, năm tháng thanh xuân ấy hiện lên đầy biến động nhưng cũng để lại những trải nghiệm, những kỉ niệm vô cùng quý giá.\r\n\r\nNhững lần vấp ngã, những lúc cảm thấy lạc lõng và yếu đuối, và cả những khoảnh khắc ngây ngô vụng dại ấy, tất cả đều là những mảnh ghép quan trọng tạo nên con người chúng ta hôm nay.\r\n\r\nNhìn lại quá khứ, trân trọng hiện tại và tự tin bước vào tương lai, “Giữa mênh mông cuộc đời, tôi lạc mất thanh xuân” như lời nhắn gửi đến mỗi người chúng ta rằng sống trọn vẹn tuổi xuân của mình, hãy trân trọng bản thân, trân trọng những gì mình đã trải qua và những gì mình đã trở thành.\r\n\r\nĐể rồi có thể tự tin khẳng định rằng:\r\n\r\n\"Tuổi xuân sẽ cảm thấy tiếc nuối nhường nào nếu để mất một cá thể đặc biệt như tôi cơ chứ?\r\n----------\r\n\r\nGooda tin rằng cuốn sách sẽ mang lại kiến thức thật bổ ích cùng những trải nghiệm thật tuyệt vời, hy vọng đây sẽ là 1 cuốn sách quý trên kệ sách của bạn!\r\n\r\nQUYỀN LỢI KHÁCH HÀNG KHI MUA SÁCH TẠI SHOP GOODA THƯ VIỆN SÁCH QUÝ:\r\n\r\n1. Đảm bảo 100% sách gốc bản quyền từ NXB;\r\n\r\n2. Quy cách đóng gói cẩn thận, trận trọng từng quyển sách;\r\n\r\n3. Xử lí đơn đặt hàng nhanh;\r\n\r\n4. Chính sách hỗ trợ đổi sách cho khách hàng thuận tiện khi gặp sự cố.\r\n', 7, 1, 6, '[\"2b8d75255f18e63d84e9ec28dc5c505b.jpg-1745467586044-476361604.webp\",\"8fc1da15fa1a96556eb40925842a5eab.png-1745467586047-304040828.webp\",\"4897f847db3820a2fadeba19289f1118.jpg-1745467586049-820996630.webp\",\"cc08ca1791e85d36a3544ff5abf93681.jpg-1745467586050-188780509.webp\"]'),
(34, 'Sách Em Giày Xanh, Anh Giày Đỏ (Tặng Thiệp mùa Hè lãng mạn)', 'Phan Hải Anh', '779c2f26e52e2e61b203f2a958ef8743.jpg-1745468726713-64005964.webp', 75000, 'Em Giày Xanh, Anh Giày Đỏ (Tặng Thiệp mùa Hè lãng mạn)\r\n\r\n\r\nNhà xuất bản : Báo Sinh Viên VN - Hoa Học Trò.\r\nCông ty phát hành : Báo Sinh Viên VN - Hoa Học Trò.\r\nTác giả : Phan Hải Anh.\r\nKích thước : Đang Cập Nhật cm.\r\nSố trang : Đang Cập Nhật.\r\nNgày xuất bản : 05-2017.\r\nLoại bìa : Bìa mềm.\r\n\r\nEm Giày Xanh, Anh Giày Đỏ\r\n\r\nEm Giày Xanh, Anh Giày Đỏ - Bản tình ca viết riêng cho mùa hạ\r\n\r\nBạn sẽ ở đâu trong mùa Hè rực rỡ đang chờ phía trước?\r\n\r\nỞ vùng biển xanh lấp lánh ánh bạc. Trên cung đường khám phá miền đất mới. Trong những workshop khám phá bản thân. Tại cửa hiệu làm thêm hay quẩn quanh trong chiếc tổ quen thuộc?\r\n\r\nMùa Hè này, bạn có thể ở bất cứ đâu. Nhưng cũng có thể đồng thời ở một chốn: Trong thế giới văn chương mà Jathy và Phan Hải Anh xây đắp. Mỗi một truyện ngắn trong tuyển tập Em Giày Xanh, Anh Giày Đỏ là một viên gạch mang sắc màu riêng. Bạn sẽ tìm thấy ở đó những viên gạch lấp lánh với màu sắc tươi vui, hạnh phúc, nhưng cũng có cả những tiếc nuối, thất vọng, những cảm xúc này như những nốt trầm trong bản nhạc cuộc sống mà chúng ta không thể trốn chạy, né tránh. Chỉ khi nào bạn dũng cảm nhìn thẳng vào những sai lầm, tổn thương như những nhân vật trong Em Giày Xanh, Anh Giày Đỏ thì mới có thể vượt qua đầm lầy đã khiến mình trượt ngã. Quá khứ không phải để tránh né, mà là để học hỏi và trân trọng hơn những điều đang tới.\r\n\r\nTruyện Phan Hải Anh viết thường có tiết tấu chậm rãi, hợp để nghe cùng những bản nhạc không lời, dịu nhẹ. Câu chữ ngắn gọn nhưng lại ẩn chứa một sức mạnh kì lạ, đẩy người đọc vào thế giới tưởng tượng, cho bạn cảm giác đang xem một bộ phim mà mỗi chi tiết nhỏ trong từng khuôn hình được “đạo diễn” chăm chút tỉ mỉ. Viết thoại thông minh cũng là một thế mạnh của cô nàng, có lúc khiến bạn bật cười vì sự hóm hỉnh, nhưng cũng có khi thấy buồn xiết bao vì những cuộc chuyện trò chỉ đôi dòng.\r\n\r\nCòn Jathy thì gợi ý bạn nên nghe Để nàng rơi xuống của Winky Thi khi đọc truyện của mình. Với Jathy, viết giống như việc hít thở, để giải tỏa hết những khúc mắc, bận tâm thông qua câu chữ, cho lòng nhẹ nhõm, bớt nghĩ suy. Qua tuyển tập Em Giày Xanh, Anh Giày Đỏ, Jathy muốn gửi gắm một thông điệp nhỏ đến độc giả của mình: “Mình mong tất cả những người trẻ sẽ không cảm thấy tự ti vì không có gì trong tay, hay không giỏi thứ gì hết. Chỉ cần là chính bạn thôi, chắc chắn sẽ là người phù hợp, mảnh ghép thích hợp nhất với ai đó”.', 2, 1, 7, NULL),
(35, 'Harry Potter Và Hòn Đá Phù Thuỷ - Tập 1 (Tái Bản)', 'J.K.Rowling', '8a2578f8a7796a1591def26eeccbaf24.jpg-1745497066392-12019867.webp', 122500, 'Khi một lá thư được gởi đến cho cậu bé Harry Potter bình thường và bất hạnh, cậu khám phá ra một bí mật đã được che giấu suốt cả một thập kỉ. Cha mẹ cậu chính là phù thủy và cả hai đã bị lời nguyền của Chúa tể Hắc ám giết hại khi Harry mới chỉ là một đứa trẻ, và bằng cách nào đó, cậu đã giữ được mạng sống của mình. Thoát khỏi những người giám hộ Muggle không thể chịu đựng nổi để nhập học vào trường Hogwarts, một trường đào tạo phù thủy với những bóng ma và phép thuật, Harry tình cờ dấn thân vào một cuộc phiêu lưu đầy gai góc khi cậu phát hiện ra một con chó ba đầu đang canh giữ một căn phòng trên tầng ba. Rồi Harry nghe nói đến một viên đá bị mất tích sở hữu những sức mạnh lạ kì, rất quí giá, vô cùng nguy hiểm, mà cũng có thể là mang cả hai đặc điểm trên.', 12, 1, 8, '[\"3612a629bf4013d0516d0d7b1cb0d951.jpg-1745497066394-523304227.webp\",\"a9c84f09e4ff4b06b5805723c06be1c3.jpg-1745497066396-717789554.webp\",\"a78154fd60408a3e23633185aa55eed3.jpg-1745497066399-335111547.webp\",\"af8e9678b9335546c1e89c7cde4668c9.jpg-1745497066400-891537312.webp\"]'),
(36, 'Harry Potter Và Phòng Chứa Bí Mật - Tập 2 (Tái Bản 2022)', 'J.K.Rowling', 'b5e42727d6e2f76dae9504b9b2f6520b.jpg-1745497343786-463597510.webp', 131000, 'Harry khổ sở mong ngóng cho kì nghỉ hè kinh khủng với gia đình Dursley kết thúc. Nhưng một con gia tinh bé nhỏ tội nghiệp đã cảnh báo cho Harry biết về mối nguy hiểm chết người đang chờ cậu ở trường Hogwarts.\r\n\r\nTrở lại trường học, Harry nghe một tin đồn đang lan truyền về phòng chứa bí mật, nơi cất giữ những bí ẩn đáng sợ dành cho giới phù thủy có nguồn gốc Muggle. Có kẻ nào đó đang phù phép làm tê liệt mọi người, khiến họ gần như đã chết, và một lời cảnh báo kinh hoàng được tìm thấy trên bức tường. Mối nghi ngờ hàng đầu – và luôn luôn sai lầm – là Harry. Nhưng một việc còn đen tối hơn thế đã được hé mở.', 14, 1, 8, '[\"92c05417c5d90ad9dbf4b0ae97e044e1.jpg-1745497343787-429422140.webp\",\"960d320173f44e7ea16d05c5d51e2d0e.jpg-1745497343788-471808480.webp\",\"b4394111f214e6ae21fe5062848e65cf.jpg-1745497343788-266429700.webp\"]'),
(37, 'Harry Potter', 'dadadad', '9deae20fa8cc5ba255d21efc8e67b3c9.jpg-1745805194842-418393459.webp', 12000, 'Harry Potter bình thường và bất hạnh, cậu khám phá ra một bí mật đã được che giấu suốt cả một thập kỉ. một trường đào tạo phù thủy với những bóng ma và phép thuật Rồi Harry nghe nói đến một viên đá bị mất tích sở hữu những sức mạnh lạ kì, rất quí giá', 9, 1, 1, NULL),
(38, 'Trung cố ma thuật', 'aaddd', '92c05417c5d90ad9dbf4b0ae97e044e1.jpg-1747129295554-407856150.webp', 89000, 'Chỉ muốn rằng, quyển sách này sẽ chạm đến trái tim của những con người đã từng lạc bước ngoài kia và cả những người trẻ đang chập chững', 5, 1, 1, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `sachkhuyenmai`
--

CREATE TABLE `sachkhuyenmai` (
  `masach` int(11) NOT NULL,
  `makhuyenmai` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sachkhuyenmai`
--

INSERT INTO `sachkhuyenmai` (`masach`, `makhuyenmai`) VALUES
(7, 6),
(10, 6),
(11, 6),
(12, 6),
(13, 6),
(14, 6),
(15, 6),
(16, 6),
(17, 6),
(18, 6),
(19, 6),
(21, 6),
(29, 6),
(33, 6),
(34, 6),
(35, 6),
(36, 6),
(37, 6),
(38, 6);

-- --------------------------------------------------------

--
-- Table structure for table `thanhtoan`
--

CREATE TABLE `thanhtoan` (
  `mathanhtoan` int(11) NOT NULL,
  `madonhang` int(11) NOT NULL,
  `phuongthucthanhtoan` varchar(50) NOT NULL,
  `sotien` int(11) NOT NULL,
  `ngaythanhtoan` datetime DEFAULT NULL,
  `trangthai` varchar(50) NOT NULL,
  `magiaodichnganhang` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `thanhtoan`
--

INSERT INTO `thanhtoan` (`mathanhtoan`, `madonhang`, `phuongthucthanhtoan`, `sotien`, `ngaythanhtoan`, `trangthai`, `magiaodichnganhang`) VALUES
(29, 55, 'VNPay', 62300, '2025-03-21 10:52:35', 'Đã thanh toán', '14858708'),
(30, 56, 'COD', 7000, NULL, 'Chưa thanh toán', NULL),
(31, 57, 'COD', 62300, NULL, 'Chưa thanh toán', NULL),
(32, 58, 'VNPay', 62300, '2025-03-21 11:27:07', 'Đã thanh toán', '14858793'),
(33, 59, 'VNPay', 62300, '2025-03-21 11:28:27', 'Đã thanh toán', '14858798'),
(34, 60, 'COD', 7000, NULL, 'Chưa thanh toán', NULL),
(35, 61, 'COD', 69300, NULL, 'Chưa thanh toán', NULL),
(36, 62, 'COD', 560700, NULL, 'Chưa thanh toán', NULL),
(37, 63, 'COD', 10000, NULL, 'Chưa thanh toán', NULL),
(38, 64, 'VNPay', 119000, '2025-04-23 13:04:53', 'Thất bại', '0'),
(39, 65, 'VNPay', 119000, '2025-04-28 09:07:07', 'Thất bại', '0'),
(40, 66, 'COD', 152500, NULL, 'Chưa thanh toán', NULL),
(41, 67, 'VNPay', 1000, '2025-05-13 14:27:57', 'Thất bại', '0'),
(42, 68, 'VNPay', 123288, '2025-05-13 16:51:17', 'Đã thanh toán', '14954289');

-- --------------------------------------------------------

--
-- Table structure for table `theloai`
--

CREATE TABLE `theloai` (
  `matheloai` int(11) NOT NULL,
  `tentheloai` varchar(250) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `theloai`
--

INSERT INTO `theloai` (`matheloai`, `tentheloai`) VALUES
(1, 'Manga'),
(2, 'Manhua'),
(3, 'Mahwa'),
(6, 'Văn học'),
(7, 'Truyện ngắn - Tản văn'),
(8, 'Truyện giả tưởng - Huyền bí');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `bansach_cuahang`
--
ALTER TABLE `bansach_cuahang`
  ADD PRIMARY KEY (`macuahang`);

--
-- Indexes for table `chitietdonhang`
--
ALTER TABLE `chitietdonhang`
  ADD PRIMARY KEY (`madonhang`,`masach`),
  ADD KEY `madonhang` (`madonhang`,`masach`),
  ADD KEY `masach` (`masach`);

--
-- Indexes for table `chitietnhapkho`
--
ALTER TABLE `chitietnhapkho`
  ADD PRIMARY KEY (`manhapkho`,`masach`),
  ADD KEY `masach` (`masach`),
  ADD KEY `manhapkho` (`manhapkho`);

--
-- Indexes for table `danhgia`
--
ALTER TABLE `danhgia`
  ADD PRIMARY KEY (`madanhgia`),
  ADD KEY `manguoidung` (`manguoidung`,`masach`),
  ADD KEY `masach` (`masach`);

--
-- Indexes for table `donhang`
--
ALTER TABLE `donhang`
  ADD PRIMARY KEY (`madonhang`),
  ADD KEY `manguoidung` (`manguoidung`);

--
-- Indexes for table `khuyenmai`
--
ALTER TABLE `khuyenmai`
  ADD PRIMARY KEY (`makhuyenmai`),
  ADD KEY `makhuyenmai` (`makhuyenmai`);

--
-- Indexes for table `luotlike`
--
ALTER TABLE `luotlike`
  ADD PRIMARY KEY (`maluotlike`),
  ADD KEY `masach` (`masach`,`manguoidung`),
  ADD KEY `manguoidung` (`manguoidung`);

--
-- Indexes for table `luotxem`
--
ALTER TABLE `luotxem`
  ADD PRIMARY KEY (`maluotxem`),
  ADD KEY `masach` (`masach`,`manguoidung`),
  ADD KEY `manguoidung` (`manguoidung`);

--
-- Indexes for table `nguoidung`
--
ALTER TABLE `nguoidung`
  ADD PRIMARY KEY (`manguoidung`),
  ADD UNIQUE KEY `manguoidung` (`manguoidung`);

--
-- Indexes for table `nhapkho`
--
ALTER TABLE `nhapkho`
  ADD PRIMARY KEY (`manhapkho`);

--
-- Indexes for table `nhaxuatban`
--
ALTER TABLE `nhaxuatban`
  ADD PRIMARY KEY (`manhaxuatban`);

--
-- Indexes for table `sach`
--
ALTER TABLE `sach`
  ADD PRIMARY KEY (`masach`),
  ADD UNIQUE KEY `masach` (`masach`),
  ADD KEY `manhasanxuat` (`manhaxuatban`,`matheloai`),
  ADD KEY `matheloai` (`matheloai`),
  ADD KEY `manhaxuatban` (`manhaxuatban`);

--
-- Indexes for table `sachkhuyenmai`
--
ALTER TABLE `sachkhuyenmai`
  ADD PRIMARY KEY (`masach`,`makhuyenmai`),
  ADD KEY `makhuyenmai` (`makhuyenmai`),
  ADD KEY `masach` (`masach`);

--
-- Indexes for table `thanhtoan`
--
ALTER TABLE `thanhtoan`
  ADD PRIMARY KEY (`mathanhtoan`),
  ADD KEY `madonhang` (`madonhang`);

--
-- Indexes for table `theloai`
--
ALTER TABLE `theloai`
  ADD PRIMARY KEY (`matheloai`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `bansach_cuahang`
--
ALTER TABLE `bansach_cuahang`
  MODIFY `macuahang` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `danhgia`
--
ALTER TABLE `danhgia`
  MODIFY `madanhgia` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=98;

--
-- AUTO_INCREMENT for table `donhang`
--
ALTER TABLE `donhang`
  MODIFY `madonhang` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=69;

--
-- AUTO_INCREMENT for table `khuyenmai`
--
ALTER TABLE `khuyenmai`
  MODIFY `makhuyenmai` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `luotlike`
--
ALTER TABLE `luotlike`
  MODIFY `maluotlike` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `luotxem`
--
ALTER TABLE `luotxem`
  MODIFY `maluotxem` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=54;

--
-- AUTO_INCREMENT for table `nguoidung`
--
ALTER TABLE `nguoidung`
  MODIFY `manguoidung` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `nhapkho`
--
ALTER TABLE `nhapkho`
  MODIFY `manhapkho` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT for table `nhaxuatban`
--
ALTER TABLE `nhaxuatban`
  MODIFY `manhaxuatban` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `sach`
--
ALTER TABLE `sach`
  MODIFY `masach` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;

--
-- AUTO_INCREMENT for table `thanhtoan`
--
ALTER TABLE `thanhtoan`
  MODIFY `mathanhtoan` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

--
-- AUTO_INCREMENT for table `theloai`
--
ALTER TABLE `theloai`
  MODIFY `matheloai` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `chitietdonhang`
--
ALTER TABLE `chitietdonhang`
  ADD CONSTRAINT `chitietdonhang_ibfk_2` FOREIGN KEY (`masach`) REFERENCES `sach` (`masach`),
  ADD CONSTRAINT `fk_madonhang` FOREIGN KEY (`madonhang`) REFERENCES `donhang` (`madonhang`) ON DELETE CASCADE;

--
-- Constraints for table `chitietnhapkho`
--
ALTER TABLE `chitietnhapkho`
  ADD CONSTRAINT `chitietnhapkho_ibfk_1` FOREIGN KEY (`masach`) REFERENCES `sach` (`masach`),
  ADD CONSTRAINT `chitietnhapkho_ibfk_2` FOREIGN KEY (`manhapkho`) REFERENCES `nhapkho` (`manhapkho`);

--
-- Constraints for table `danhgia`
--
ALTER TABLE `danhgia`
  ADD CONSTRAINT `danhgia_ibfk_1` FOREIGN KEY (`manguoidung`) REFERENCES `nguoidung` (`manguoidung`),
  ADD CONSTRAINT `danhgia_ibfk_2` FOREIGN KEY (`masach`) REFERENCES `sach` (`masach`);

--
-- Constraints for table `donhang`
--
ALTER TABLE `donhang`
  ADD CONSTRAINT `donhang_ibfk_1` FOREIGN KEY (`manguoidung`) REFERENCES `nguoidung` (`manguoidung`);

--
-- Constraints for table `luotlike`
--
ALTER TABLE `luotlike`
  ADD CONSTRAINT `luotlike_ibfk_1` FOREIGN KEY (`manguoidung`) REFERENCES `nguoidung` (`manguoidung`),
  ADD CONSTRAINT `luotlike_ibfk_2` FOREIGN KEY (`masach`) REFERENCES `sach` (`masach`);

--
-- Constraints for table `luotxem`
--
ALTER TABLE `luotxem`
  ADD CONSTRAINT `luotxem_ibfk_1` FOREIGN KEY (`manguoidung`) REFERENCES `nguoidung` (`manguoidung`),
  ADD CONSTRAINT `luotxem_ibfk_2` FOREIGN KEY (`masach`) REFERENCES `sach` (`masach`) ON DELETE CASCADE;

--
-- Constraints for table `sach`
--
ALTER TABLE `sach`
  ADD CONSTRAINT `sach_ibfk_2` FOREIGN KEY (`matheloai`) REFERENCES `theloai` (`matheloai`),
  ADD CONSTRAINT `sach_ibfk_3` FOREIGN KEY (`manhaxuatban`) REFERENCES `nhaxuatban` (`manhaxuatban`);

--
-- Constraints for table `sachkhuyenmai`
--
ALTER TABLE `sachkhuyenmai`
  ADD CONSTRAINT `sachkhuyenmai_ibfk_1` FOREIGN KEY (`masach`) REFERENCES `sach` (`masach`),
  ADD CONSTRAINT `sachkhuyenmai_ibfk_2` FOREIGN KEY (`makhuyenmai`) REFERENCES `khuyenmai` (`makhuyenmai`);

--
-- Constraints for table `thanhtoan`
--
ALTER TABLE `thanhtoan`
  ADD CONSTRAINT `thanhtoan_ibfk_1` FOREIGN KEY (`madonhang`) REFERENCES `donhang` (`madonhang`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
