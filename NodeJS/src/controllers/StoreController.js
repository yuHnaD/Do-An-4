import storeModel from '../services/storeModel.js';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

const API_KEY = "4ff1c811d03744d0813b0d2d61eedcac"; // OpenCage API Key

// Hiển thị danh sách cửa hàng (trang admin)
const getAllStores = async (req, res) => {
    try {
        const stores = await storeModel.getAllStores();
        res.render('home', {
            data: {
                title: 'Danh sách cửa hàng',
                page: 'store',
                stores: stores,
            }
        });
    } catch (error) {
        console.error('Lỗi khi lấy danh sách cửa hàng:', error);
        res.status(500).render('home', {
            data: {
                title: 'Danh sách cửa hàng',
                page: 'store',
                stores: [],
                error: 'Không thể lấy danh sách cửa hàng!'
            }
        });
    }
};

// Hiển thị form thêm cửa hàng
const addStorePage = async (req, res) => {
    res.render('home', {
        data: {
            title: 'Thêm cửa hàng',
            page: 'addStore'
        }
    });
};

// Xử lý thêm cửa hàng
const addStore = async (req, res) => {
    const { tencuahang, diachi } = req.body;
    const hinhanh = req.files && req.files.hinhanh ? req.files.hinhanh[0].filename : null;

    if (!tencuahang || !diachi) {
        return res.status(400).render('home', {
            data: {
                title: 'Thêm cửa hàng',
                page: 'addStore',
                error: 'Vui lòng cung cấp đầy đủ thông tin!'
            }
        });
    }

    try {
        const response = await axios.get(
            `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(diachi)}&key=${API_KEY}`
        );

        if (response.data.results && response.data.results.length > 0) {
            const { lat, lng } = response.data.results[0].geometry;

            await storeModel.insertStore({ tencuahang, diachi, lat, lng, hinhanh });
            res.redirect('/list-stores');
        } else {
            res.status(400).render('home', {
                data: {
                    title: 'Thêm cửa hàng',
                    page: 'addStore',
                    error: 'Không tìm thấy tọa độ cho địa chỉ này!'
                }
            });
        }
    } catch (error) {
        console.error('Lỗi khi thêm cửa hàng:', error);
        res.status(500).render('home', {
            data: {
                title: 'Thêm cửa hàng',
                page: 'addStore',
                error: 'Lỗi khi thêm cửa hàng!'
            }
        });
    }
};

// Hiển thị form chỉnh sửa cửa hàng
const editStorePage = async (req, res) => {
    const macuahang = req.params.macuahang;
    try {
        const stores = await storeModel.getAllStores();
        const store = stores.find(s => s.macuahang == macuahang);
        if (!store) {
            return res.status(404).render('home', {
                data: {
                    title: 'Chỉnh sửa cửa hàng',
                    page: 'editStore',
                    error: 'Không tìm thấy cửa hàng!'
                }
            });
        }
        res.render('home', {
            data: {
                title: 'Chỉnh sửa cửa hàng',
                page: 'editStore',
                store: store
            }
        });
    } catch (error) {
        console.error('Lỗi khi lấy thông tin cửa hàng:', error);
        res.status(500).render('home', {
            data: {
                title: 'Chỉnh sửa cửa hàng',
                page: 'editStore',
                error: 'Lỗi khi lấy thông tin cửa hàng!'
            }
        });
    }
};

// Xử lý cập nhật cửa hàng
const editStore = async (req, res) => {
    const macuahang = req.params.macuahang;
    const { tencuahang, diachi } = req.body;
    const hinhanh = req.files && req.files.hinhanh ? req.files.hinhanh[0].filename : req.body.current_hinhanh;

    if (!tencuahang || !diachi) {
        return res.status(400).render('home', {
            data: {
                title: 'Chỉnh sửa cửa hàng',
                page: 'editStore',
                error: 'Vui lòng cung cấp đầy đủ thông tin!'
            }
        });
    }

    try {
        const response = await axios.get(
            `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(diachi)}&key=${API_KEY}`
        );

        if (response.data.results && response.data.results.length > 0) {
            const { lat, lng } = response.data.results[0].geometry;

            // Nếu có hình ảnh mới, xóa hình ảnh cũ
            if (req.files && req.files.hinhanh) {
                const stores = await storeModel.getAllStores();
                const store = stores.find(s => s.macuahang == macuahang);
                if (store.hinhanh) {
                    const oldImagePath = path.join(process.cwd(), 'uploads', store.hinhanh);
                    if (fs.existsSync(oldImagePath)) {
                        fs.unlinkSync(oldImagePath);
                    }
                }
            }

            await storeModel.updateStore(macuahang, { tencuahang, diachi, lat, lng, hinhanh });
            res.redirect('/list-stores');
        } else {
            res.status(400).render('home', {
                data: {
                    title: 'Chỉnh sửa cửa hàng',
                    page: 'editStore',
                    error: 'Không tìm thấy tọa độ cho địa chỉ này!'
                }
            });
        }
    } catch (error) {
        console.error('Lỗi khi cập nhật cửa hàng:', error);
        res.status(500).render('home', {
            data: {
                title: 'Chỉnh sửa cửa hàng',
                page: 'editStore',
                error: 'Lỗi khi cập nhật cửa hàng!'
            }
        });
    }
};

// Xử lý xóa cửa hàng
const deleteStore = async (req, res) => {
    const macuahang = req.params.macuahang;
    try {
        const stores = await storeModel.getAllStores();
        const store = stores.find(s => s.macuahang == macuahang);
        if (store.hinhanh) {
            const imagePath = path.join(process.cwd(), 'uploads', store.hinhanh);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        const success = await storeModel.deleteStore(macuahang);
        if (success) {
            res.redirect('/list-stores');
        } else {
            res.status(404).render('home', {
                data: {
                    title: 'Danh sách cửa hàng',
                    page: 'store',
                    stores: [],
                    error: 'Không tìm thấy cửa hàng để xóa!'
                }
            });
        }
    } catch (error) {
        console.error('Lỗi khi xóa cửa hàng:', error);
        res.status(500).render('home', {
            data: {
                title: 'Danh sách cửa hàng',
                page: 'store',
                stores: [],
                error: 'Lỗi khi xóa cửa hàng!'
            }
        });
    }
};

// API lấy danh sách cửa hàng (cho frontend)
const getStoresAPI = async (req, res) => {
    try {
        const stores = await storeModel.getAllStores();
        res.status(200).json(stores);
    } catch (error) {
        console.error('Lỗi khi lấy danh sách cửa hàng:', error);
        res.status(500).json({ message: 'Lỗi khi lấy danh sách cửa hàng', error });
    }
};

export default { getAllStores, addStorePage, addStore, editStore, deleteStore, editStorePage, getStoresAPI };