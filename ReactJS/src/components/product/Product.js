// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { formatPrice } from '../../utils/utils';
// import { Link } from "react-router-dom";
// import { useLocation } from 'react-router-dom'; // Dùng để lấy query từ URL

// const Product = () => {
//   const [products, setProducts] = useState([]);
//   const [groups, setGroups] = useState([]);
//   const [selectedGroup, setSelectedGroup] = useState('');
//   const [sortOption, setSortOption] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [productsPerPage] = useState(8);
//   const [allProducts, setAllProducts] = useState([]);

//   const location = useLocation(); // Để lấy query từ URL
//   const searchQuery = new URLSearchParams(location.search).get('query'); // Lấy query từ URL

//   useEffect(() => {
//     const fetchGroups = async () => {
//       try {
//         const response = await axios.get('http://localhost:4000/api/product/groups');
//         setGroups(response.data);
//       } catch (err) {
//         setError('Có lỗi khi tải nhóm sản phẩm.');
//       }
//     };

//     const fetchProducts = async () => {
//       try {
//         const response = await axios.get('http://localhost:4000/api/product');
//         setAllProducts(response.data);
//         setProducts(response.data); 
//       } catch (err) {
//         setError('Có lỗi khi tải sản phẩm.');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchGroups();
//     fetchProducts();
//   }, []);

//   useEffect(() => {
//     let filteredProducts = [...allProducts];
  
//     // Lọc sản phẩm nếu có tìm kiếm
//     if (searchQuery) {
//       filteredProducts = filteredProducts.filter((product) =>
//         product.tensach.toLowerCase().includes(searchQuery.toLowerCase())
//       );
//     }
  
//     // Tạo bản sao mảng trước khi sắp xếp
//     let sortedProducts = [...filteredProducts];
  
//     // Áp dụng sắp xếp
//     if (sortOption) {
//       if (sortOption === 'price-asc') {
//         sortedProducts.sort((a, b) => a.giaKhuyenMai - b.giaKhuyenMai);
//       } else if (sortOption === 'price-desc') {
//         sortedProducts.sort((a, b) => b.giaKhuyenMai - a.giaKhuyenMai);
//       } else if (sortOption === 'name-asc') {
//         sortedProducts.sort((a, b) => a.tensach.localeCompare(b.tensach));
//       } else if (sortOption === 'name-desc') {
//         sortedProducts.sort((a, b) => b.tensach.localeCompare(a.tensach));
//       } else if (sortOption === 'discount') {
//         sortedProducts = sortedProducts.filter(
//           (p) => p.giaKhuyenMai < p.giaGoc || p.phantramgiamgia > 0
//         );
//       } else if (sortOption === 'no-discount') {
//         sortedProducts = sortedProducts.filter(
//           (p) => p.giaKhuyenMai === p.giaGoc || p.phantramgiamgia === null
//         );
//       }
//     }
//     // Cập nhật danh sách hiển thị
//     setProducts(sortedProducts);
//   }, [searchQuery, allProducts, sortOption]); // Lắng nghe khi searchQuery hoặc sortOption thay đổi

//   const handleGroupChange = async (groupId) => {
//     setSelectedGroup(groupId);
//     setLoading(true);
//     try {
//       const response = groupId
//         ? await axios.get(`http://localhost:4000/api/product/group/${groupId}`)
//         : await axios.get('http://localhost:4000/api/product');
//       setAllProducts(response.data); // Lưu danh sách đầy đủ của nhóm
//       setProducts(response.data); // Cập nhật danh sách hiển thị
//     } catch (err) {
//       setError('Có lỗi khi tải sản phẩm.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSortChange = (option) => {
//     setSortOption(option);
//   };

//   const handleIncreaseViewCount = async (productId) => {
//     try {
//       await axios.put(`http://localhost:4000/api/product/increase-view/${productId}`);
//     } catch (err) {
//       console.error('Lỗi khi tăng lượt xem:', err);
//     }
//   };

