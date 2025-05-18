import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useUser } from "../UserContext";
import { useCart } from "../CartContext";
import { formatPrice } from '../../utils/utils';

function Menu() {
    const { user, setUser } = useUser();
    const { cart } = useCart();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);

    const fullname = localStorage.getItem("fullname");
    const userid = localStorage.getItem("userid");

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = localStorage.getItem("jwt");
                if (token && userid && !user) {
                    const response = await axios.get(`http://localhost:4000/api/detail-user/${userid}`, {
                        withCredentials: true,
                    });
                    if (response.data.user) {
                        setUser(response.data.user);
                        localStorage.setItem("fullname", response.data.user.tennguoidung);
                        localStorage.setItem("userid", response.data.user.manguoidung);
                    }
                }
            } catch (error) {
                console.error("Error fetching user:", error);
                setUser(null);
            }
        };

        if (userid && !user) {
            fetchUser();
        }
    }, [setUser, user, userid]);

    useEffect(() => {
        const handleUserUpdate = async () => {
            if (userid) {
                try {
                    const response = await axios.get(`http://localhost:4000/api/detail-user/${userid}`, {
                        withCredentials: true,
                    });
                    if (response.data.user) {
                        setUser(response.data.user);
                        localStorage.setItem("fullname", response.data.user.tennguoidung);
                    }
                } catch (error) {
                    console.error("Error updating user:", error);
                }
            }
        };

        window.addEventListener('userUpdated', handleUserUpdate);
        return () => window.removeEventListener('userUpdated', handleUserUpdate);
    }, [setUser, userid]);

    const handleLogout = async () => {
        try {
            await axios.get("http://localhost:4000/api/logoutAPI", { withCredentials: true });
            setUser(null);
            localStorage.removeItem("jwt");
            localStorage.removeItem("fullname");
            localStorage.removeItem("userid");
            navigate("/home");
        } catch (error) {
            console.error("Error during logout:", error);
        }
    };

    const list = [
        { link: "/home", content: "Trang chủ", icon: "bi-house" },
        { link: "/product", content: "Sản phẩm", icon: "bi-book" },
    ];

    const renderItem = list.map((ls, index) => (
        <li key={index} className="nav-item">
            <Link className="nav-link text-dark fw-bold" to={ls.link}>
                <i className={`bi ${ls.icon} me-2`}></i>
                {ls.content}
            </Link>
        </li>
    ));

    const handleCartClick = () => {
        navigate("/cart");
    };

    const handleOrderClick = () => {
        navigate("/orders");
    };

    const handleSearch = async (event) => {
        event.preventDefault();
        if (searchQuery.trim()) {
            try {
                const response = await axios.get(`http://localhost:4000/api/product/search?query=${searchQuery}`);
                navigate(`/product?query=${searchQuery}`, { state: { products: response.data } });
                setSuggestions([]);
            } catch (error) {
                console.error("Lỗi khi tìm kiếm sản phẩm", error);
            }
        }
    };

    const handleSearchChange = async (e) => {
        const value = e.target.value;
        setSearchQuery(value);

        if (value.trim()) {
            setLoading(true);
            try {
                const response = await axios.get(`http://localhost:4000/api/product/search?query=${value}`);
                setSuggestions(response.data.products || []);
            } catch (error) {
                console.error("Lỗi khi lấy gợi ý tìm kiếm", error);
            } finally {
                setLoading(false);
            }
        } else {
            setSuggestions([]);
            navigate("/product", { replace: true });
        }
    };

    const handleSuggestionClick = async (productId) => {
        try {
            await axios.put(`http://localhost:4000/api/product/increase-view/${productId}`);
            navigate(`/detail-product/${productId}`);
            setSuggestions([]);
        } catch (error) {
            console.error("Lỗi khi tăng lượt xem:", error);
        }
    };

    return (
        <div className="header-wrapper">
            <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
                <div className="container-fluid" style={{ paddingLeft: '172px', paddingRight: '172px' }}>
                    <Link className="navbar-brand fw-bold text-dark d-flex align-items-center" to="/home">
                        {/* <img src="http://localhost:4000/uploads/mythikore-anime-girl (1).gif" alt="Logo" width="50" /> */}
                        <div className="logo-icon" style={{ marginRight: '10px' }}>
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '40px', height: '40px' }}>
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" fill="#1E3A8A"/>
                                <path d="M12 6l-3 6h6l-3-6z" fill="#FBBF24"/>
                                <path d="M9 12h6v6H9v-6z" fill="#1E3A8A"/>
                            </svg>
                        </div>
                        <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '24px', fontWeight: '700', color: '#1E3A8A' }}>
                            Book<span style={{ color: '#FBBF24' }}>Haven</span>
                        </div>
                    </Link>
                    <button
                        className="navbar-toggler"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#navbarSupportedContent"
                        aria-controls="navbarSupportedContent"
                        aria-expanded="false"
                        aria-label="Toggle navigation"
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                        {/* <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                            {renderItem}
                        </ul> */}
                        <ul className="navbar-nav ms-auto mb-lg-0 d-flex align-items-center">
                            <form className="d-flex me-3 position-relative" onSubmit={handleSearch}>
                                <input
                                    className="form-control me-2"
                                    type="search"
                                    placeholder="Tìm sản phẩm..."
                                    aria-label="Search"
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                />
                                <button className="btn btn-outline-dark" type="submit">
                                    Tìm
                                </button>
                                {suggestions.length > 0 && (
                                    <div className="search-suggestions">
                                        {loading ? (
                                            <div>Đang tải...</div>
                                        ) : (
                                            suggestions.map((product) => (
                                                <div
                                                    key={product.id}
                                                    className="suggestion-item"
                                                    onClick={() => handleSuggestionClick(product.masach)}
                                                >
                                                    <img
                                                        src={`http://localhost:4000/uploads/${product.hinhanh}`}
                                                        alt={product.tensach}
                                                        className="suggestion-image"
                                                        style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                                    />
                                                    <div className="ml-2">
                                                        <p className="suggestion-name text-dark">Tên sách: {product.tensach}</p>
                                                        <div className="d-flex align-items-center">
                                                            {product.phantramgiamgia && product.giaKhuyenMai < product.giaGoc ? (
                                                                <>
                                                                    <p className="suggestion-price text-muted text-decoration-line-through me-2">
                                                                        {formatPrice(product.giaGoc)}
                                                                    </p>
                                                                    <p className="suggestion-price text-danger">
                                                                        {formatPrice(product.giaKhuyenMai)}
                                                                    </p>
                                                                </>
                                                            ) : (
                                                                <p className="suggestion-price text-danger">
                                                                    {formatPrice(product.giaGoc)}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </form>
                            {user || fullname ? (
                                <>
                                    <li className="nav-item d-flex align-items-center">
                                        <Link
                                            className="nav-link text-dark fw-bold d-flex align-items-center"
                                            to={`/detail-user/${userid || ""}`}
                                        >
                                            <img
                                                src={user?.avatar ? `http://localhost:4000/uploads/${user.avatar}` : "http://localhost:4000/uploads/default-avatar.png"}
                                                alt="Avatar"
                                                className="rounded-circle me-2"
                                                style={{ width: '30px', height: '30px', objectFit: 'cover' }}
                                            />
                                            <span style={{fontSize:'large', fontFamily: 'cursive', color: '#666666'}}>{fullname || user?.tennguoidung || "Người dùng"}</span>
                                        </Link>
                                        <button
                                            className="btn btn-outline-dark position-relative ms-2"
                                            onClick={handleCartClick}
                                        >
                                            <i className="bi bi-cart"></i>
                                            {cart.length > 0 && (
                                                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                                                    {cart.length}
                                                </span>
                                            )}
                                        </button>
                                        <button
                                            className="btn btn-outline-dark position-relative ms-2"
                                            onClick={handleOrderClick}
                                        >
                                            <i className="bi bi-box"></i>
                                        </button>
                                    </li>
                                    <li className="nav-item d-flex">
                                        <button className="btn btn-outline-danger ms-2" onClick={handleLogout}>
                                            Đăng xuất
                                        </button>
                                    </li>
                                </>
                            ) : (
                                <li className="nav-item d-flex">
                                    <Link className="btn btn-dark" to="/login">
                                        Đăng nhập
                                    </Link>
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
            </nav>
            <div className="commitment-section">
                <div style={{ backgroundColor: 'white' }} className="sc-cc99b0e2-0 fzFpkg">
                    <a href="" className="sc-cc99b0e2-1 klHtaf">
                        <div style={{ color: '#003EA1' }} className="sc-cc99b0e2-2 iMmKHC">Cam kết</div>
                        <div className="commitment-items">
                            <div className="commitment-item">
                                <picture className="webpimg-container">
                                    <source type="image/webp" srcSet="https://salt.tikicdn.com/ts/upload/96/76/a3/16324a16c76ee4f507d5777608dab831.png" />
                                    <img
                                        className="sc-82b4dcf2-0 ldcZGa title-img-0"
                                        src="https://salt.tikicdn.com/ts/upload/96/76/a3/16324a16c76ee4f507d5777608dab831.png"
                                        alt="icon-0"
                                        width="20"
                                        height="20"
                                    />
                                </picture>
                                <div className="commitment-text">100% hàng thật</div>
                            </div>
                            <div className="separator"></div>
                            <div className="commitment-item">
                                <picture className="webpimg-container">
                                    <source type="image/webp" srcSet="https://salt.tikicdn.com/ts/upload/11/09/ec/456a2a8c308c2de089a34bbfef1c757b.png" />
                                    <img
                                        className="sc-82b4dcf2-0 ldcZGa title-img-1"
                                        src="https://salt.tikicdn.com/ts/upload tester/11/09/ec/456a2a8c308c2de089a34bbfef1c757b.png"
                                        alt="icon-1"
                                        width="20"
                                        height="20"
                                    />
                                </picture>
                                <div className="commitment-text">Freeship mọi đơn</div>
                            </div>
                            <div className="separator"></div>
                            <div className="commitment-item">
                                <picture className="webpimg-container">
                                    <source type="image/webp" srcSet="https://salt.tikicdn.com/ts/upload/0b/f2/19/c03ae8f46956eca66845fb9aaadeca1e.png" />
                                    <img
                                        className="sc-82b4dcf2-0 ldcZGa title-img-2"
                                        src="https://salt.tikicdn.com/ts/upload/0b/f2/19/c03ae8f46956eca66845fb9aaadeca1e.png"
                                        alt="icon-2"
                                        width="20"
                                        height="20"
                                    />
                                </picture>
                                <div className="commitment-text">Hoàn 200% nếu hàng giả</div>
                            </div>
                            <div className="separator"></div>
                            <div className="commitment-item">
                                <picture className="webpimg-container">
                                    <source type="image/webp" srcSet="https://salt.tikicdn.com/ts/upload/3a/f4/7d/86ca29927e9b360dcec43dccb85d2061.png" />
                                    <img
                                        className="sc-82b4dcf2-0 ldcZGa title-img-3"
                                        src="https://salt.tikicdn.com/ts/upload/3a/f4/7d/86ca29927e9b360dcec43dccb85d2061.png"
                                        alt="icon-3"
                                        width="20"
                                        height="20"
                                    />
                                </picture>
                                <div className="commitment-text">30 ngày đổi trả</div>
                            </div>
                            <div className="separator"></div>
                            <div className="commitment-item">
                                <picture className="webpimg-container">
                                    <source type="image/webp" srcSet="https://salt.tikicdn.com/ts/upload/87/98/77/fc33e3d472fc4ce4bae8c835784b707a.png" />
                                    <img
                                        className="sc-82b4dcf2-0 ldcZGa title-img-4"
                                        src="https://salt.tikicdn.com/ts/upload/87/98/77/fc33e3d472fc4ce4bae8c835784b707a.png"
                                        alt="icon-4"
                                        width="20"
                                        height="20"
                                    />
                                </picture>
                                <div className="commitment-text">Giao nhanh 2h</div>
                            </div>
                            <div className="separator"></div>
                            <div className="commitment-item">
                                <picture className="webpimg-container">
                                    <source type="image/webp" srcSet="https://salt.tikicdn.com/ts/upload/6a/81/06/0675ef5512c275a594d5ec1d58c37861.png" />
                                    <img
                                        className="sc-82b4dcf2-0 ldcZGa title-img-5"
                                        src="https://salt.tikicdn.com/ts/upload/6a/81/06/0675ef5512c275a594d5ec1d58c37861.png"
                                        alt="icon-5"
                                        width="20"
                                        height="20"
                                    />
                                </picture>
                                <div className="commitment-text">Giá siêu rẻ</div>
                            </div>
                        </div>
                    </a>
                </div>
            </div>
        </div>
    );
}

export default Menu;

// import { Link, useNavigate } from "react-router-dom";
// import { useEffect, useState } from "react";
// import axios from "axios";
// import { useUser } from "../UserContext";
// import { useCart } from "../CartContext";
// import { formatPrice } from '../../utils/utils';

// function Menu() {
//     const { user, setUser } = useUser();
//     const { cart } = useCart(); 
//     const navigate = useNavigate();
//     const [searchQuery, setSearchQuery] = useState("");
//     const [suggestions, setSuggestions] = useState([]);
//     const [loading, setLoading] = useState(false);

//     const fullname = localStorage.getItem("fullname");
//     const userid = localStorage.getItem("userid");

//     useEffect(() => {
//         const fetchUser = async () => {
//             try {
//                 const token = localStorage.getItem("jwt");
//                 if (token) {
//                     const response = await axios.get("http://localhost:4000/api/getUser", {
//                         withCredentials: true,
//                     });
//                     if (response.data.user) {
//                         setUser(response.data.user);
//                     }
//                 }
//             } catch (error) {
//                 console.error("Error fetching user:", error);
//                 setUser(null);
//             }
//         };

//         fetchUser();
//     }, [setUser]);

//     const handleLogout = async () => {
//         try {
//             await axios.get("http://localhost:4000/api/logoutAPI", { withCredentials: true });
//             setUser(null);
//             localStorage.removeItem("jwt");
//             localStorage.removeItem("fullname");
//             localStorage.removeItem("userid");
//             navigate("/home");
//         } catch (error) {
//             console.error("Error during logout:", error);
//         }
//     };

//     const list = [
//         { link: "/home", content: "Trang chủ", icon: "bi-house" },
//         { link: "/product", content: "Sản phẩm", icon: "bi-book" },
//     ];

//     const renderItem = list.map((ls, index) => (
//         <li key={index} className="nav-item">
//             <Link className="nav-link text-dark fw-bold" to={ls.link}>
//                 <i className={`bi ${ls.icon} me-2`}></i>
//                 {ls.content}
//             </Link>
//         </li>
//     ));

//     const handleCartClick = () => {
//         navigate("/cart");
//     };

//     const handleOrderClick = () => {
//         navigate("/orders");
//     };

//     const handleSearch = async (event) => {
//         event.preventDefault();
//         if (searchQuery.trim()) {
//             try {
//                 const response = await axios.get(`http://localhost:4000/api/product/search?query=${searchQuery}`);
//                 navigate(`/product?query=${searchQuery}`, { state: { products: response.data } });
//                 setSuggestions([]);
//             } catch (error) {
//                 console.error("Lỗi khi tìm kiếm sản phẩm", error);
//             }
//         }
//     };

//     const handleSearchChange = async (e) => {
//         const value = e.target.value;
//         setSearchQuery(value);

//         if (value.trim()) {
//             setLoading(true);
//             try {
//                 const response = await axios.get(`http://localhost:4000/api/product/search?query=${value}`);
//                 setSuggestions(response.data.products || []);
//             } catch (error) {
//                 console.error("Lỗi khi lấy gợi ý tìm kiếm", error);
//             } finally {
//                 setLoading(false);
//             }
//         } else {
//             setSuggestions([]);
//             navigate("/product", { replace: true });
//         }
//     };

//     const handleSuggestionClick = async (productId) => {
//         try {
//             await axios.put(`http://localhost:4000/api/product/increase-view/${productId}`);
//             navigate(`/detail-product/${productId}`);
//             setSuggestions([]);
//         } catch (error) {
//             console.error("Lỗi khi tăng lượt xem:", error);
//         }
//     };    

//     return (
//         <div className="header-wrapper">
//             <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
//                 <div className="container-fluid" style={{ paddingLeft: '172px', paddingRight: '172px' }}>
//                     <Link className="navbar-brand fw-bold text-dark" to="/home">
//                         <img src="http://localhost:4000/uploads/mythikore-anime-girl (1).gif" alt="Image" width="50" />
//                     </Link>
//                     <button
//                         className="navbar-toggler"
//                         type="button"
//                         data-bs-toggle="collapse"
//                         data-bs-target="#navbarSupportedContent"
//                         aria-controls="navbarSupportedContent"
//                         aria-expanded="false"
//                         aria-label="Toggle navigation"
//                     >
//                         <span className="navbar-toggler-icon"></span>
//                     </button>
//                     <div className="collapse navbar-collapse" id="navbarSupportedContent">
//                         <ul className="navbar-nav me-auto mb-2 mb-lg-0">
//                             {renderItem}
//                         </ul>
//                         <ul className="navbar-nav ms-auto mb-lg-0 d-flex align-items-center">
//                             <form className="d-flex me-3 position-relative" onSubmit={handleSearch}>
//                                 <input
//                                     className="form-control me-2"
//                                     type="search"
//                                     placeholder="Tìm sản phẩm..."
//                                     aria-label="Search"
//                                     value={searchQuery}
//                                     onChange={handleSearchChange}
//                                 />
//                                 <button className="btn btn-outline-dark" type="submit">
//                                     Tìm
//                                 </button>
//                                 {suggestions.length > 0 && (
//                                     <div className="search-suggestions">
//                                         {loading ? (
//                                             <div>Đang tải...</div>
//                                         ) : (
//                                             suggestions.map((product) => (
//                                                 <div
//                                                     key={product.id}
//                                                     className="suggestion-item"
//                                                     onClick={() => handleSuggestionClick(product.masach)}
//                                                 >
//                                                     <img 
//                                                         src={`http://localhost:4000/uploads/${product.hinhanh}`} 
//                                                         alt={product.tensach} 
//                                                         className="suggestion-image" 
//                                                         style={{ width: '50px', height: '50px', objectFit: 'cover' }}
//                                                     />
//                                                     <div className="ml-2">
//                                                         <p className="suggestion-name text-dark">Tên sách: {product.tensach}</p>
//                                                         <div className="d-flex align-items-center">
//                                                             {product.phantramgiamgia && product.giaKhuyenMai < product.giaGoc ? (
//                                                                 <>
//                                                                     <p className="suggestion-price text-muted text-decoration-line-through me-2">
//                                                                         {formatPrice(product.giaGoc)}
//                                                                     </p>
//                                                                     <p className="suggestion-price text-danger">
//                                                                         {formatPrice(product.giaKhuyenMai)}
//                                                                     </p>
//                                                                 </>
//                                                             ) : (
//                                                                 <p className="suggestion-price text-danger">
//                                                                     {formatPrice(product.giaGoc)}
//                                                                 </p>
//                                                             )}
//                                                         </div>
//                                                     </div>
//                                                 </div>
//                                             ))
//                                         )}
//                                     </div>
//                                 )}
//                             </form>
//                             {user || fullname ? (
//                                 <>
//                                     <li className="nav-item d-flex align-items-center">
//                                         <Link className="nav-link text-dark fw-bold" to={`/detail-user/${userid || ""}`}>
//                                             Xin chào:<a className="text-decoration-underline">{fullname}</a>
//                                         </Link>
//                                         <button 
//                                             className="btn btn-outline-dark position-relative ms-2" 
//                                             onClick={handleCartClick}
//                                         >
//                                             <i className="bi bi-cart"></i>
//                                             {cart.length > 0 && (
//                                                 <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
//                                                     {cart.length}
//                                                 </span>
//                                             )}
//                                         </button>
//                                         <button 
//                                             className="btn btn-outline-dark position-relative ms-2" 
//                                             onClick={handleOrderClick}
//                                         >
//                                             <i className="bi bi-box"></i>
//                                         </button>
//                                     </li>
//                                     <li className="nav-item d-flex">
//                                         <button className="btn btn-outline-danger ms-2" onClick={handleLogout}>
//                                             Đăng xuất
//                                         </button>
//                                     </li>
//                                 </>
//                             ) : (
//                                 <li className="nav-item d-flex">
//                                     <Link className="btn btn-dark" to="/login">
//                                         Đăng nhập
//                                     </Link>
//                                 </li>
//                                 )}
//                             </ul>
//                         </div>
//                     </div>
//                 </nav>
//                 <div className="commitment-section">
//                     <div style={{backgroundColor: 'white'}} className="sc-cc99b0e2-0 fzFpkg">
//                         <a href="https://tiki.vn/thong-tin/tiki-doi-tra-de-dang-an-tam-mua-sam" className="sc-cc99b0e2-1 klHtaf">
//                             <div style={{color: '#003EA1'}} className="sc-cc99b0e2-2 iMmKHC">Cam kết</div>
//                             <div className="commitment-items">
//                                 <div className="commitment-item">
//                                     <picture className="webpimg-container">
//                                         <source type="image/webp" srcSet="https://salt.tikicdn.com/ts/upload/96/76/a3/16324a16c76ee4f507d5777608dab831.png"/>
//                                         <img className="sc-82b4dcf2-0 ldcZGa title-img-0" 
//                                             src="https://salt.tikicdn.com/ts/upload/96/76/a3/16324a16c76ee4f507d5777608dab831.png" 
//                                             alt="icon-0" 
//                                             width="20" 
//                                             height="20"/>
//                                     </picture>
//                                     <div className="commitment-text">100% hàng thật</div>
//                                 </div>
//                                 <div className="separator"></div>
//                                 <div className="commitment-item">
//                                     <picture className="webpimg-container">
//                                         <source type="image/webp" srcSet="https://salt.tikicdn.com/ts/upload/11/09/ec/456a2a8c308c2de089a34bbfef1c757b.png"/>
//                                         <img className="sc-82b4dcf2-0 ldcZGa title-img-1" 
//                                             src="https://salt.tikicdn.com/ts/upload/11/09/ec/456a2a8c308c2de089a34bbfef1c757b.png" 
//                                             alt="icon-1" 
//                                             width="20" 
//                                             height="20"/>
//                                     </picture>
//                                     <div className="commitment-text">Freeship mọi đơn</div>
//                                 </div>
//                                 <div className="separator"></div>
//                                 <div className="commitment-item">
//                                     <picture className="webpimg-container">
//                                         <source type="image/webp" srcSet="https://salt.tikicdn.com/ts/upload/0b/f2/19/c03ae8f46956eca66845fb9aaadeca1e.png"/>
//                                         <img className="sc-82b4dcf2-0 ldcZGa title-img-2" 
//                                             src="https://salt.tikicdn.com/ts/upload/0b/f2/19/c03ae8f46956eca66845fb9aaadeca1e.png" 
//                                             alt="icon-2" 
//                                             width="20" 
//                                             height="20"/>
//                                     </picture>
//                                     <div className="commitment-text">Hoàn 200% nếu hàng giả</div>
//                                 </div>
//                                 <div className="separator"></div>
//                                 <div className="commitment-item">
//                                     <picture className="webpimg-container">
//                                         <source type="image/webp" srcSet="https://salt.tikicdn.com/ts/upload/3a/f4/7d/86ca29927e9b360dcec43dccb85d2061.png"/>
//                                         <img className="sc-82b4dcf2-0 ldcZGa title-img-3" 
//                                             src="https://salt.tikicdn.com/ts/upload/3a/f4/7d/86ca29927e9b360dcec43dccb85d2061.png" 
//                                             alt="icon-3" 
//                                             width="20" 
//                                             height="20"/>
//                                     </picture>
//                                     <div className="commitment-text">30 ngày đổi trả</div>
//                                 </div>
//                                 <div className="separator"></div>
//                                 <div className="commitment-item">
//                                     <picture className="webpimg-container">
//                                         <source type="image/webp" srcSet="https://salt.tikicdn.com/ts/upload/87/98/77/fc33e3d472fc4ce4bae8c835784b707a.png"/>
//                                         <img className="sc-82b4dcf2-0 ldcZGa title-img-4" 
//                                             src="https://salt.tikicdn.com/ts/upload/87/98/77/fc33e3d472fc4ce4bae8c835784b707a.png" 
//                                             alt="icon-4" 
//                                             width="20" 
//                                             height="20"/>
//                                     </picture>
//                                     <div className="commitment-text">Giao nhanh 2h</div>
//                                 </div>
//                                 <div className="separator"></div>
//                                 <div className="commitment-item">
//                                     <picture className="webpimg-container">
//                                         <source type="image/webp" srcSet="https://salt.tikicdn.com/ts/upload/6a/81/06/0675ef5512c275a594d5ec1d58c37861.png"/>
//                                         <img className="sc-82b4dcf2-0 ldcZGa title-img-5" 
//                                             src="https://salt.tikicdn.com/ts/upload/6a/81/06/0675ef5512c275a594d5ec1d58c37861.png" 
//                                             alt="icon-5" 
//                                             width="20" 
//                                             height="20"/>
//                                     </picture>
//                                     <div className="commitment-text">Giá siêu rẻ</div>
//                                 </div>
//                             </div>
//                         </a>
//                     </div>
//                 </div>
//             </div>
//     );
// }

// export default Menu;