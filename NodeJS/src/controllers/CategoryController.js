import categoryModel from '../services/categoryModel.js';

// // Lấy danh sách nhóm sản phẩm và render trang home
// const getAllNhom = async (req, res) => {
//     try {
//         const nhomList = await categoryModel.getAllNhom();
//         res.render('home', {
//             data: {
//                 title: 'Danh sách nhóm sản phẩm',
//                 page: 'category',
//                 categories: nhomList,
//             }
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Lỗi khi lấy danh sách nhóm sản phẩm' });
//     }
// };

const addCategory = (req, res) => {
    res.render('home', { data: { page: 'addCategory' } });
};

const getAllNhom = async (req, res) => {
    try {
        const search = req.query.search || '';
        const page = parseInt(req.query.page) || 1;
        const perPage = 5; // Số nhóm sản phẩm trên mỗi trang

        const offset = (page - 1) * perPage;
        const nhomList = await categoryModel.getPaginatedNhom(search, offset, perPage);
        const totalCategories = await categoryModel.countNhom(search);

        res.render('home', {
            data: {
                title: 'Danh sách nhóm sản phẩm',
                page: 'category',
                categories: nhomList,
                currentPage: page,
                totalPages: Math.ceil(totalCategories / perPage),
                search: search,
                perPage: perPage,
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi lấy danh sách nhóm sản phẩm' });
    }
};


// Thêm nhóm sản phẩm mới
const addNhom = async (req, res) => {
    const { ten } = req.body;
    try {
        if (!ten) {
            return res.status(400).json({ message: 'Tên nhóm không được để trống' });
        }

        const existingCategory = await categoryModel.getCategoryByName(ten);
        if (existingCategory) {
            return res.render('home', {
                data: {
                    page: 'addCategory',
                    message: 'Tên nhóm này đã tồn tại',
                }
            });
        }

        await categoryModel.addNhom(ten);
        res.redirect('/list-category');
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi thêm nhóm sản phẩm' });
    }
};

// Lấy thông tin nhóm sản phẩm để chỉnh sửa
const getCategoryForEdit = async (req, res) => {
    const categoryId = req.params.matheloai;
    try {
        const category = await categoryModel.getCategoryById(categoryId);
        if (category) {
            res.render('home', {
                data: {
                    page: 'editCategory',
                    category: category,
                }
            });
        } else {
            res.redirect('/list-category');
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi lấy thông tin nhóm sản phẩm' });
    }
};

// Cập nhật thông tin nhóm sản phẩm
const updateCategory = async (req, res) => {
    const { id, ten } = req.body; // Lấy id và tên nhóm từ form
    try {
        const existingCategory = await categoryModel.getCategoryByName(ten);
        if (existingCategory && existingCategory.matheloai !== id) {
            return res.render('home', {
                data: {
                    page: 'editCategory',
                    message: 'Tên nhóm này đã tồn tại',
                    category: { matheloai: id, ten }
                }
            });
        }

        await categoryModel.updateCategory(id, ten);
        res.redirect('/list-category');
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi cập nhật nhóm sản phẩm' });
    }
};

// Xóa nhóm sản phẩm
const deleteCategory = async (req, res) => {
    const categoryId = req.params.matheloai; // Lấy id nhóm sản phẩm từ URL
    try {
        await categoryModel.deleteCategory(categoryId);
        res.redirect('/list-category');
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi xóa nhóm sản phẩm' });
    }
};

export default { getAllNhom, addNhom, addCategory, getCategoryForEdit, updateCategory, deleteCategory };
