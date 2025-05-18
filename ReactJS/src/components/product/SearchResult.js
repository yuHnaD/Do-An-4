import React, { useEffect, useState } from "react"; 
import { useLocation, Link } from "react-router-dom";
import axios from "axios";
import { formatPrice } from '../../utils/utils'; // Hàm định dạng giá

function SearchResults() {
    const location = useLocation();
    const [products, setProducts] = useState([]);
    const [groups, setGroups] = useState([]); // Danh mục sản phẩm
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortOption, setSortOption] = useState('');
    const [selectedGroup, setSelectedGroup] = useState(''); // Nhóm sản phẩm được chọn
    const [currentPage, setCurrentPage] = useState(1);
    const [productsPerPage] = useState(8);
    const [allProducts, setAllProducts] = useState([]); // Danh sách đầy đủ

    // Lấy query từ URL
    const query = new URLSearchParams(location.search).get("query");

    useEffect(() => {
        const fetchSearchResults = async () => {
            try {
                const response = await axios.get(`http://localhost:4000/api/product/search?query=${query}`);
                if (response.data && response.data.products) {
                    setAllProducts(response.data.products);
                    setProducts(response.data.products);
                }
            } catch (error) {
                setError('Có lỗi khi tải kết quả tìm kiếm.');
                console.error("Error fetching search results:", error);
            } finally {
                setLoading(false);
            }
        };

        const fetchGroups = async () => {
            try {
                const response = await axios.get('http://localhost:4000/api/product/groups');
                setGroups(response.data);
            } catch (err) {
                setError('Có lỗi khi tải danh mục sản phẩm.');
                console.error("Error fetching groups:", err);
            }
        };

        if (query) {
            fetchSearchResults();
        }
        fetchGroups();
    }, [query]);

    // Hàm xử lý sắp xếp sản phẩm
    const handleSortChange = (option) => {
        setSortOption(option);
        let sortedProducts = [...allProducts]; // Luôn bắt đầu từ danh sách đầy đủ
      
        if (option === 'price-asc') {
          // Sắp xếp theo giá tăng dần
          sortedProducts.sort((a, b) => a.giaKhuyenMai - b.giaKhuyenMai);
        } else if (option === 'price-desc') {
          // Sắp xếp theo giá giảm dần
          sortedProducts.sort((a, b) => b.giaKhuyenMai - a.giaKhuyenMai);
        } else if (option === 'name-asc') {
          // Sắp xếp theo tên A-Z
          sortedProducts.sort((a, b) => a.tensach.localeCompare(b.tensach));
        } else if (option === 'name-desc') {
          // Sắp xếp theo tên Z-A
          sortedProducts.sort((a, b) => b.tensach.localeCompare(a.tensach));
        } else if (option === 'discount') {
          // Lọc sản phẩm giảm giá
          sortedProducts = sortedProducts.filter((p) => p.giaKhuyenMai < p.giaGoc || p.phantramgiamgia > 0);
        } else if (option === 'no-discount') {
          // Lọc sản phẩm không giảm giá
          sortedProducts = sortedProducts.filter((p) => p.giaKhuyenMai === p.giaGoc || p.phantramgiamgia === null);
        }
        setProducts(sortedProducts); // Cập nhật danh sách hiển thị
    };

    // Hàm xử lý thay đổi nhóm sản phẩm
    const handleGroupChange = (groupId) => {
        setSelectedGroup(groupId);
        setLoading(true);
        setCurrentPage(1); // Reset trang về đầu khi thay đổi nhóm
        const fetchByGroup = async () => {
            try {
                const response = groupId
                    ? await axios.get(`http://localhost:4000/api/product/group/${groupId}?query=${query}`)
                    : await axios.get(`http://localhost:4000/api/product/search?query=${query}`);
                setAllProducts(response.data.products || response.data);
                setProducts(response.data.products || response.data); // Cập nhật lại products khi nhóm thay đổi
            } catch (error) {
                setError('Có lỗi khi tải sản phẩm.');
            } finally {
                setLoading(false);
            }
        };
        fetchByGroup();
    };

    // Phân trang sản phẩm
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);

    // Xử lý thay đổi trang
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Tính tổng số trang
    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(products.length / productsPerPage); i++) {
        pageNumbers.push(i);
    }

    if (loading) return <div>Đang tải...</div>;
    if (error) return <div className="text-center text-danger">{error}</div>;

    return (
        <div className="container my-4">
            <div className="row">
                {/* Sidebar danh mục bên trái */}
                <div className="col-md-3">
                    <h4 className="mb-3">Danh mục sản phẩm</h4>
                    <div className="sidebar">
                        <ul className="list-group">
                            <li
                                className={`list-group-item ${selectedGroup === '' ? 'active' : ''}`}
                                onClick={() => handleGroupChange('')}
                                style={{ cursor: 'pointer' }}
                            >
                                Tất cả thể loại
                            </li>
                            {groups.map((group) => (
                                <li
                                    key={group.matheloai}
                                    className={`list-group-item ${selectedGroup === group.matheloai ? 'active' : ''}`}
                                    onClick={() => handleGroupChange(group.matheloai)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    {group.tenLoai}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Danh sách sản phẩm */}
                <div className="col-md-9">
                    {/* Thanh sắp xếp */}
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h4 className="mb-0">Danh sách sản phẩm</h4>
                        {/* <h4>Kết quả tìm kiếm cho: "{query}"</h4> */}
                        <select
                            className="form-select w-auto"
                            value={sortOption}
                            onChange={(e) => handleSortChange(e.target.value)}
                            >
                            <option value="">Tất cả sách</option>
                            <option value="price-asc">Giá: Thấp đến Cao</option>
                            <option value="price-desc">Giá: Cao đến Thấp</option>
                            <option value="name-asc">Tên: A-Z</option>
                            <option value="name-desc">Tên: Z-A</option>
                            <option value="discount">Giảm giá</option>
                            <option value="no-discount">Không giảm giá</option>
                        </select>
                    </div>

                    {/* Danh sách sản phẩm */}
                    <div className="row">
                        {currentProducts.length > 0 ? (
                            currentProducts.map((product) => (
                            <div className="col-sm-6 col-md-4 col-lg-3 mb-4" key={product.masach}>
                                <div className="card product-card h-100 shadow-sm">
                                {/* Hiển thị nhãn giảm giá nếu có */}
                                {product.phantramgiamgia > 0 && (
                                    <div
                                    className="badge bg-danger text-white position-absolute"
                                    style={{ top: '10px', left: '10px', zIndex: '1' }}
                                    >
                                    -{product.phantramgiamgia}%
                                    </div>
                                )}
                                <img
                                    src={`http://localhost:4000/uploads/${product.hinhanh}`}
                                    alt={product.tensach}
                                    className="card-img-top"
                                    style={{ height: '250px', objectFit: 'cover' }}
                                />
                                <div className="card-body">
                                    <h5 className="card-title text-truncate">{product.tensach}</h5>
                                    <p className="card-price">
                                    {/* Hiển thị giá gốc nếu có khuyến mãi */}
                                    {product.giaKhuyenMai < product.giaGoc && (
                                        <span className="text-muted text-decoration-line-through me-2">
                                        {formatPrice(product.giaGoc)}
                                        </span>
                                    )}
                                    {/* Hiển thị giá sau khuyến mãi */}
                                    <span className="text-danger fw-bold">
                                        {formatPrice(product.giaKhuyenMai)}
                                    </span>
                                    </p>
                                    <Link to={`/detail-product/${product.masach}`} className="btn btn-sm btn-outline-primary">
                                    Xem Chi Tiết
                                    </Link>
                                </div>
                                </div>
                            </div>
                            ))
                        ) : (
                            <div className="col-12 text-center">
                            <p>Không có sản phẩm nào phù hợp với từ khóa "{query}"!</p>
                            </div>
                        )}
                    </div>

                    {/* Phân trang */}
                    <div className="d-flex justify-content-center mt-4">
                        <nav>
                            <ul className="pagination">
                                {pageNumbers.map((number) => (
                                    <li key={number} className="page-item">
                                        <button
                                            onClick={() => paginate(number)}
                                            className={`page-link ${currentPage === number ? 'active' : ''}`}
                                        >
                                            {number}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SearchResults;