//   const indexOfLastProduct = currentPage * productsPerPage;
//   const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
//   const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);

//   const paginate = (pageNumber) => setCurrentPage(pageNumber);

//   const pageNumbers = [];
//   for (let i = 1; i <= Math.ceil(products.length / productsPerPage); i++) {
//     pageNumbers.push(i);
//   }

//   if (loading) return <div className="text-center">Đang tải...</div>;
//   if (error) return <div className="text-center text-danger">{error}</div>;

//   return (
//     <div className="container my-4">
//       <div className="row">
//         <div className="col-md-3">
//           <h4 className="mb-3">Danh mục sản phẩm</h4>
//           <div className="sidebar">
//             <ul className="list-group">
//               <li
//                 className={`list-group-item ${selectedGroup === '' ? 'active' : ''}`}
//                 onClick={() => handleGroupChange('')}
//                 style={{ cursor: 'pointer' }}
//               >
//                 Tất cả thể loại
//               </li>
//               {groups.map((group) => (
//                 <li
//                   key={group.matheloai}
//                   className={`list-group-item ${selectedGroup === group.matheloai ? 'active' : ''}`}
//                   onClick={() => handleGroupChange(group.matheloai)}
//                   style={{ cursor: 'pointer' }}
//                 >
//                   {group.tenLoai}
//                 </li>
//               ))}
//             </ul>
//           </div>
//         </div>

//         <div className="col-md-9">
//           <div className="d-flex justify-content-between align-items-center mb-4">
//             <h4 className="mb-0">Danh sách sản phẩm</h4>
//             <select
//               className="form-select w-auto"
//               value={sortOption}
//               onChange={(e) => handleSortChange(e.target.value)}
//             >
//               <option value="">Tất cả sách</option>
//               <option value="price-asc">Giá: Thấp đến Cao</option>
//               <option value="price-desc">Giá: Cao đến Thấp</option>
//               <option value="name-asc">Tên: A-Z</option>
//               <option value="name-desc">Tên: Z-A</option>
//               <option value="discount">Giảm giá</option>
//               <option value="no-discount">Không giảm giá</option>
//             </select>
//           </div>

//           <div className="row">
//             {currentProducts.length > 0 ? (
//               currentProducts.map((product) => (
//                 <div className="col-sm-6 col-md-4 col-lg-3 mb-4" key={product.masach}>
//                   <div className="card product-card h-100 shadow-sm position-relative">
//                     {product.phantramgiamgia > 0 && (
//                       <div
//                         className="badge bg-danger text-white position-absolute"
//                         style={{ top: '10px', left: '10px', zIndex: '1' }}
//                       >
//                         -{product.phantramgiamgia}%
//                       </div>
//                     )}
//                     <img
//                       src={`http://localhost:4000/uploads/${product.hinhanh}`}
//                       alt={product.tensach}
//                       className="card-img-top"
//                       style={{ height: '250px', objectFit: 'cover' }}
//                     />
//                     <div className="card-body">
//                       <h5 className="card-title text-truncate">{product.tensach}</h5>
//                       <p className="card-price">
//                         {product.giaKhuyenMai < product.giaGoc && (
//                           <span className="text-muted text-decoration-line-through me-2">
//                             {formatPrice(product.giaGoc)}
//                           </span>
//                         )}
//                         <span className="text-danger fw-bold">
//                           {formatPrice(product.giaKhuyenMai)}
//                         </span>
//                       </p>
//                       <p className="text-muted small">Lượt xem: {product.luotxem}</p>
//                       <Link
//                           to={`/detail-product/${product.masach}`}
//                           className="btn btn-sm btn-outline-primary"
//                           onClick={() => handleIncreaseViewCount(product.masach)}
//                         >
//                           Xem Chi Tiết
//                       </Link>
//                     </div>
//                   </div>
//                 </div>
//               ))
//             ) : (
//               <div className="col-12 text-center">
//                 <p>Không có sản phẩm nào!</p>
//               </div>
//             )}
//           </div>

