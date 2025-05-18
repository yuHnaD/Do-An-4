import express from "express";
import homeModel from '../services/homeModel.js';

// const filterOrders = async (req, res) => {
//     try {
//         // Lấy tham số từ query string (năm, tháng, ngày)
//         const { year, month, day } = req.query;

//         // Lấy năm hiện tại nếu không có năm được chọn
//         const currentYear = new Date().getFullYear();

//         // Nếu không có năm lọc, sử dụng năm hiện tại
//         const filterYear = year || currentYear;

//         // Lấy dữ liệu thống kê theo các tham số lọc
//         const filteredOrders = await homeModel.getFilteredOrders(filterYear, month, day);

//         // Lấy dữ liệu tổng quan khác (ví dụ số sản phẩm, số đơn hàng, số người dùng)
//         const totalProducts = await homeModel.getTotalProducts();
//         const totalOrders = await homeModel.getTotalOrders();
//         const totalUsers = await homeModel.getTotalUsers();

//         // Nếu không có giá trị lọc tháng, hiển thị dữ liệu cho tất cả các tháng trong năm
//         let orderData;
//         if (!month && !day) {
//             orderData = await homeModel.getFilteredOrders(filterYear);  // Lấy dữ liệu theo năm
//         } else {
//             orderData = filteredOrders;  // Dữ liệu lọc theo tháng hoặc ngày
//         }

//         const months = Array.from({ length: 12 }, (_, i) => `Tháng ${i + 1}`);
//         const ordersByMonth = months.map(monthName => {
//             const order = orderData.find(order => `Tháng ${order.month}` === monthName);
//             return order ? order.totalOrders : 0;  // Nếu không có dữ liệu cho tháng, trả về 0
//         });

//         // Lấy tất cả các năm để hiển thị trong dropdown chọn năm
//         const years = await homeModel.getYears();

//         // Render trang chủ với các dữ liệu cần thiết
//         return res.render('home', {
//             data: {
//                 title: 'Trang Chủ',
//                 page: 'main',
//                 totalProducts,
//                 totalOrders,
//                 totalUsers,
//                 months,
//                 ordersByMonth,
//                 years,
//                 filteredOrders,
//                 selectedYear: filterYear,
//                 selectedMonth: month,
//                 selectedDay: day,
//             }
//         });
//     } catch (error) {
//         console.error('Error filtering orders:', error);
//         return res.status(500).send('Có lỗi xảy ra khi lọc đơn hàng');
//     }
// };

const filterOrders = async (req, res) => {
    try {
        const { year, month, day } = req.query;
        const currentYear = new Date().getFullYear();
        const filterYear = year || currentYear;

        // Lấy dữ liệu thống kê đơn hàng theo các tham số lọc
        const filteredOrders = await homeModel.getFilteredOrders(filterYear, month, day);

        // Lấy dữ liệu tổng quan khác (sản phẩm, đơn hàng, người dùng)
        const totalProducts = await homeModel.getTotalProducts();
        const totalOrders = await homeModel.getTotalOrders();
        const totalUsers = await homeModel.getTotalUsers();

        let orderData;
        if (!month && !day) {
            orderData = await homeModel.getFilteredOrders(filterYear);  // Lấy theo năm
        } else {
            orderData = filteredOrders;  // Dữ liệu lọc theo tháng hoặc ngày
        }

        const months = Array.from({ length: 12 }, (_, i) => `Tháng ${i + 1}`);
        const revenueByMonth = months.map(monthName => {
            const order = orderData.find(order => `Tháng ${order.month}` === monthName);
            return order ? order.totalRevenue : 0;  // Tổng doanh thu (tonggia)
        });

        // Lấy các năm có trong đơn hàng
        const years = await homeModel.getYears();

        return res.render('home', {
            data: {
                title: 'Trang Chủ',
                page: 'main',
                totalProducts,
                totalOrders,
                totalUsers,
                months,
                revenueByMonth,  // Truyền tổng doanh thu theo tháng vào template
                years,
                filteredOrders,
                selectedYear: filterYear,
                selectedMonth: month,
                selectedDay: day,
            }
        });
    } catch (error) {
        console.error('Error filtering orders:', error);
        return res.status(500).send('Có lỗi xảy ra khi lọc đơn hàng');
    }
};


export default { filterOrders };
