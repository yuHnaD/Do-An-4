import warehouseModel from '../services/warehouseModel.js';
// Hiển thị trang nhập kho
const showImportWareHouse = async (req, res) => {
    try {
        const books = await warehouseModel.getAllBooks();  // Lấy danh sách sách
        res.render('home', {data: { title: 'Nhập kho', page: 'wareHouse', books }});
    } catch (error) {
        res.status(500).send('Lỗi khi lấy danh sách sản phẩm: ' + error.message);
    }
};

const showImportWarehouseList = async (req, res) => {
    try {
        const currentPage = parseInt(req.query.page) || 1;  // Trang hiện tại, mặc định là trang 1
        const limit = 5;  // Số lượng phiếu nhập kho mỗi trang
        const offset = (currentPage - 1) * limit;  // Vị trí bắt đầu để lấy dữ liệu

        const searchDate = req.query.searchDate || '';  // Nếu không có ngày tìm kiếm thì để trống

        const importWarehouses = await warehouseModel.getImportWarehouseList(limit, offset, searchDate);

        const totalWarehouses = await warehouseModel.getTotalImportWarehouses(searchDate);
        const totalPages = Math.ceil(totalWarehouses / limit);

        res.render('home', {
            data: {
                title: 'Danh sách phiếu nhập kho',
                page: 'listWarehouse',
                importWarehouses,
                currentPage,
                totalPages,
                limit,
                searchDate
            }
        });
    } catch (error) {
        res.status(500).send('Lỗi khi lấy danh sách phiếu nhập kho: ' + error.message);
    }
};

// Hiển thị chi tiết phiếu nhập kho
const showImportWarehouseDetails = async (req, res) => {
    const { id } = req.params;
    try {
        // Lấy thông tin chi tiết phiếu nhập kho
        const warehouseDetails = await warehouseModel.getImportWarehouseDetails(id);
        res.render('home', {data: { title: 'Chi tiết phiếu nhập kho', page: 'detailWarehouse',warehouseDetails }});
    } catch (error) {
        res.status(500).send('Lỗi khi lấy chi tiết phiếu nhập kho: ' + error.message);
    }
};

// Tìm kiếm sách
const searchBooks = async (req, res) => {
    const { query } = req.query;

    try {
        const books = await warehouseModel.searchBooks(query); // Gọi model để tìm sách
        res.json(books);
    } catch (error) {
        console.error('Lỗi khi tìm kiếm sách:', error.message);
        res.status(500).send('Lỗi khi tìm kiếm sách: ' + error.message);
    }
};


const importWareHouse = async (req, res) => {
    const { ngaynhapkho, ghichu, masach, soluong } = req.body;

    // Kiểm tra và log dữ liệu đầu vào
    console.log('Ngày nhập kho:', ngaynhapkho);
    console.log('Ghi chú:', ghichu);
    console.log('Mã sách:', masach);
    console.log('Số lượng:', soluong);

    // Kiểm tra và loại bỏ các giá trị undefined hoặc null
    if (!ngaynhapkho || !masach || !soluong) {
        return res.status(400).send('Dữ liệu đầu vào không hợp lệ');
    }

    // Kiểm tra xem masach và soluong có độ dài giống nhau không
    if (masach.length !== soluong.length) {
        return res.status(400).send('Số lượng sản phẩm và số lượng nhập kho không khớp');
    }

    try {
        // Thêm nhập kho vào bảng nhapkho
        const manhapkho = await warehouseModel.addImportWarehouse(ngaynhapkho, ghichu);
        console.log('Mã nhập kho:', manhapkho);  // Log mã nhập kho vừa tạo

        // Thêm chi tiết nhập kho vào bảng chitietnhapkho
        for (let i = 0; i < masach.length; i++) {
            // Kiểm tra từng masach và soluong trước khi thêm vào cơ sở dữ liệu
            if (masach[i] === undefined || soluong[i] === undefined || soluong[i] <= 0) {
                console.log('Sản phẩm không hợp lệ: Mã sách =', masach[i], ', Số lượng =', soluong[i]);
                continue; // Bỏ qua phần tử không hợp lệ
            }
            console.log(`Thêm chi tiết nhập kho: Mã sách = ${masach[i]}, Số lượng = ${soluong[i]}`);
            await warehouseModel.addImportWarehouseDetails(manhapkho, masach[i], soluong[i]);
        }

        res.redirect('/import-warehouse');
    } catch (error) {
        console.error('Lỗi khi nhập kho:', error.message);
        res.status(500).send('Lỗi khi nhập kho: ' + error.message);
    }
};

export default {showImportWareHouse, importWareHouse, searchBooks, showImportWarehouseList, showImportWarehouseDetails};