//           <div className="d-flex justify-content-center mt-4">
//             <nav>
//               <ul className="pagination">
//                 {pageNumbers.map((number) => (
//                   <li key={number} className="page-item">
//                     <button
//                       onClick={() => paginate(number)}
//                       className={`page-link ${currentPage === number ? 'active' : ''}`}
//                     >
//                       {number}
//                     </button>
//                   </li>
//                 ))}
//               </ul>
//             </nav>
//           </div>
//         </div>
//       </div>
//       <img src="http://localhost:4000/uploads/have-fun.gif" alt="Image" width="160"  className="fixed-image" />
//     </div>
//   );
// };

// export default Product;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { formatPrice } from '../../utils/utils';
import { Link, useLocation } from 'react-router-dom';

const Product = () => {
  const [products, setProducts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]); // Changed to array for multi-selection
  const [sortOption, setSortOption] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(8);
  const [allProducts, setAllProducts] = useState([]);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000000);
  const [priceRangeMax, setPriceRangeMax] = useState(1000000);

  const location = useLocation();
  const searchQuery = new URLSearchParams(location.search).get('query');

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/product/groups');
        setGroups(response.data);
      } catch (err) {
        setError('Có lỗi khi tải nhóm sản phẩm.');
      }
    };

    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/product');
        setAllProducts(response.data);
        setProducts(response.data);
        const maxProductPrice = Math.max(...response.data.map((p) => p.giaKhuyenMai));
        setPriceRangeMax(maxProductPrice);
        setMaxPrice(maxProductPrice);
      } catch (err) {
        setError('Có lỗi khi tải sản phẩm.');
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
    fetchProducts();
  }, []);

  useEffect(() => {
    let filteredProducts = [...allProducts];

    // Lọc theo tìm kiếm
    if (searchQuery) {
      filteredProducts = filteredProducts.filter((product) =>
        product.tensach.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Lọc theo giá
    filteredProducts = filteredProducts.filter(
      (product) => product.giaKhuyenMai >= minPrice && product.giaKhuyenMai <= maxPrice
    );

    // Lọc theo danh mục (nếu có danh mục được chọn)
    if (selectedGroups.length > 0) {
      filteredProducts = filteredProducts.filter((product) =>
        selectedGroups.includes(product.matheloai)
      );
    }

    // Áp dụng sắp xếp
    let sortedProducts = [...filteredProducts];
    if (sortOption) {
      if (sortOption === 'price-asc') {
        sortedProducts.sort((a, b) => a.giaKhuyenMai - b.giaKhuyenMai);
      } else if (sortOption === 'price-desc') {
        sortedProducts.sort((a, b) => b.giaKhuyenMai - a.giaKhuyenMai);
      } else if (sortOption === 'name-asc') {
        sortedProducts.sort((a, b) => a.tensach.localeCompare(b.tensach));
      } else if (sortOption === 'name-desc') {
        sortedProducts.sort((a, b) => b.tensach.localeCompare(a.tensach));
      } else if (sortOption === 'discount') {
        sortedProducts = sortedProducts.filter(
          (p) => p.giaKhuyenMai < p.giaGoc || p.phantramgiamgia > 0
        );
      } else if (sortOption === 'no-discount') {
        sortedProducts = sortedProducts.filter(
          (p) => p.giaKhuyenMai === p.giaGoc || p.phantramgiamgia === null
        );
      }
    }

    setProducts(sortedProducts);
  }, [searchQuery, allProducts, sortOption, minPrice, maxPrice, selectedGroups]);

  const handleGroupChange = async (groupId) => {
    setLoading(true);
    try {
      let updatedSelectedGroups;
      if (groupId === '') {
        // If "Tất cả thể loại" is selected, clear other selections
        updatedSelectedGroups = [];
      } else {
        // Toggle the group ID in selectedGroups
        updatedSelectedGroups = selectedGroups.includes(groupId)
          ? selectedGroups.filter((id) => id !== groupId)
          : [...selectedGroups, groupId];
      }

      setSelectedGroups(updatedSelectedGroups);

      // Fetch products based on selected groups
      let response;
      if (updatedSelectedGroups.length === 0) {
        // If no groups are selected, fetch all products
        response = await axios.get('http://localhost:4000/api/product');
      } else {
        // Fetch products for all selected groups
        const productPromises = updatedSelectedGroups.map((id) =>
          axios.get(`http://localhost:4000/api/product/group/${id}`)
        );
        const responses = await Promise.all(productPromises);
        // Combine products from all selected groups and remove duplicates
        const combinedProducts = responses
          .flatMap((res) => res.data)
          .reduce((unique, product) => {
            return unique.some((p) => p.masach === product.masach)
              ? unique
              : [...unique, product];
          }, []);
        response = { data: combinedProducts };
      }

      setAllProducts(response.data);
      setProducts(response.data);
      const maxProductPrice = Math.max(...response.data.map((p) => p.giaKhuyenMai));
      setPriceRangeMax(maxProductPrice);
      setMaxPrice(maxProductPrice);
    } catch (err) {
      setError('Có lỗi khi tải sản phẩm.');
    } finally {
      setLoading(false);
    }
  };

  const handleSortChange = (option) => {
    setSortOption(option);
  };

  const handleIncreaseViewCount = async (productId) => {
    try {
      await axios.put(`http://localhost:4000/api/product/increase-view/${productId}`);
    } catch (err) {
      console.error('Lỗi khi tăng lượt xem:', err);
    }
  };

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(products.length / productsPerPage); i++) {
    pageNumbers.push(i);
  }

  if (loading) return <div className="text-center">Đang tải...</div>;
  if (error) return <div className="text-center text-danger">{error}</div>;

  return (
    <div className="container my-4">
      <div className="row">
        <div className="col-md-3">
          <h4 className="mb-3">Danh mục sản phẩm</h4>
          <div className="sidebar" style={{ position: 'sticky', top: '20px' }}>
            <div className="mb-3">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="all-groups"
                  checked={selectedGroups.length === 0}
                  onChange={() => handleGroupChange('')}
                />
                <label className="form-check-label" htmlFor="all-groups">
                  Tất cả thể loại
                </label>
              </div>
            </div>
            <div className="row mb-3">
              {groups.map((group) => (
                <div className="col-6 mb-2" key={group.matheloai}>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`group-${group.matheloai}`}
                      checked={selectedGroups.includes(group.matheloai)}
                      onChange={() => handleGroupChange(group.matheloai)}
                    />
                    <label className="form-check-label" htmlFor={`group-${group.matheloai}`}>
                      {group.tenLoai}
                    </label>
                  </div>
                </div>
              ))}
            </div>

            {/* Thanh lọc theo giá bằng kéo chuột */}
            <div className="price-filter">
              <h5 className="mb-2">Lọc theo giá</h5>
              <div className="mb-2">
                <label>Giá tối thiểu: {formatPrice(minPrice)}</label>
                <input
                  type="range"
                  className="form-range"
                  min="0"
                  max={priceRangeMax}
                  value={minPrice}
                  onChange={(e) => {
                    const newMin = parseInt(e.target.value);
                    if (newMin <= maxPrice) setMinPrice(newMin);
                  }}
                />
              </div>
              <div className="mb-2">
                <label>Giá tối đa: {formatPrice(maxPrice)}</label>
                <input
                  type="range"
                  className="form-range"
                  min="0"
                  max={priceRangeMax}
                  value={maxPrice}
                  onChange={(e) => {
                    const newMax = parseInt(e.target.value);
                    if (newMax >= minPrice) setMaxPrice(newMax);
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-9">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="mb-0">Danh sách sản phẩm</h4>
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

          <div className="row">
            {currentProducts.length > 0 ? (
              currentProducts.map((product) => (
                <div className="col-sm-6 col-md-4 col-lg-3 mb-4" key={product.masach}>
                  <div className="card product-card h-100 shadow-sm position-relative">
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
                        {product.giaKhuyenMai < product.giaGoc && (
                          <span className="text-muted text-decoration-line-through me-2">
                            {formatPrice(product.giaGoc)}
                          </span>
                        )}
                        <span className="text-danger fw-bold">
                          {formatPrice(product.giaKhuyenMai)}
                        </span>
                      </p>
                      <p className="text-muted small">Lượt xem: {product.luotxem}</p>
                      <Link
                        to={`/detail-product/${product.masach}`}
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => handleIncreaseViewCount(product.masach)}
                      >
                        Xem Chi Tiết
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-12 text-center">
                <p>Không có sản phẩm nào!</p>
              </div>
            )}
          </div>

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
      <img
        src="http://localhost:4000/uploads/have-fun.gif"
        alt="Image"
        width="160"
        className="fixed-image"
      />
    </div>
  );
};

export default Product;

// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { formatPrice } from '../../utils/utils';
// import { Link, useLocation } from 'react-router-dom';

// const Product = () => {
//   const [products, setProducts] = useState([]);
//   const [groups, setGroups] = useState([]);
//   const [selectedGroup, setSelectedGroup] = useState('');
//   const [sortOption, setSortOption] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [productsPerPage] = useState(8);
//   const [allProducts, setAllProducts] = useState([]);
//   const [minPrice, setMinPrice] = useState(0); // Giá tối thiểu mặc định
//   const [maxPrice, setMaxPrice] = useState(1000000); // Giá tối đa mặc định (có thể thay đổi)
//   const [priceRangeMax, setPriceRangeMax] = useState(1000000); // Giá tối đa của thanh trượt

//   const location = useLocation();
//   const searchQuery = new URLSearchParams(location.search).get('query');

//   useEffect(() => {
//     const fetchGroups = async () => {
//       try {
//         const response = await axios.get('http://localhost:4000/api/product/groups');
//         setGroups(response.data);
//       } catch (err) {
//         setError('Có lỗi khi tải nhóm sản phẩm.');
//       }
//     };

//     const fetchProducts = async () => {
//       try {
//         const response = await axios.get('http://localhost:4000/api/product');
//         setAllProducts(response.data);
//         setProducts(response.data);
//         // Tìm giá tối đa trong danh sách sản phẩm để đặt giá trị max cho thanh trượt
//         const maxProductPrice = Math.max(...response.data.map((p) => p.giaKhuyenMai));
//         setPriceRangeMax(maxProductPrice);
//         setMaxPrice(maxProductPrice); // Đặt giá tối đa ban đầu bằng giá cao nhất
//       } catch (err) {
//         setError('Có lỗi khi tải sản phẩm.');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchGroups();
//     fetchProducts();
//   }, []);

//   useEffect(() => {
//     let filteredProducts = [...allProducts];

//     // Lọc theo tìm kiếm
//     if (searchQuery) {
//       filteredProducts = filteredProducts.filter((product) =>
//         product.tensach.toLowerCase().includes(searchQuery.toLowerCase())
//       );
//     }

//     // Lọc theo giá
//     filteredProducts = filteredProducts.filter(
//       (product) => product.giaKhuyenMai >= minPrice && product.giaKhuyenMai <= maxPrice
//     );

//     // Áp dụng sắp xếp
//     let sortedProducts = [...filteredProducts];
//     if (sortOption) {
//       if (sortOption === 'price-asc') {
//         sortedProducts.sort((a, b) => a.giaKhuyenMai - b.giaKhuyenMai);
//       } else if (sortOption === 'price-desc') {
//         sortedProducts.sort((a, b) => b.giaKhuyenMai - a.giaKhuyenMai);
//       } else if (sortOption === 'name-asc') {
//         sortedProducts.sort((a, b) => a.tensach.localeCompare(b.tensach));
//       } else if (sortOption === 'name-desc') {
//         sortedProducts.sort((a, b) => b.tensach.localeCompare(a.tensach));
//       } else if (sortOption === 'discount') {
//         sortedProducts = sortedProducts.filter(
//           (p) => p.giaKhuyenMai < p.giaGoc || p.phantramgiamgia > 0
//         );
//       } else if (sortOption === 'no-discount') {
//         sortedProducts = sortedProducts.filter(
//           (p) => p.giaKhuyenMai === p.giaGoc || p.phantramgiamgia === null
//         );
//       }
//     }

//     setProducts(sortedProducts);
//   }, [searchQuery, allProducts, sortOption, minPrice, maxPrice]);

//   const handleGroupChange = async (groupId) => {
//     setSelectedGroup(groupId);
//     setLoading(true);
//     try {
//       const response = groupId
//         ? await axios.get(`http://localhost:4000/api/product/group/${groupId}`)
//         : await axios.get('http://localhost:4000/api/product');
//       setAllProducts(response.data);
//       setProducts(response.data);
//       const maxProductPrice = Math.max(...response.data.map((p) => p.giaKhuyenMai));
//       setPriceRangeMax(maxProductPrice);
//       setMaxPrice(maxProductPrice); // Cập nhật lại maxPrice khi thay đổi nhóm
//     } catch (err) {
//       setError('Có lỗi khi tải sản phẩm.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSortChange = (option) => {
//     setSortOption(option);
//   };

//   const handleIncreaseViewCount = async (productId) => {
//     try {
//       await axios.put(`http://localhost:4000/api/product/increase-view/${productId}`);
//     } catch (err) {
//       console.error('Lỗi khi tăng lượt xem:', err);
//     }
//   };

//   const indexOfLastProduct = currentPage * productsPerPage;
//   const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
//   const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);

//   const paginate = (pageNumber) => setCurrentPage(pageNumber);

//   const pageNumbers = [];
//   for (let i = 1; i <= Math.ceil(products.length / productsPerPage); i++) {
//     pageNumbers.push(i);
//   }

//   if (loading) return <div className="text-center">Đang tải...</div>;
//   if (error) return <div className="text-center text-danger">{error}</div>;

//   return (
//     <div className="container my-4">
//       <div className="row">
//         <div className="col-md-3">
//           <h4 className="mb-3">Danh mục sản phẩm</h4>
//           <div className="sidebar" style={{ position: 'sticky', top: '20px' }}>
//             <ul className="list-group mb-3">
//               <li
//                 className={`list-group-item ${selectedGroup === '' ? 'active' : ''}`}
//                 onClick={() => handleGroupChange('')}
//                 style={{ cursor: 'pointer' }}
//               >
//                 Tất cả thể loại
//               </li>
//               {groups.map((group) => (
//                 <li
//                   key={group.matheloai}
//                   className={`list-group-item ${selectedGroup === group.matheloai ? 'active' : ''}`}
//                   onClick={() => handleGroupChange(group.matheloai)}
//                   style={{ cursor: 'pointer' }}
//                 >
//                   {group.tenLoai}
//                 </li>
//               ))}
//             </ul>

//             {/* Thanh lọc theo giá bằng kéo chuột */}
//             <div className="price-filter">
//               <h5 className="mb-2">Lọc theo giá</h5>
//               <div className="mb-2">
//                 <label>Giá tối thiểu: {formatPrice(minPrice)}</label>
//                 <input
//                   type="range"
//                   className="form-range"
//                   min="0"
//                   max={priceRangeMax}
//                   value={minPrice}
//                   onChange={(e) => {
//                     const newMin = parseInt(e.target.value);
//                     if (newMin <= maxPrice) setMinPrice(newMin);
//                   }}
//                 />
//               </div>
//               <div className="mb-2">
//                 <label>Giá tối đa: {formatPrice(maxPrice)}</label>
//                 <input
//                   type="range"
//                   className="form-range"
//                   min="0"
//                   max={priceRangeMax}
//                   value={maxPrice}
//                   onChange={(e) => {
//                     const newMax = parseInt(e.target.value);
//                     if (newMax >= minPrice) setMaxPrice(newMax);
//                   }}
//                 />
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="col-md-9">
//           <div className="d-flex justify-content-between align-items-center mb-4">
//             <h4 className="mb-0">Danh sách sản phẩm</h4>
//             <select
//               className="form-select w-auto"
//               value={sortOption}
//               onChange={(e) => handleSortChange(e.target.value)}
//             >
//               <option value="">Tất cả sách</option>
//               <option value="price-asc">Giá: Thấp đến Cao</option>
//               <option value="price-desc">Giá: Cao đến Thấp</option>
//               <option value="name-asc">Tên: A-Z</option>
//               <option value="name-desc">Tên: Z-A</option>
//               <option value="discount">Giảm giá</option>
//               <option value="no-discount">Không giảm giá</option>
//             </select>
//           </div>

//           <div className="row">
//             {currentProducts.length > 0 ? (
//               currentProducts.map((product) => (
//                 <div className="col-sm-6 col-md-4 col-lg-3 mb-4" key={product.masach}>
//                   <div className="card product-card h-100 shadow-sm position-relative">
//                     {product.phantramgiamgia > 0 && (
//                       <div
//                         className="badge bg-danger text-white position-absolute"
//                         style={{ top: '10px', left: '10px', zIndex: '1' }}
//                       >
//                         -{product.phantramgiamgia}%
//                       </div>
//                     )}
//                     <img
//                       src={`http://localhost:4000/uploads/${product.hinhanh}`}
//                       alt={product.tensach}
//                       className="card-img-top"
//                       style={{ height: '250px', objectFit: 'cover' }}
//                     />
//                     <div className="card-body">
//                       <h5 className="card-title text-truncate">{product.tensach}</h5>
//                       <p className="card-price">
//                         {product.giaKhuyenMai < product.giaGoc && (
//                           <span className="text-muted text-decoration-line-through me-2">
//                             {formatPrice(product.giaGoc)}
//                           </span>
//                         )}
//                         <span className="text-danger fw-bold">
//                           {formatPrice(product.giaKhuyenMai)}
//                         </span>
//                       </p>
//                       <p className="text-muted small">Lượt xem: {product.luotxem}</p>
//                       <Link
//                         to={`/detail-product/${product.masach}`}
//                         className="btn btn-sm btn-outline-primary"
//                         onClick={() => handleIncreaseViewCount(product.masach)}
//                       >
//                         Xem Chi Tiết
//                       </Link>
//                     </div>
//                   </div>
//                 </div>
//               ))
//             ) : (
//               <div className="col-12 text-center">
//                 <p>Không có sản phẩm nào!</p>
//               </div>
//             )}
//           </div>

//           <div className="d-flex justify-content-center mt-4">
//             <nav>
//               <ul className="pagination">
//                 {pageNumbers.map((number) => (
//                   <li key={number} className="page-item">
//                     <button
//                       onClick={() => paginate(number)}
//                       className={`page-link ${currentPage === number ? 'active' : ''}`}
//                     >
//                       {number}
//                     </button>
//                   </li>
//                 ))}
//               </ul>
//             </nav>
//           </div>
//         </div>
//       </div>
//       <img
//         src="http://localhost:4000/uploads/have-fun.gif"
//         alt="Image"
//         width="160"
//         className="fixed-image"
//       />
//     </div>
//   );
// };

// export default Product;