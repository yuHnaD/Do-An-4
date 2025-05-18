import publishingModel from '../services/publishingModel.js';

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

const addPublishing = (req, res) => {
    res.render('home', { data: { page: 'addPublishing' } });
};

const getAllPublishing = async (req, res) => {
    try {
        const search = req.query.search || '';
        const page = parseInt(req.query.page) || 1;
        const perPage = 5; // Số nhà xuất bản trên mỗi trang

        const offset = (page - 1) * perPage;
        const nxbList = await publishingModel.getPaginatedPublishing(search, offset, perPage);
        const totalCategories = await publishingModel.countPubishing(search);

        res.render('home', {
            data: {
                title: 'Danh sách nhóm sản phẩm',
                page: 'listPublishing',
                publishings: nxbList,
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


// Thêm nhà xuất bản mới 
const addPublishings = async (req, res) => {
    const { ten } = req.body;
    try {
        if (!ten) {
            return res.status(400).json({ message: 'Tên nhóm không được để trống' });
        }

        const existingPublishing = await publishingModel.getPublishingByName(ten);
        if (existingPublishing) {
            return res.render('home', {
                data: {
                    page: 'addPublishing',
                    message: 'Tên nhóm này đã tồn tại',
                }
            });
        }

        await publishingModel.addPublishing(ten);
        res.redirect('/list-publishing');
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi thêm nhóm sản phẩm' });
    }
};

// Lấy thông tin nhà xuất bản để chỉnh sửa
const getPublishingForEdit = async (req, res) => {
    const publishingId = req.params.manhaxuatban;
    try {
        const publishing = await publishingModel.getPublishingById(publishingId);
        if (publishing) {
            res.render('home', {
                data: {
                    page: 'editPublishing',
                    publishing: publishing,
                }
            });
        } else {
            res.redirect('/list-publishing');
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi lấy thông tin nhóm sản phẩm' });
    }
};

// Cập nhật thông tin nhà xuất bản
const updatePublishing = async (req, res) => {
    const { id, ten } = req.body; // Lấy id và tên nhà xuất bản từ form
    try {
        const existingPublishing = await publishingModel.getPublishingByName(ten);
        if (existingPublishing && existingPublishing.manhaxuatban !== id) {
            return res.render('home', {
                data: {
                    page: 'editPublishing',
                    message: 'Tên nhà xuất bản này đã tồn tại',
                    manhaxuatban: { manhaxuatban: id, ten }
                }
            });
        }

        await publishingModel.updatePublishing(id, ten);
        res.redirect('/list-publishing');
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi cập nhật nhóm sản phẩm' });
    }
};

// Xóa nhà xuất bản
const deletePublishing = async (req, res) => {
    const publishingId = req.params.manhaxuatban; // Lấy id nhà xuất bản từ URL
    try {
        await publishingModel.deletePublishing(publishingId);
        res.redirect('/list-publishing');
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi xóa nhóm sản phẩm' });
    }
};

export default { getAllPublishing, addPublishing, addPublishings, getPublishingForEdit, updatePublishing, deletePublishing };
