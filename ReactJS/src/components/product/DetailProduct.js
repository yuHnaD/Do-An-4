import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { formatPrice } from '../../utils/utils';
import { useCart } from '../CartContext';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [dropdownVisible, setDropdownVisible] = useState({});
    const [mainImage, setMainImage] = useState('');
    const [showFullDescription, setShowFullDescription] = useState(false);
    const [isZoomed, setIsZoomed] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [allImages, setAllImages] = useState([]);
    const [viewedProducts, setViewedProducts] = useState([]);
    const [recommendedProducts, setRecommendedProducts] = useState([]); // Thay similarProducts thành recommendedProducts
    const [sortOrder, setSortOrder] = useState('newest');
    const [currentPage, setCurrentPage] = useState(1);
    const commentsPerPage = 5;
    const sliderRef = useRef(null);
    const [currentSlide, setCurrentSlide] = useState(0);

    // Hàm lấy danh sách sản phẩm đã xem từ server
    const fetchViewedProducts = async (userId) => {
        if (!userId) return;
        try {
            const response = await axios.get(`http://localhost:4000/api/viewed-products/${userId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` },
                withCredentials: true,
            });
            const filteredViewed = response.data.filter(p => String(p.masach) !== String(id));
            setViewedProducts(filteredViewed);
            console.log('Danh sách đã xem từ server:', filteredViewed);
        } catch (error) {
            console.error('Lỗi khi lấy lịch sử xem:', error);
        }
    };

    // Hàm lưu sản phẩm đã xem vào server
    const saveViewedProduct = async (userId, masach) => {
        if (!userId) return;
        try {
            await axios.post(
                `http://localhost:4000/api/viewed-products`,
                { manguoidung: userId, masach },
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` },
                    withCredentials: true,
                }
            );
            fetchViewedProducts(userId);
        } catch (error) {
            console.error('Lỗi khi lưu lịch sử xem:', error);
        }
    };

    // Hàm lấy danh sách sản phẩm gợi ý
    const fetchRecommendedProducts = async (masach) => {
        try {
            const response = await axios.get(`http://localhost:4000/api/recommended-products/${masach}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` },
                withCredentials: true,
            });
            const filteredProducts = response.data
                .filter(p => String(p.masach) !== String(id))
                .slice(0, 24); // Lấy tối đa 24 sản phẩm để có ít nhất 3 slide
            setRecommendedProducts(filteredProducts);
            console.log('Sản phẩm gợi ý:', filteredProducts);
        } catch (error) {
            console.error('Lỗi khi lấy sản phẩm gợi ý:', error);
        }
    };

    // Tính số slide dựa trên số sản phẩm (8 sản phẩm mỗi slide)
    const productsPerSlide = 8;
    const totalSlides = Math.ceil(recommendedProducts.length / productsPerSlide);

    // Hàm điều hướng slider
    const slideLeft = () => {
        if (currentSlide > 0) {
            setCurrentSlide(currentSlide - 1);
            if (sliderRef.current) {
                sliderRef.current.style.transform = `translateX(-${(currentSlide - 1) * 100}%)`;
            }
        }
    };

    const slideRight = () => {
        if (currentSlide < totalSlides - 1) {
            setCurrentSlide(currentSlide + 1);
            if (sliderRef.current) {
                sliderRef.current.style.transform = `translateX(-${(currentSlide + 1) * 100}%)`;
            }
        }
    };

    useEffect(() => {
        const userId = localStorage.getItem('userid');

        const fetchProductDetail = async () => {
            try {
                const response = await axios.get(`http://localhost:4000/api/detail-product/${id}`);
                console.log('Dữ liệu sản phẩm:', response.data);
                setProduct(response.data);
                const primaryImage = response.data.hinhanh ? [`http://localhost:4000/uploads/${response.data.hinhanh}`] : [];
                const secondaryImages = response.data.hinhanh_phu
                    ? JSON.parse(response.data.hinhanh_phu || '[]').map(img => `http://localhost:4000/uploads/${img}`)
                    : [];
                const images = [...primaryImage, ...secondaryImages];
                setAllImages(images);
                setMainImage(images[0] || '');
                setLoading(false);

                // Gọi hàm lấy sản phẩm gợi ý
                fetchRecommendedProducts(response.data.masach);

                // Lưu sản phẩm đã xem vào server nếu người dùng đã đăng nhập
                if (userId && response.data.masach) {
                    saveViewedProduct(userId, response.data.masach);
                }
            } catch (err) {
                setError('Không thể tải chi tiết sản phẩm.');
                setLoading(false);
            }
        };

        const fetchComments = async () => {
            try {
                const response = await axios.get(`http://localhost:4000/api/comments/${id}`);
                console.log('Dữ liệu bình luận trả về:', response.data);
                setComments(response.data);
            } catch (err) {
                console.error('Không thể tải bình luận.');
            }
        };

        fetchProductDetail();
        fetchComments();
        fetchViewedProducts(userId);
    }, [id]);

    const handleAddToCart = () => {
        const userId = localStorage.getItem('userid');
        if (!userId) {
            alert('Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng.');
            return;
        }

        const productToAdd = {
            ...product,
            gia: product.giaKhuyenMai || product.giaGoc,
        };
        console.log('Sản phẩm thêm vào giỏ hàng:', productToAdd);
        addToCart(productToAdd);
        alert('Sản phẩm đã được thêm vào giỏ hàng!');
    };

    const handleBuyNow = () => {
        const userId = localStorage.getItem('userid');
        if (!userId) {
            alert('Bạn cần đăng nhập để mua sản phẩm.');
            return;
        }

        const productToAdd = {
            ...product,
            gia: product.giaKhuyenMai || product.giaGoc,
        };
        console.log('Sản phẩm mua ngay:', productToAdd);
        addToCart(productToAdd);
        navigate('/cart');
    };

    const handleSubmitComment = async () => {
        if (!newComment) return alert('Vui lòng nhập bình luận.');
        const userId = localStorage.getItem('userid');
        if (!userId) {
            alert('Bạn cần đăng nhập để bình luận.');
            return;
        }
        try {
            await axios.post(
                `http://localhost:4000/api/add-comments/${id}`,
                { content: newComment },
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` },
                    withCredentials: true,
                }
            );
            setNewComment('');
            const response = await axios.get(`http://localhost:4000/api/comments/${id}`);
            setComments(response.data);
        } catch (error) {
            console.error('Lỗi khi gửi bình luận', error);
        }
    };

    const handleEditComment = (commentId, currentContent) => {
        const newContent = prompt('Nhập nội dung mới:', currentContent);
        axios
            .put(
                `http://localhost:4000/api/comments/${commentId}`,
                { content: newContent },
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` },
                    withCredentials: true,
                }
            )
            .then(() => {
                alert('Cập nhật bình luận thành công.');
                return axios.get(`http://localhost:4000/api/comments/${id}`);
            })
            .then((response) => setComments(response.data))
            .catch((error) => console.error('Lỗi khi cập nhật bình luận:', error));
    };

    const handleDeleteComment = (commentId) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa bình luận này?')) return;
        axios
            .delete(`http://localhost:4000/api/comments/${commentId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` },
                withCredentials: true,
            })
            .then(() => {
                alert('Xóa bình luận thành công.');
                return axios.get(`http://localhost:4000/api/comments/${id}`);
            })
            .then((response) => setComments(response.data))
            .catch((error) => console.error('Lỗi khi xóa bình luận:', error));
    };

    const toggleDropdown = (commentId) => {
        setDropdownVisible(prevState => ({
            ...prevState,
            [commentId]: !prevState[commentId],
        }));
    };

    const sortedComments = [...comments].sort((a, b) => {
        return sortOrder === 'newest'
            ? new Date(b.ngaydanhgia) - new Date(a.ngaydanhgia)
            : new Date(a.ngaydanhgia) - new Date(b.ngaydanhgia);
    });

    const indexOfLastComment = currentPage * commentsPerPage;
    const indexOfFirstComment = indexOfLastComment - commentsPerPage;
    const currentComments = sortedComments.slice(indexOfFirstComment, indexOfLastComment);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handleThumbnailClick = (imageUrl, index) => {
        setCurrentImageIndex(index);
        setMainImage(imageUrl);
        setIsZoomed(false);
    };

    const toggleDescription = () => {
        setShowFullDescription(!showFullDescription);
    };

    const handleImageClick = () => {
        setIsZoomed(!isZoomed);
    };

    const nextImage = () => {
        const nextIndex = (currentImageIndex + 1) % allImages.length;
        setCurrentImageIndex(nextIndex);
        setMainImage(allImages[nextIndex]);
    };

    const prevImage = () => {
        const prevIndex = (currentImageIndex - 1 + allImages.length) % allImages.length;
        setCurrentImageIndex(prevIndex);
        setMainImage(allImages[prevIndex]);
    };

    const closeZoom = () => {
        setIsZoomed(false);
    };

    if (loading) {
        return <div>Đang tải chi tiết sản phẩm...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    if (!product) {
        return <div>Sản phẩm không tồn tại.</div>;
    }

    return (
        <div className="container my-3">
            {/* Breadcrumb */}
            <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item">
                        <Link to="/" style={{ textDecoration: 'none', color: '#1890ff' }}>
                            Trang chủ
                        </Link>
                    </li>
                    <li className="breadcrumb-item">
                        <Link to="/product" style={{ textDecoration: 'none', color: '#1890ff' }}>
                            Sản phẩm
                        </Link>
                    </li>
                    <li className="breadcrumb-item active" aria-current="page">
                        {product.tenSP}
                    </li>
                </ol>
            </nav>
            <div className="row g-0">
                <div className="col-md-4 p-3" style={{ position: 'sticky', top: '20px', alignSelf: 'flex-start', height: 'fit-content' }}>
                    <div className="main-image-container mb-3 position-relative" style={{ overflow: 'hidden', width: '100%', height: '500px' }}>
                        <div
                            className="slider-wrapper"
                            style={{
                                display: 'flex',
                                width: `${allImages.length * 100}%`,
                                height: '100%',
                                transform: `translateX(-${currentImageIndex * (100 / allImages.length)}%)`,
                                transition: 'transform 0.3s ease-in-out'
                            }}
                        >
                            {allImages.map((image, index) => (
                                <img
                                    key={index}
                                    src={image}
                                    alt={`${product.tenSP} ${index + 1}`}
                                    className="main-image img-fluid rounded shadow-sm"
                                    onClick={handleImageClick}
                                    style={{
                                        width: `${100 / allImages.length}%`,
                                        height: '500px',
                                        objectFit: 'contain',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                                        cursor: 'zoom-in'
                                    }}
                                />
                            ))}
                        </div>
                        {allImages.length > 1 && (
                            <>
                                <button
                                    onClick={prevImage}
                                    className="btn position-absolute tiki-slider-btn"
                                    style={{
                                        left: '10px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        backgroundColor: 'white',
                                        color: '#333',
                                        border: '1px solid #ccc',
                                        padding: '8px 12px',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '12px',
                                        transition: 'background-color 0.3s, color 0.3s'
                                    }}
                                >
                                    &lt;
                                </button>
                                <button
                                    onClick={nextImage}
                                    className="btn position-absolute tiki-slider-btn"
                                    style={{
                                        right: '10px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        backgroundColor: 'white',
                                        color: '#333',
                                        border: '1px solid #ccc',
                                        padding: '8px 12px',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '12px',
                                        transition: 'background-color 0.3s, color 0.3s'
                                    }}
                                >
                                    &gt;
                                </button>
                            </>
                        )}
                    </div>

                    <div className="thumbnails d-flex gap-2" style={{ maxWidth: '100%' }}>
                        {allImages.map((image, index) => (
                            <img
                                key={index}
                                src={image}
                                alt={`${product.tenSP} Thumbnail ${index + 1}`}
                                className="thumbnail img-fluid rounded shadow-sm"
                                onClick={() => handleThumbnailClick(image, index)}
                                style={{
                                    width: '60px',
                                    height: '60px',
                                    objectFit: 'cover',
                                    cursor: 'pointer',
                                    border: currentImageIndex === index ? '2px solid #1890ff' : '2px solid #ddd',
                                    transition: 'border-color 0.3s'
                                }}
                            />
                        ))}
                    </div>
                </div>

                <div className="col-md-5 p-3" style={{ minHeight: 'calc(100vh - 100px)' }}>
                    <div className="product-header mb-3" style={{
                        backgroundColor: '#fff',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        padding: '15px'
                    }}>
                        <div className="promo-icons mb-2" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <span className="promo-icon" style={{
                                backgroundColor: '#e3f2fd',
                                color: '#1976d2',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '12px',
                                fontWeight: 'bold'
                            }}>
                                FREESHIP XTRA
                            </span>
                            <span className="promo-icon" style={{
                                backgroundColor: '#e8f5e9',
                                color: '#2e7d32',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '12px',
                                fontWeight: 'bold'
                            }}>
                                30 NGÀY ĐỔI TRẢ
                            </span>
                            <span className="promo-icon" style={{
                                backgroundColor: '#e8f5e9',
                                color: '#2e7d32',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '12px',
                                fontWeight: 'bold'
                            }}>
                                CHÍNH HÃNG
                            </span>
                        </div>
                        <h1 className="product-title mb-2" style={{ fontSize: '1.5rem', color: '#000', fontWeight: 'bold', textAlign: 'left' }}>
                            {product.tenSP}
                        </h1>
                        <p style={{ fontSize: '1.5rem', color: '#e53935', textAlign: 'left' }}>
                            Giá: {product.giaKhuyenMai && product.giaKhuyenMai < product.giaGoc ? (
                                <>
                                    <span style={{
                                        textDecoration: 'line-through',
                                        marginRight: '10px',
                                        color: '#757575',
                                        fontSize: '1rem'
                                    }}>
                                        {formatPrice(product.giaGoc)}
                                    </span>
                                    {formatPrice(product.giaKhuyenMai)}
                                    <span style={{ color: '#757575', fontSize: '0.9rem', marginLeft: '5px' }}>-{product.phantramgiamgia}%</span>
                                </>
                            ) : (
                                formatPrice(product.giaGoc)
                            )}
                        </p>
                    </div>
                    <div className="product-details mb-3" style={{
                        backgroundColor: '#fff',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        padding: '15px'
                    }}>
                        <h4 className="mb-2" style={{ fontSize: '1.1rem', color: '#000', fontWeight: 'bold', textAlign: 'left' }}>Thông tin chi tiết</h4>
                        <p style={{ fontSize: '0.9rem', color: '#444', textAlign: 'left' }}><strong style={{ fontWeight: 'bold' }}>Thể loại:</strong> {product.tenNhom}</p>
                        <p style={{ fontSize: '0.9rem', color: '#444', textAlign: 'left' }}><strong style={{ fontWeight: 'bold' }}>Tác giả:</strong> {product.tacgia}</p>
                        <p style={{ fontSize: '0.9rem', color: '#444', textAlign: 'left' }}><strong style={{ fontWeight: 'bold' }}>Nhà xuất bản:</strong> {product.tenNXB}</p>
                    </div>

                    <div className="product-description" style={{
                        backgroundColor: '#fff',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        padding: '15px'
                    }}>
                        <h4 className="mb-2" style={{ fontSize: '1.1rem', color: '#000', fontWeight: 'bold', textAlign: 'left' }}>Mô tả sản phẩm</h4>
                        <p style={{ fontSize: '0.9rem', color: '#444', maxHeight: product.mota.length > 200 && !showFullDescription ? '100px' : 'none', overflow: 'hidden', transition: 'max-height 0.3s ease', textAlign: 'left' }}>
                            {product.mota.split('\n').map((line, index) => (
                                <span key={index} style={{ display: 'block' }}>{line}</span>
                            ))}
                        </p>
                        {product.mota && product.mota.length > 300 && (
                            <button
                                onClick={toggleDescription}
                                className="btn btn-link p-0 mt-2"
                                style={{ fontSize: '0.9rem', color: '#1890ff', textDecoration: 'none', textAlign: 'left' }}
                            >
                                {showFullDescription ? 'Thu gọn' : 'Xem thêm'}
                            </button>
                        )}
                    </div>
                    <div className="recommended-products mt-5" style={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', padding: '15px' }}>
                        <h4 className="d-flex mb-3" style={{ fontSize: '1.2rem', color: '#333' }}>Sản phẩm tương tự</h4>
                        {recommendedProducts.length > 0 ? (
                            <div className="position-relative">
                                <button
                                    onClick={slideLeft}
                                    className="btn slider-btn left"
                                    style={{
                                        position: 'absolute',
                                        left: '-15px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        backgroundColor: currentSlide === 0 ? 'rgba(0, 0, 0, 0.2)' : '#0A68FF',
                                        color: '#fff',
                                        border: 'none',
                                        padding: '10px',
                                        borderRadius: '50%',
                                        cursor: currentSlide === 0 ? 'not-allowed' : 'pointer',
                                        zIndex: 10,
                                        width: '40px',
                                        height: '40px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                    disabled={currentSlide === 0}
                                >
                                    <svg width="20" height="20" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd" clipRule="evenodd" d="M12.0899 14.5899C11.7645 14.9153 11.2368 14.9153 10.9114 14.5899L5.91139 9.58991C5.58596 9.26447 5.58596 8.73683 5.91139 8.4114L10.9114 3.41139C11.2368 3.08596 11.7645 3.08596 12.0899 3.41139C12.4153 3.73683 12.4153 4.26447 12.0899 4.58991L7.67916 9.00065L12.0899 13.4114C12.4153 13.7368 12.4153 14.2645 12.0899 14.5899Z" fill="#fff" />
                                    </svg>
                                </button>
                                <div
                                    className="recommended-products-container"
                                    style={{
                                        overflow: 'hidden',
                                        width: '100%',
                                        paddingTop: '12px',
                                    }}
                                >
                                    <div
                                        ref={sliderRef}
                                        className="recommended-products-slider"
                                        style={{
                                            display: 'flex',
                                            gap: '8px',
                                            transform: 'translateX(0)',
                                            transition: 'transform 0.5s ease-in-out',
                                        }}
                                    >
                                        {Array.from({ length: totalSlides }).map((_, slideIndex) => (
                                            <div
                                                key={slideIndex}
                                                className="slide"
                                                style={{
                                                    display: 'grid',
                                                    gridTemplateColumns: 'repeat(4, 1fr)',
                                                    gridTemplateRows: 'repeat(2, 1fr)',
                                                    gap: '8px',
                                                    width: '100%',
                                                    flexShrink: 0,
                                                }}
                                            >
                                                {recommendedProducts
                                                    .slice(slideIndex * productsPerSlide, (slideIndex + 1) * productsPerSlide)
                                                    .map((item) => (
                                                        <div
                                                            key={item.masach}
                                                            className="recommended-product-card"
                                                            style={{
                                                                cursor: 'pointer',
                                                                border: '1px solid #e0e0e0',
                                                                borderRadius: '8px',
                                                                overflow: 'hidden',
                                                                backgroundColor: '#f9f9f9',
                                                                transition: 'transform 0.2s',
                                                            }}
                                                            onClick={() => navigate(`/detail-product/${item.masach}`)}
                                                            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
                                                            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                                                        >
                                                            <div style={{ width: '100%', height: '100px', overflow: 'hidden' }}>
                                                                <img
                                                                    src={`http://localhost:4000/uploads/${item.hinhanh}`}
                                                                    alt={item.tensach}
                                                                    style={{
                                                                        width: '100px',
                                                                        height: '100%',
                                                                        objectFit: 'contain',
                                                                    }}
                                                                />
                                                            </div>
                                                            <div className="p-2">
                                                                <h6
                                                                    className="mb-1"
                                                                    style={{
                                                                        fontSize: '0.9rem',
                                                                        color: '#333',
                                                                        whiteSpace: 'normal',
                                                                        overflow: 'hidden',
                                                                        textOverflow: 'ellipsis',
                                                                        display: '-webkit-box',
                                                                        WebkitLineClamp: 1,
                                                                        WebkitBoxOrient: 'vertical',
                                                                    }}
                                                                >
                                                                    {item.tensach}
                                                                </h6>
                                                                <div className="d-flex align-items-center gap-1">
                                                                    {item.giaKhuyenMai && item.giaKhuyenMai < item.giaGoc ? (
                                                                        <>
                                                                            <p className="mb-0" style={{ fontSize: '0.9rem', color: '#e53935', fontWeight: 'bold' }}>
                                                                                {formatPrice(item.giaKhuyenMai)}
                                                                            </p>
                                                                            <p className="mb-0" style={{ fontSize: '0.75rem', color: '#757575', textDecoration: 'line-through' }}>
                                                                                {formatPrice(item.giaGoc)}
                                                                            </p>
                                                                            <span style={{ fontSize: '0.75rem', color: '#e53935', backgroundColor: '#ffebeb', padding: '2px 4px', borderRadius: '4px' }}>
                                                                                -{item.phantramgiamgia}%
                                                                            </span>
                                                                        </>
                                                                    ) : (
                                                                        <p className="mb-0" style={{ fontSize: '0.9rem', color: '#e53935', fontWeight: 'bold' }}>
                                                                            {formatPrice(item.giaGoc)}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <button
                                    onClick={slideRight}
                                    className="btn slider-btn right"
                                    style={{
                                        position: 'absolute',
                                        right: '-15px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        backgroundColor: currentSlide === totalSlides - 1 ? 'rgba(0, 0, 0, 0.2)' : '#0A68FF',
                                        color: '#fff',
                                        border: 'none',
                                        padding: '10px',
                                        borderRadius: '50%',
                                        cursor: currentSlide === totalSlides - 1 ? 'not-allowed' : 'pointer',
                                        zIndex: 10,
                                        width: '40px',
                                        height: '40px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                    disabled={currentSlide === totalSlides - 1}
                                >
                                    <svg width="20" height="20" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd" clipRule="evenodd" d="M5.91107 3.41107C6.23651 3.08563 6.76414 3.08563 7.08958 3.41107L12.0896 8.41107C12.415 8.73651 12.415 9.26415 12.0896 9.58958L7.08958 14.5896C6.76414 14.915 6.23651 14.915 5.91107 14.5896C5.58563 14.2641 5.58563 13.7365 5.91107 13.4111L10.3218 9.00033L5.91107 4.58958C5.58563 4.26414 5.58563 3.73651 5.91107 3.41107Z" fill="#fff" />
                                    </svg>
                                </button>
                                <div
                                    className="pagination"
                                    style={{
                                        width: '100%',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        gap: '4px',
                                        marginTop: '8px',
                                    }}
                                >
                                    {Array.from({ length: totalSlides }).map((_, index) => (
                                        <div
                                            key={index}
                                            style={{
                                                width: index === currentSlide ? '24px' : '16px',
                                                height: '2px',
                                                background: index === currentSlide ? '#0A68FF' : 'rgba(0, 0, 0, 0.05)',
                                                borderRadius: '4px',
                                                transition: 'all 0.3s ease',
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <p style={{ fontSize: '0.9rem', color: '#666' }}>Không có sản phẩm tương tự nào.</p>
                        )}
                    </div>
                </div>
                <div className="col-md-3 p-3" style={{ position: 'sticky', top: '20px', alignSelf: 'flex-start', height: 'fit-content' }}>
                    <div className="buy-options" style={{
                        backgroundColor: '#fff',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        padding: '20px'
                    }}>
                        <div className="mb-3">
                            {product.tongsoluong > 0 ? (
                                <>
                                    <button
                                        onClick={handleBuyNow}
                                        className="btn btn-danger btn-lg w-100 mb-2"
                                        style={{ backgroundColor: '#e53935', borderColor: '#e53935', color: '#fff' }}
                                    >
                                        Mua ngay
                                    </button>
                                    <button
                                        onClick={handleAddToCart}
                                        className="btn btn-primary btn-lg w-100 mb-2"
                                        style={{ backgroundColor: '#1890ff', borderColor: '#1890ff', color: '#fff' }}
                                    >
                                        Thêm vào giỏ hàng
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        disabled
                                        className="btn btn-danger btn-lg w-100 mb-2"
                                        style={{ backgroundColor: '#ff4d4f', borderColor: '#ff4d4f', color: '#fff', cursor: 'not-allowed' }}
                                    >
                                        Hết hàng
                                    </button>
                                    <button
                                        disabled
                                        className="btn btn-primary btn-lg w-100 mb-2"
                                        style={{ backgroundColor: '#b3d1ff', borderColor: '#b3d1ff', color: '#fff', cursor: 'not-allowed' }}
                                    >
                                        Thêm vào giỏ hàng
                                    </button>
                                </>
                            )}
                            <button
                                onClick={() => navigate('/product')}
                                className="btn btn-outline-secondary btn-lg w-100"
                                style={{ borderColor: '#757575', color: '#757575' }}
                            >
                                Quay lại danh sách sản phẩm
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {isZoomed && (
                <div
                    className="zoom-overlay"
                    onClick={(e) => {
                        if (e.target.className === 'zoom-overlay') {
                            setIsZoomed(false);
                        }
                    }}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        backgroundColor: 'rgba(0, 0, 0, 0.9)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 10000
                    }}
                >
                    <div className="zoom-content position-relative" style={{ position: 'relative', width: '95%', height: '95%', overflow: 'hidden' }}>
                        <button
                            onClick={closeZoom}
                            className="btn close-btn"
                            style={{
                                position: 'absolute',
                                top: '10px',
                                right: '10px',
                                backgroundColor: 'white',
                                color: '#333',
                                border: '1px solid #ccc',
                                padding: '5px 10px',
                                borderRadius: '50%',
                                fontSize: '14px',
                                zIndex: 10001,
                                transition: 'background-color 0.3s, color 0.3s'
                            }}
                        >
                            ×
                        </button>
                        <div
                            className="zoom-slider-wrapper"
                            style={{
                                display: 'flex',
                                width: `${allImages.length * 100}%`,
                                height: '100%',
                                transform: `translateX(-${currentImageIndex * (100 / allImages.length)}%)`,
                                transition: 'transform 0.3s ease-in-out'
                            }}
                        >
                            {allImages.map((image, index) => (
                                <img
                                    key={index}
                                    src={image}
                                    alt={`${product.tenSP} ${index + 1}`}
                                    style={{
                                        width: `${100 / allImages.length}%`,
                                        height: '100%',
                                        objectFit: 'contain'
                                    }}
                                />
                            ))}
                        </div>
                        {allImages.length > 1 && (
                            <>
                                <button
                                    onClick={prevImage}
                                    className="btn position-absolute tiki-slider-btn"
                                    style={{
                                        left: '10px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        backgroundColor: 'white',
                                        color: '#333',
                                        border: '1px solid #ccc',
                                        padding: '8px 12px',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '12px',
                                        transition: 'background-color 0.3s, color 0.3s',
                                        zIndex: 10001
                                    }}
                                >
                                    &lt;
                                </button>
                                <button
                                    onClick={nextImage}
                                    className="btn position-absolute tiki-slider-btn"
                                    style={{
                                        right: '10px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        backgroundColor: 'white',
                                        color: '#333',
                                        border: '1px solid #ccc',
                                        padding: '8px 12px',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '12px',
                                        transition: 'background-color 0.3s, color 0.3s',
                                        zIndex: 10001
                                    }}
                                >
                                    &gt;
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}

            <div className="comments-section mt-5 p-3" style={{
                backgroundColor: '#fff',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}>
                <h4 className="mb-3" style={{ fontSize: '1.2rem', color: '#333' }}>Viết bình luận của bạn</h4>
                <textarea
                    className="form-control mb-3"
                    rows="3"
                    placeholder="Viết bình luận..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    style={{ borderRadius: '4px', borderColor: '#e0e0e0' }}
                ></textarea>
                <button
                    className="btn btn-primary"
                    onClick={handleSubmitComment}
                    style={{ backgroundColor: '#1890ff', borderColor: '#1890ff', color: '#fff' }}
                >
                    Gửi bình luận
                </button>

                <div className="mt-4">
                    <h5 className="d-flex justify-content-between align-items-center">
                        Danh sách bình luận ({comments.length} bình luận)
                        <div className="sort-comments">
                            <label htmlFor="sortOrder" className="me-2" style={{ fontSize: '0.9rem', color: '#757575' }}>Sắp xếp:</label>
                            <select
                                id="sortOrder"
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value)}
                                className="form-select form-select-sm d-inline w-auto"
                                style={{ fontSize: '0.9rem', borderRadius: '4px', borderColor: '#e0e0e0' }}
                            >
                                <option value="newest">Mới nhất</option>
                                <option value="oldest">Cũ nhất</option>
                            </select>
                        </div>
                    </h5>

                    {currentComments.length === 0 ? (
                        <p style={{ fontSize: '0.9rem', color: '#666' }}>Chưa có đánh giá cho sản phẩm này.</p>
                    ) : (
                        <ul className="list-unstyled">
                            {currentComments.map((comment) => (
                                <li key={comment.madanhgia} className="comment-item mb-3">
                                    <div className="comment-header d-flex justify-content-between align-items-center mb-2">
                                        <div className="d-flex align-items-center">
                                            <img
                                               src={
                                                    comment.avatar 
                                                        ? `http://localhost:4000/uploads/${comment.avatar}` 
                                                        : 'http://localhost:4000/uploads/default-avatar.jpg'
                                                }
                                                alt={`${comment.tennguoidung}'s avatar`}
                                                className="img-fluid rounded-circle me-2"
                                                style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                            />
                                            <div className="d-flex flex-column align-items-start">
                                                <strong style={{ fontSize: '1rem', color: '#333' }}>{comment.tennguoidung}</strong>
                                                <p className="mb-0" style={{ fontSize: '0.9rem', color: '#666' }}>{comment.binhluan}</p>
                                            </div>
                                        </div>
                                        {String(comment.manguoidung) === String(localStorage.getItem('userid')) && (
                                            <button
                                                className="btn btn-sm dropdown-toggle"
                                                onClick={() => toggleDropdown(comment.madanhgia)}
                                                style={{ backgroundColor: '#fff', borderColor: '#ddd', fontSize: '0.8rem', color: '#757575' }}
                                            >
                                                <i className="fas fa-caret-down"></i>
                                            </button>
                                        )}
                                    </div>

                                    {dropdownVisible[comment.madanhgia] && (
                                        <div className="dropdown-menu show" style={{
                                            position: 'absolute',
                                            backgroundColor: '#fff',
                                            border: '1px solid #ddd',
                                            borderRadius: '4px',
                                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                                        }}>
                                            <button
                                                className="dropdown-item d-flex"
                                                onClick={() => handleEditComment(comment.madanhgia, comment.binhluan)}
                                                style={{ fontSize: '0.9rem', color: '#333' }}
                                            >
                                                Chỉnh sửa bình luận
                                            </button>
                                            <button
                                                className="dropdown-item text-danger d-flex"
                                                onClick={() => handleDeleteComment(comment.madanhgia)}
                                                style={{ fontSize: '0.9rem', color: '#ff4d4f' }}
                                            >
                                                Xóa bình luận
                                            </button>
                                        </div>
                                    )}
                                    <small className="text-muted d-flex justify-content-end" style={{ fontSize: '0.8rem', color: '#757575' }}>
                                        {new Date(comment.ngaydanhgia).toLocaleString('en-US', {
                                            hour12: true,
                                            month: '2-digit',
                                            day: '2-digit',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </small>
                                </li>
                            ))}
                        </ul>
                    )}

                    {comments.length > commentsPerPage && (
                        <div className="pagination mt-3 d-flex justify-content-center">
                            {Array.from({ length: Math.ceil(comments.length / commentsPerPage) }, (_, index) => (
                                <button
                                    key={index}
                                    className={`btn btn-sm mx-1 ${currentPage === index + 1 ? 'btn-primary' : 'btn-outline-primary'}`}
                                    onClick={() => paginate(index + 1)}
                                    style={{
                                        fontSize: '0.9rem',
                                        backgroundColor: currentPage === index + 1 ? '#1890ff' : '#fff',
                                        borderColor: '#1890ff',
                                        color: currentPage === index + 1 ? '#fff' : '#1890ff',
                                        borderRadius: '4px'
                                    }}
                                >
                                    {index + 1}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="viewed-products mt-5" style={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', padding: '15px' }}>
                <h4 className="d-flex mb-3" style={{ fontSize: '1.2rem', color: '#333' }}>Sản phẩm đã xem</h4>
                {viewedProducts.length > 0 ? (
                    <div className="d-flex" style={{ overflowX: 'auto', whiteSpace: 'nowrap', gap: '15px', paddingBottom: '10px' }}>
                        {viewedProducts.map((item) => (
                            <div
                                key={item.masach}
                                className="viewed-product-card"
                                style={{
                                    display: 'inline-block',
                                    width: '150px',
                                    flexShrink: 0,
                                    cursor: 'pointer',
                                    border: '1px solid #e0e0e0',
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                    transition: 'transform 0.2s',
                                }}
                                onClick={() => navigate(`/detail-product/${item.masach}`)}
                                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
                                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                            >
                                <img
                                    src={`http://localhost:4000/uploads/${item.hinhanh}`}
                                    alt={item.tenSP}
                                    style={{
                                        width: '100%',
                                        height: '150px',
                                        objectFit: 'cover',
                                        borderBottom: '1px solid #e0e0e0',
                                    }}
                                />
                                <div className="p-2">
                                    <h6
                                        className="mb-1"
                                        style={{
                                            fontSize: '0.9rem',
                                            color: '#333',
                                            whiteSpace: 'normal',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                        }}
                                    >
                                        {item.tenSP}
                                    </h6>
                                    <div className="d-flex align-items-center gap-1">
                                        {item.giaKhuyenMai && item.giaKhuyenMai < item.giaGoc ? (
                                            <>
                                                <p
                                                    className="mb-0"
                                                    style={{
                                                        fontSize: '0.9rem',
                                                        color: '#e53935',
                                                        fontWeight: 'bold',
                                                    }}
                                                >
                                                    {formatPrice(item.giaKhuyenMai)}
                                                </p>
                                                <p
                                                    className="mb-0"
                                                    style={{
                                                        fontSize: '0.75rem',
                                                        color: '#757575',
                                                        textDecoration: 'line-through',
                                                    }}
                                                >
                                                    {formatPrice(item.giaGoc)}
                                                </p>
                                                <span
                                                    style={{
                                                        fontSize: '0.75rem',
                                                        color: '#e53935',
                                                        backgroundColor: '#ffebeb',
                                                        padding: '2px 4px',
                                                        borderRadius: '4px',
                                                    }}
                                                >
                                                    -{item.phantramgiamgia}%
                                                </span>
                                            </>
                                        ) : (
                                            <p
                                                className="mb-0"
                                                style={{
                                                    fontSize: '0.9rem',
                                                    color: '#e53935',
                                                    fontWeight: 'bold',
                                                }}
                                            >
                                                {formatPrice(item.giaGoc)}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p style={{ fontSize: '0.9rem', color: '#666' }}>
                        {localStorage.getItem('userid') ? 'Bạn chưa xem sản phẩm nào.' : 'Vui lòng đăng nhập để xem lịch sử sản phẩm đã xem.'}
                    </p>
                )}
            </div>
        </div>
    );
};

export default ProductDetail;

// import React, { useState, useEffect, useRef } from 'react';
// import { Link, useParams, useNavigate } from 'react-router-dom'; 
// import axios from 'axios';
// import { formatPrice } from '../../utils/utils';
// import { useCart } from '../CartContext';  

// const ProductDetail = () => {
//     const { id } = useParams();  
//     const navigate = useNavigate();  
//     const { addToCart } = useCart();  
//     const [product, setProduct] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [comments, setComments] = useState([]);
//     const [newComment, setNewComment] = useState('');
//     const [dropdownVisible, setDropdownVisible] = useState({});
//     const [mainImage, setMainImage] = useState('');
//     const [showFullDescription, setShowFullDescription] = useState(false);
//     const [isZoomed, setIsZoomed] = useState(false);
//     const [currentImageIndex, setCurrentImageIndex] = useState(0);
//     const [allImages, setAllImages] = useState([]);
//     const [viewedProducts, setViewedProducts] = useState([]); // Sản phẩm đã xem
//     const [similarProducts, setSimilarProducts] = useState([]); // Sản phẩm tương tự
//     const [sortOrder, setSortOrder] = useState('newest');
//     const [currentPage, setCurrentPage] = useState(1);
//     const commentsPerPage = 5;
//     const sliderRef = useRef(null); // Tham chiếu đến slider
//     const [currentSlide, setCurrentSlide] = useState(0);

//     // Hàm lấy danh sách sản phẩm đã xem từ server
//     const fetchViewedProducts = async (userId) => {
//         if (!userId) return; // Nếu chưa đăng nhập, không lấy lịch sử xem
//         try {
//             const response = await axios.get(`http://localhost:4000/api/viewed-products/${userId}`, {
//                 headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` },
//                 withCredentials: true,
//             });
//             // Lọc sản phẩm hiện tại ra khỏi danh sách
//             const filteredViewed = response.data.filter(p => String(p.masach) !== String(id));
//             setViewedProducts(filteredViewed);
//             console.log('Danh sách đã xem từ server:', filteredViewed);
//         } catch (error) {
//             console.error('Lỗi khi lấy lịch sử xem:', error);
//         }
//     };

//     // Hàm lưu sản phẩm đã xem vào server
//     const saveViewedProduct = async (userId, masach) => {
//         if (!userId) return; // Nếu chưa đăng nhập, không lưu
//         try {
//             await axios.post(
//                 `http://localhost:4000/api/viewed-products`,
//                 { manguoidung: userId, masach },
//                 {
//                     headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` },
//                     withCredentials: true,
//                 }
//             );
//             // Sau khi lưu, lấy lại danh sách đã xem
//             fetchViewedProducts(userId);
//         } catch (error) {
//             console.error('Lỗi khi lưu lịch sử xem:', error);
//         }
//     };

//     // Hàm lấy danh sách sản phẩm tương tự
//     const fetchSimilarProducts = async (matheloai) => {
//         try {
//             const response = await axios.get(`http://localhost:4000/api/product/group/${matheloai}`);
//             const filteredProducts = response.data
//                 .filter(p => String(p.masach) !== String(id))
//                 .slice(0, 24); // Lấy tối đa 24 sản phẩm để có ít nhất 3 slide (mỗi slide 8 sản phẩm)
//             setSimilarProducts(filteredProducts);
//         } catch (error) {
//             console.error('Lỗi khi lấy sản phẩm tương tự:', error);
//         }
//     };
    
//     // Tính số slide dựa trên số sản phẩm (8 sản phẩm mỗi slide)
//     const productsPerSlide = 8;
//     const totalSlides = Math.ceil(similarProducts.length / productsPerSlide);

//     // Hàm điều hướng slider
//     const slideLeft = () => {
//         if (currentSlide > 0) {
//             setCurrentSlide(currentSlide - 1);
//             if (sliderRef.current) {
//                 sliderRef.current.style.transform = `translateX(-${(currentSlide - 1) * 100}%)`;
//             }
//         }
//     };

//     const slideRight = () => {
//         if (currentSlide < totalSlides - 1) {
//             setCurrentSlide(currentSlide + 1);
//             if (sliderRef.current) {
//                 sliderRef.current.style.transform = `translateX(-${(currentSlide + 1) * 100}%)`;
//             }
//         }
//     };

//     useEffect(() => {
//         const userId = localStorage.getItem('userid');

//         const fetchProductDetail = async () => {
//             try {
//                 const response = await axios.get(`http://localhost:4000/api/detail-product/${id}`);
//                 console.log('Dữ liệu sản phẩm:', response.data);
//                 setProduct(response.data);
//                 const primaryImage = response.data.hinhanh ? [`http://localhost:4000/uploads/${response.data.hinhanh}`] : [];
//                 const secondaryImages = response.data.hinhanh_phu 
//                     ? JSON.parse(response.data.hinhanh_phu || '[]').map(img => `http://localhost:4000/uploads/${img}`)
//                     : [];
//                 const images = [...primaryImage, ...secondaryImages];
//                 setAllImages(images);
//                 setMainImage(images[0] || '');
//                 setLoading(false);

//                 // Gọi hàm lấy sản phẩm tương tự dựa trên matheloai và tacgia
//                 fetchSimilarProducts(response.data.matheloai, response.data.tacgia);

//                 // Lưu sản phẩm đã xem vào server nếu người dùng đã đăng nhập
//                 if (userId && response.data.masach) {
//                     saveViewedProduct(userId, response.data.masach);
//                 }
//             } catch (err) {
//                 setError('Không thể tải chi tiết sản phẩm.');
//                 setLoading(false);
//             }
//         };

//         const fetchComments = async () => {
//             try {
//                 const response = await axios.get(`http://localhost:4000/api/comments/${id}`);
//                 console.log('Dữ liệu bình luận trả về:', response.data);
//                 setComments(response.data);
//             } catch (err) {
//                 console.error('Không thể tải bình luận.');
//             }
//         };

//         fetchProductDetail();
//         fetchComments();
//         fetchViewedProducts(userId); // Lấy danh sách sản phẩm đã xem khi tải trang
//     }, [id]);

//     const handleAddToCart = () => {
//         const userId = localStorage.getItem('userid');
//         if (!userId) {
//             alert('Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng.');
//             return;
//         }
        
//         const productToAdd = {
//             ...product,
//             gia: product.giaKhuyenMai || product.giaGoc,
//         };
//         console.log('Sản phẩm thêm vào giỏ hàng:', productToAdd);
//         addToCart(productToAdd);  
//         alert('Sản phẩm đã được thêm vào giỏ hàng!');
//     };
    
//     const handleBuyNow = () => {
//         const userId = localStorage.getItem('userid');
//         if (!userId) {
//             alert('Bạn cần đăng nhập để mua sản phẩm.');
//             return;
//         }
        
//         const productToAdd = {
//             ...product,
//             gia: product.giaKhuyenMai || product.giaGoc,
//         };
//         console.log('Sản phẩm mua ngay:', productToAdd);
//         addToCart(productToAdd);  
//         navigate('/cart');
//     };
    
//     const handleSubmitComment = async () => {
//         if (!newComment) return alert('Vui lòng nhập bình luận.');
//         const userId = localStorage.getItem('userid');
//         if (!userId) {
//             alert('Bạn cần đăng nhập để bình luận.');
//             return;
//         }
//         try {
//             await axios.post(
//                 `http://localhost:4000/api/add-comments/${id}`,
//                 { content: newComment },
//                 {
//                     headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` },
//                     withCredentials: true,
//                 }
//             );            
//             setNewComment('');
//             const response = await axios.get(`http://localhost:4000/api/comments/${id}`);
//             setComments(response.data);
//         } catch (error) {
//             console.error('Lỗi khi gửi bình luận', error);
//         }
//     };

//     const handleEditComment = (commentId, currentContent) => {
//         const newContent = prompt('Nhập nội dung mới:', currentContent);
//         axios
//             .put(
//                 `http://localhost:4000/api/comments/${commentId}`,
//                 { content: newContent },
//                 {
//                     headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` },
//                     withCredentials: true,
//                 }
//             )
//             .then(() => {
//                 alert('Cập nhật bình luận thành công.');
//                 return axios.get(`http://localhost:4000/api/comments/${id}`);
//             })
//             .then((response) => setComments(response.data))
//             .catch((error) => console.error('Lỗi khi cập nhật bình luận:', error));
//     };
    
//     const handleDeleteComment = (commentId) => {
//         if (!window.confirm('Bạn có chắc chắn muốn xóa bình luận này?')) return;
//         axios
//             .delete(`http://localhost:4000/api/comments/${commentId}`, {
//                 headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` },
//                 withCredentials: true,
//             })
//             .then(() => {
//                 alert('Xóa bình luận thành công.');
//                 return axios.get(`http://localhost:4000/api/comments/${id}`);
//             })
//             .then((response) => setComments(response.data))
//             .catch((error) => console.error('Lỗi khi xóa bình luận:', error));
//     };    

//     const toggleDropdown = (commentId) => {
//         setDropdownVisible(prevState => ({
//             ...prevState,
//             [commentId]: !prevState[commentId],
//         }));
//     };

//     const sortedComments = [...comments].sort((a, b) => {
//         return sortOrder === 'newest'
//             ? new Date(b.ngaydanhgia) - new Date(a.ngaydanhgia)
//             : new Date(a.ngaydanhgia) - new Date(b.ngaydanhgia);
//     });

//     const indexOfLastComment = currentPage * commentsPerPage;
//     const indexOfFirstComment = indexOfLastComment - commentsPerPage;
//     const currentComments = sortedComments.slice(indexOfFirstComment, indexOfLastComment);

//     const paginate = (pageNumber) => setCurrentPage(pageNumber);

//     const handleThumbnailClick = (imageUrl, index) => {
//         setCurrentImageIndex(index);
//         setMainImage(imageUrl);
//         setIsZoomed(false);
//     };

//     const toggleDescription = () => {
//         setShowFullDescription(!showFullDescription);
//     };

//     const handleImageClick = () => {
//         setIsZoomed(!isZoomed);
//     };

//     const nextImage = () => {
//         const nextIndex = (currentImageIndex + 1) % allImages.length;
//         setCurrentImageIndex(nextIndex);
//         setMainImage(allImages[nextIndex]);
//     };

//     const prevImage = () => {
//         const prevIndex = (currentImageIndex - 1 + allImages.length) % allImages.length;
//         setCurrentImageIndex(prevIndex);
//         setMainImage(allImages[prevIndex]);
//     };

//     const closeZoom = () => {
//         setIsZoomed(false);
//     };

//     if (loading) {
//         return <div>Đang tải chi tiết sản phẩm...</div>;
//     }

//     if (error) {
//         return <div>{error}</div>;
//     }

//     if (!product) {
//         return <div>Sản phẩm không tồn tại.</div>;
//     }

//     return (
//         <div className="container my-3">
//             {/* Breadcrumb */}
//             <nav aria-label="breadcrumb">
//                 <ol className="breadcrumb">
//                     <li className="breadcrumb-item">
//                         <Link to="/" style={{ textDecoration: 'none', color: '#1890ff' }}>
//                             Trang chủ
//                         </Link>
//                     </li>
//                     <li className="breadcrumb-item">
//                         <Link to="/product" style={{ textDecoration: 'none', color: '#1890ff' }}>
//                             Sản phẩm
//                         </Link>
//                     </li>
//                     <li className="breadcrumb-item active" aria-current="page">
//                         {product.tenSP}
//                     </li>
//                 </ol>
//             </nav>
//             <div className="row g-0">
//                 <div className="col-md-4 p-3" style={{ position: 'sticky', top: '20px', alignSelf: 'flex-start', height: 'fit-content' }}>
//                     <div className="main-image-container mb-3 position-relative" style={{ overflow: 'hidden', width: '100%', height: '500px' }}>
//                         <div 
//                             className="slider-wrapper"
//                             style={{
//                                 display: 'flex',
//                                 width: `${allImages.length * 100}%`,
//                                 height: '100%',
//                                 transform: `translateX(-${currentImageIndex * (100 / allImages.length)}%)`,
//                                 transition: 'transform 0.3s ease-in-out'
//                             }}
//                         >
//                             {allImages.map((image, index) => (
//                                 <img
//                                     key={index}
//                                     src={image}
//                                     alt={`${product.tenSP} ${index + 1}`}
//                                     className="main-image img-fluid rounded shadow-sm"
//                                     onClick={handleImageClick}
//                                     style={{
//                                         width: `${100 / allImages.length}%`,
//                                         height: '500px',
//                                         objectFit: 'contain',
//                                         borderRadius: '8px',
//                                         boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
//                                         cursor: 'zoom-in'
//                                     }}
//                                 />
//                             ))}
//                         </div>
//                         {allImages.length > 1 && (
//                             <>
//                                 <button 
//                                     onClick={prevImage}
//                                     className="btn position-absolute tiki-slider-btn"
//                                     style={{
//                                         left: '10px',
//                                         top: '50%',
//                                         transform: 'translateY(-50%)',
//                                         backgroundColor: 'white',
//                                         color: '#333',
//                                         border: '1px solid #ccc',
//                                         padding: '8px 12px',
//                                         borderRadius: '50%',
//                                         display: 'flex',
//                                         alignItems: 'center',
//                                         justifyContent: 'center',
//                                         fontSize: '12px',
//                                         transition: 'background-color 0.3s, color 0.3s'
//                                     }}
//                                 >
//                                     &lt;
//                                 </button>
//                                 <button 
//                                     onClick={nextImage}
//                                     className="btn position-absolute tiki-slider-btn"
//                                     style={{
//                                         right: '10px',
//                                         top: '50%',
//                                         transform: 'translateY(-50%)',
//                                         backgroundColor: 'white',
//                                         color: '#333',
//                                         border: '1px solid #ccc',
//                                         padding: '8px 12px',
//                                         borderRadius: '50%',
//                                         display: 'flex',
//                                         alignItems: 'center',
//                                         justifyContent: 'center',
//                                         fontSize: '12px',
//                                         transition: 'background-color 0.3s, color 0.3s'
//                                     }}
//                                 >
//                                     &gt;
//                                 </button>
//                             </>
//                         )}
//                     </div>
                    
//                     <div className="thumbnails d-flex gap-2" style={{ maxWidth: '100%' }}>
//                         {allImages.map((image, index) => (
//                             <img 
//                                 key={index}
//                                 src={image} 
//                                 alt={`${product.tenSP} Thumbnail ${index + 1}`} 
//                                 className="thumbnail img-fluid rounded shadow-sm" 
//                                 onClick={() => handleThumbnailClick(image, index)}
//                                 style={{ 
//                                     width: '60px', 
//                                     height: '60px', 
//                                     objectFit: 'cover', 
//                                     cursor: 'pointer',
//                                     border: currentImageIndex === index ? '2px solid #1890ff' : '2px solid #ddd',
//                                     transition: 'border-color 0.3s'
//                                 }}
//                             />
//                         ))}
//                     </div>
//                 </div>

//                 <div className="col-md-5 p-3" style={{ minHeight: 'calc(100vh - 100px)' }}>
//                     <div className="product-header mb-3" style={{ 
//                         backgroundColor: '#fff', 
//                         borderRadius: '8px',
//                         boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
//                         padding: '15px'
//                     }}>
//                         <div className="promo-icons mb-2" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
//                             <span className="promo-icon" style={{ 
//                                 backgroundColor: '#e3f2fd', 
//                                 color: '#1976d2', 
//                                 padding: '4px 8px', 
//                                 borderRadius: '4px', 
//                                 fontSize: '12px', 
//                                 fontWeight: 'bold' 
//                             }}>
//                                 FREESHIP XTRA
//                             </span>
//                             <span className="promo-icon" style={{ 
//                                 backgroundColor: '#e8f5e9', 
//                                 color: '#2e7d32', 
//                                 padding: '4px 8px', 
//                                 borderRadius: '4px', 
//                                 fontSize: '12px', 
//                                 fontWeight: 'bold' 
//                             }}>
//                                 30 NGÀY ĐỔI TRẢ
//                             </span>
//                             <span className="promo-icon" style={{ 
//                                 backgroundColor: '#e8f5e9', 
//                                 color: '#2e7d32', 
//                                 padding: '4px 8px', 
//                                 borderRadius: '4px', 
//                                 fontSize: '12px', 
//                                 fontWeight: 'bold' 
//                             }}>
//                                 CHÍNH HÃNG
//                             </span>
//                         </div>
//                         <h1 className="product-title mb-2" style={{ fontSize: '1.5rem', color: '#000', fontWeight: 'bold', textAlign: 'left' }}>
//                             {product.tenSP}
//                         </h1>
//                         <p style={{ fontSize: '1.5rem', color: '#e53935', textAlign: 'left' }}> 
//                             Giá: {product.giaKhuyenMai && product.giaKhuyenMai < product.giaGoc ? (
//                                 <>
//                                     <span style={{ 
//                                         textDecoration: 'line-through', 
//                                         marginRight: '10px', 
//                                         color: '#757575', 
//                                         fontSize: '1rem'
//                                     }}>
//                                         {formatPrice(product.giaGoc)}
//                                     </span>
//                                     {formatPrice(product.giaKhuyenMai)}
//                                     <span style={{ color: '#757575', fontSize: '0.9rem', marginLeft: '5px' }}>-{product.phantramgiamgia}%</span>
//                                 </>
//                             ) : (
//                                 formatPrice(product.giaGoc)
//                             )}
//                         </p>
//                     </div>       
//                     <div className="product-details mb-3" style={{ 
//                         backgroundColor: '#fff', 
//                         borderRadius: '8px',
//                         boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
//                         padding: '15px'
//                     }}>
//                         <h4 className="mb-2" style={{ fontSize: '1.1rem', color: '#000', fontWeight: 'bold', textAlign: 'left' }}>Thông tin chi tiết</h4>
//                         <p style={{ fontSize: '0.9rem', color: '#444', textAlign: 'left' }}><strong style={{ fontWeight: 'bold' }}>Thể loại:</strong> {product.tenNhom}</p>
//                         <p style={{ fontSize: '0.9rem', color: '#444', textAlign: 'left' }}><strong style={{ fontWeight: 'bold' }}>Tác giả:</strong> {product.tacgia}</p>
//                         <p style={{ fontSize: '0.9rem', color: '#444', textAlign: 'left' }}><strong style={{ fontWeight: 'bold' }}>Nhà xuất bản:</strong> {product.tenNXB}</p>
//                     </div>

//                     <div className="product-description" style={{ 
//                         backgroundColor: '#fff', 
//                         borderRadius: '8px',
//                         boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
//                         padding: '15px'
//                     }}>
//                         <h4 className="mb-2" style={{ fontSize: '1.1rem', color: '#000', fontWeight: 'bold', textAlign: 'left' }}>Mô tả sản phẩm</h4>
//                         <p style={{ fontSize: '0.9rem', color: '#444', maxHeight: product.mota.length > 200 && !showFullDescription ? '100px' : 'none', overflow: 'hidden', transition: 'max-height 0.3s ease', textAlign: 'left' }}>
//                             {product.mota.split('\n').map((line, index) => (
//                                 <span key={index} style={{ display: 'block' }}>{line}</span>
//                             ))}
//                         </p>
//                         {product.mota && product.mota.length > 300 && (
//                             <button 
//                                 onClick={toggleDescription} 
//                                 className="btn btn-link p-0 mt-2" 
//                                 style={{ fontSize: '0.9rem', color: '#1890ff', textDecoration: 'none', textAlign: 'left' }}
//                             >
//                                 {showFullDescription ? 'Thu gọn' : 'Xem thêm'}
//                             </button>
//                         )}
//                     </div>
//                     <div className="similar-products mt-5" style={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', padding: '15px' }}>
//                         <h4 className="d-flex mb-3" style={{ fontSize: '1.2rem', color: '#333' }}>Sản phẩm tương tự</h4>
//                         {similarProducts.length > 0 ? (
//                             <div className="position-relative">
//                                 <button
//                                     onClick={slideLeft}
//                                     className="btn slider-btn left"
//                                     style={{
//                                         position: 'absolute',
//                                         left: '-15px',
//                                         top: '50%',
//                                         transform: 'translateY(-50%)',
//                                         backgroundColor: currentSlide === 0 ? 'rgba(0, 0, 0, 0.2)' : '#0A68FF',
//                                         color: '#fff',
//                                         border: 'none',
//                                         padding: '10px',
//                                         borderRadius: '50%',
//                                         cursor: currentSlide === 0 ? 'not-allowed' : 'pointer',
//                                         zIndex: 10,
//                                         width: '40px',
//                                         height: '40px',
//                                         display: 'flex',
//                                         alignItems: 'center',
//                                         justifyContent: 'center',
//                                     }}
//                                     disabled={currentSlide === 0}
//                                 >
//                                     <svg width="20" height="20" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
//                                         <path fillRule="evenodd" clipRule="evenodd" d="M12.0899 14.5899C11.7645 14.9153 11.2368 14.9153 10.9114 14.5899L5.91139 9.58991C5.58596 9.26447 5.58596 8.73683 5.91139 8.4114L10.9114 3.41139C11.2368 3.08596 11.7645 3.08596 12.0899 3.41139C12.4153 3.73683 12.4153 4.26447 12.0899 4.58991L7.67916 9.00065L12.0899 13.4114C12.4153 13.7368 12.4153 14.2645 12.0899 14.5899Z" fill="#fff" />
//                                     </svg>
//                                 </button>
//                                 <div
//                                     className="similar-products-container"
//                                     style={{
//                                         overflow: 'hidden',
//                                         width: '100%',
//                                         paddingTop: '12px',
//                                     }}
//                                 >
//                                     <div
//                                         ref={sliderRef}
//                                         className="similar-products-slider"
//                                         style={{
//                                             display: 'flex',
//                                             gap: '8px',
//                                             transform: 'translateX(0)',
//                                             transition: 'transform 0.5s ease-in-out',
//                                         }}
//                                     >
//                                         {Array.from({ length: totalSlides }).map((_, slideIndex) => (
//                                             <div
//                                                 key={slideIndex}
//                                                 className="slide"
//                                                 style={{
//                                                     display: 'grid',
//                                                     gridTemplateColumns: 'repeat(4, 1fr)', // 4 cột
//                                                     gridTemplateRows: 'repeat(2, 1fr)', // 2 hàng
//                                                     gap: '8px',
//                                                     width: '100%',
//                                                     flexShrink: 0,
//                                                 }}
//                                             >
//                                                 {similarProducts
//                                                     .slice(slideIndex * productsPerSlide, (slideIndex + 1) * productsPerSlide)
//                                                     .map((item) => (
//                                                         <div
//                                                             key={item.masach}
//                                                             className="similar-product-card"
//                                                             style={{
//                                                                 cursor: 'pointer',
//                                                                 border: '1px solid #e0e0e0',
//                                                                 borderRadius: '8px',
//                                                                 overflow: 'hidden',
//                                                                 backgroundColor: '#f9f9f9',
//                                                                 transition: 'transform 0.2s',
//                                                             }}
//                                                             onClick={() => navigate(`/detail-product/${item.masach}`)}
//                                                             onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
//                                                             onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
//                                                         >
//                                                             <div style={{ width: '100%', height: '100px', overflow: 'hidden' }}>
//                                                                 <img
//                                                                     src={`http://localhost:4000/uploads/${item.hinhanh}`}
//                                                                     alt={item.tensach}
//                                                                     style={{
//                                                                         width: '100px',
//                                                                         height: '100%',
//                                                                         objectFit: 'contain',
//                                                                     }}
//                                                                 />
//                                                             </div>
//                                                             <div className="p-2">
//                                                                 <h6
//                                                                     className="mb-1"
//                                                                     style={{
//                                                                         fontSize: '0.9rem',
//                                                                         color: '#333',
//                                                                         whiteSpace: 'normal',
//                                                                         overflow: 'hidden',
//                                                                         textOverflow: 'ellipsis',
//                                                                         display: '-webkit-box',
//                                                                         WebkitLineClamp: 1,
//                                                                         WebkitBoxOrient: 'vertical',                                                                    
//                                                                     }}
//                                                                 >
//                                                                     {item.tensach}
//                                                                 </h6>
//                                                                 <div className="d-flex align-items-center gap-1">
//                                                                     {/* {item.giaKhuyenMai && item.giaKhuyenMai < item.giaGoc ? (
//                                                                         <>
//                                                                             <p className="mb-0" style={{ fontSize: '0.9rem', color: '#e53935', fontWeight: 'bold' }}>
//                                                                                 {formatPrice(item.giaKhuyenMai)}
//                                                                             </p>
//                                                                             <p className="mb-0" style={{ fontSize: '0.75rem', color: '#757575', textDecoration: 'line-through' }}>
//                                                                                 {formatPrice(item.giaGoc)}
//                                                                             </p>
//                                                                             <span style={{ fontSize: '0.75rem', color: '#e53935', backgroundColor: '#ffebeb', padding: '2px 4px', borderRadius: '4px' }}>
//                                                                                 -{item.phantramgiamgia}%
//                                                                             </span>
//                                                                         </>
//                                                                     ) : (
//                                                                         <p className="mb-0" style={{ fontSize: '0.9rem', color: '#e53935', fontWeight: 'bold' }}>
//                                                                             {formatPrice(item.giaGoc)}
//                                                                         </p>
//                                                                     )} */}
//                                                                     {formatPrice(item.giaGoc)}
//                                                                 </div>
//                                                                 {/* <div className="d-flex align-items-center mt-1">
//                                                                     <span style={{ fontSize: '0.75rem', color: '#ff9800' }}>★★★★★</span>
//                                                                 </div> */}
//                                                             </div>
//                                                         </div>
//                                                     ))}
//                                             </div>
//                                         ))}
//                                     </div>
//                                 </div>
//                                 <button
//                                     onClick={slideRight}
//                                     className="btn slider-btn right"
//                                     style={{
//                                         position: 'absolute',
//                                         right: '-15px',
//                                         top: '50%',
//                                         transform: 'translateY(-50%)',
//                                         backgroundColor: currentSlide === totalSlides - 1 ? 'rgba(0, 0, 0, 0.2)' : '#0A68FF',
//                                         color: '#fff',
//                                         border: 'none',
//                                         padding: '10px',
//                                         borderRadius: '50%',
//                                         cursor: currentSlide === totalSlides - 1 ? 'not-allowed' : 'pointer',
//                                         zIndex: 10,
//                                         width: '40px',
//                                         height: '40px',
//                                         display: 'flex',
//                                         alignItems: 'center',
//                                         justifyContent: 'center',
//                                     }}
//                                     disabled={currentSlide === totalSlides - 1}
//                                 >
//                                     <svg width="20" height="20" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
//                                         <path fillRule="evenodd" clipRule="evenodd" d="M5.91107 3.41107C6.23651 3.08563 6.76414 3.08563 7.08958 3.41107L12.0896 8.41107C12.415 8.73651 12.415 9.26415 12.0896 9.58958L7.08958 14.5896C6.76414 14.915 6.23651 14.915 5.91107 14.5896C5.58563 14.2641 5.58563 13.7365 5.91107 13.4111L10.3218 9.00033L5.91107 4.58958C5.58563 4.26414 5.58563 3.73651 5.91107 3.41107Z" fill="#fff" />
//                                     </svg>
//                                 </button>
//                                 {/* Thanh phân trang (pagination dots) */}
//                                 <div
//                                     className="pagination"
//                                     style={{
//                                         width: '100%',
//                                         display: 'flex',
//                                         justifyContent: 'center',
//                                         alignItems: 'center',
//                                         gap: '4px',
//                                         marginTop: '8px',
//                                     }}
//                                 >
//                                     {Array.from({ length: totalSlides }).map((_, index) => (
//                                         <div
//                                             key={index}
//                                             style={{
//                                                 width: index === currentSlide ? '24px' : '16px',
//                                                 height: '2px',
//                                                 background: index === currentSlide ? '#0A68FF' : 'rgba(0, 0, 0, 0.05)',
//                                                 borderRadius: '4px',
//                                                 transition: 'all 0.3s ease',
//                                             }}
//                                         />
//                                     ))}
//                                 </div>
//                             </div>
//                         ) : (
//                             <p style={{ fontSize: '0.9rem', color: '#666' }}>Không có sản phẩm tương tự nào.</p>
//                         )}
//                     </div>
//                 </div>
//                 <div className="col-md-3 p-3" style={{ position: 'sticky', top: '20px', alignSelf: 'flex-start', height: 'fit-content' }}>
//                     <div className="buy-options" style={{ 
//                         backgroundColor: '#fff', 
//                         borderRadius: '8px', 
//                         boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
//                         padding: '20px'
//                     }}>
//                         <div className="mb-3">
//                             {product.tongsoluong > 0 ? (
//                                 <>
//                                     <button 
//                                         onClick={handleBuyNow} 
//                                         className="btn btn-danger btn-lg w-100 mb-2"
//                                         style={{ backgroundColor: '#e53935', borderColor: '#e53935', color: '#fff' }}
//                                     >
//                                         Mua ngay
//                                     </button>
//                                     <button 
//                                         onClick={handleAddToCart} 
//                                         className="btn btn-primary btn-lg w-100 mb-2"
//                                         style={{ backgroundColor: '#1890ff', borderColor: '#1890ff', color: '#fff' }}
//                                     >
//                                         Thêm vào giỏ hàng
//                                     </button>
//                                 </>
//                             ) : (
//                                 <>
//                                     <button 
//                                         disabled 
//                                         className="btn btn-danger btn-lg w-100 mb-2"
//                                         style={{ backgroundColor: '#ff4d4f', borderColor: '#ff4d4f', color: '#fff', cursor: 'not-allowed' }}
//                                     >
//                                         Hết hàng
//                                     </button>
//                                     <button 
//                                         disabled 
//                                         className="btn btn-primary btn-lg w-100 mb-2"
//                                         style={{ backgroundColor: '#b3d1ff', borderColor: '#b3d1ff', color: '#fff', cursor: 'not-allowed' }}
//                                     >
//                                         Thêm vào giỏ hàng
//                                     </button>
//                                 </>
//                             )}
//                             <button 
//                                 onClick={() => navigate('/product')} 
//                                 className="btn btn-outline-secondary btn-lg w-100"
//                                 style={{ borderColor: '#757575', color: '#757575' }}
//                             >
//                                 Quay lại danh sách sản phẩm
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {isZoomed && (
//                 <div 
//                     className="zoom-overlay"
//                     onClick={(e) => {
//                         if (e.target.className === 'zoom-overlay') {
//                             setIsZoomed(false);
//                         }
//                     }}
//                     style={{ 
//                         position: 'fixed',
//                         top: 0,
//                         left: 0,
//                         width: '100vw',
//                         height: '100vh',
//                         backgroundColor: 'rgba(0, 0, 0, 0.9)',
//                         display: 'flex',
//                         justifyContent: 'center',
//                         alignItems: 'center',
//                         zIndex: 10000
//                     }}
//                 >
//                     <div className="zoom-content position-relative" style={{ position: 'relative', width: '95%', height: '95%', overflow: 'hidden' }}>
//                         <button 
//                             onClick={closeZoom}
//                             className="btn close-btn"
//                             style={{
//                                 position: 'absolute',
//                                 top: '10px',
//                                 right: '10px',
//                                 backgroundColor: 'white',
//                                 color: '#333',
//                                 border: '1px solid #ccc',
//                                 padding: '5px 10px',
//                                 borderRadius: '50%',
//                                 fontSize: '14px',
//                                 zIndex: 10001,
//                                 transition: 'background-color 0.3s, color 0.3s'
//                             }}
//                         >
//                             ×
//                         </button>
//                         <div 
//                             className="zoom-slider-wrapper"
//                             style={{
//                                 display: 'flex',
//                                 width: `${allImages.length * 100}%`,
//                                 height: '100%',
//                                 transform: `translateX(-${currentImageIndex * (100 / allImages.length)}%)`,
//                                 transition: 'transform 0.3s ease-in-out'
//                             }}
//                         >
//                             {allImages.map((image, index) => (
//                                 <img
//                                     key={index}
//                                     src={image}
//                                     alt={`${product.tenSP} ${index + 1}`}
//                                     style={{
//                                         width: `${100 / allImages.length}%`,
//                                         height: '100%',
//                                         objectFit: 'contain'
//                                     }}
//                                 />
//                             ))}
//                         </div>
//                         {allImages.length > 1 && (
//                             <>
//                                 <button 
//                                     onClick={prevImage}
//                                     className="btn position-absolute tiki-slider-btn"
//                                     style={{
//                                         left: '10px',
//                                         top: '50%',
//                                         transform: 'translateY(-50%)',
//                                         backgroundColor: 'white',
//                                         color: '#333',
//                                         border: '1px solid #ccc',
//                                         padding: '8px 12px',
//                                         borderRadius: '50%',
//                                         display: 'flex',
//                                         alignItems: 'center',
//                                         justifyContent: 'center',
//                                         fontSize: '12px',
//                                         transition: 'background-color 0.3s, color 0.3s',
//                                         zIndex: 10001
//                                     }}
//                                 >
//                                     &lt;
//                                 </button>
//                                 <button 
//                                     onClick={nextImage}
//                                     className="btn position-absolute tiki-slider-btn"
//                                     style={{
//                                         right: '10px',
//                                         top: '50%',
//                                         transform: 'translateY(-50%)',
//                                         backgroundColor: 'white',
//                                         color: '#333',
//                                         border: '1px solid #ccc',
//                                         padding: '8px 12px',
//                                         borderRadius: '50%',
//                                         display: 'flex',
//                                         alignItems: 'center',
//                                         justifyContent: 'center',
//                                         fontSize: '12px',
//                                         transition: 'background-color 0.3s, color 0.3s',
//                                         zIndex: 10001
//                                     }}
//                                 >
//                                     &gt;
//                                 </button>
//                             </>
//                         )}
//                     </div>
//                 </div>
//             )}

//             <div className="comments-section mt-5 p-3" style={{ 
//                 backgroundColor: '#fff', 
//                 borderRadius: '8px', 
//                 boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
//             }}>
//                 <h4 className="mb-3" style={{ fontSize: '1.2rem', color: '#333' }}>Viết bình luận của bạn</h4>
//                 <textarea
//                     className="form-control mb-3"
//                     rows="3"
//                     placeholder="Viết bình luận..."
//                     value={newComment}
//                     onChange={(e) => setNewComment(e.target.value)}
//                     style={{ borderRadius: '4px', borderColor: '#e0e0e0' }}
//                 ></textarea>
//                 <button 
//                     className="btn btn-primary" 
//                     onClick={handleSubmitComment}
//                     style={{ backgroundColor: '#1890ff', borderColor: '#1890ff', color: '#fff' }}
//                 >
//                     Gửi bình luận
//                 </button>
                
//                 <div className="mt-4">
//                     <h5 className="d-flex justify-content-between align-items-center">
//                         Danh sách bình luận ({comments.length} bình luận)
//                         <div className="sort-comments">
//                             <label htmlFor="sortOrder" className="me-2" style={{ fontSize: '0.9rem', color: '#757575' }}>Sắp xếp:</label>
//                             <select
//                                 id="sortOrder"
//                                 value={sortOrder}
//                                 onChange={(e) => setSortOrder(e.target.value)}
//                                 className="form-select form-select-sm d-inline w-auto"
//                                 style={{ fontSize: '0.9rem', borderRadius: '4px', borderColor: '#e0e0e0' }}
//                             >
//                                 <option value="newest">Mới nhất</option>
//                                 <option value="oldest">Cũ nhất</option>
//                             </select>
//                         </div>
//                     </h5>

//                     {currentComments.length === 0 ? (
//                         <p style={{ fontSize: '0.9rem', color: '#666' }}>Chưa có đánh giá cho sản phẩm này.</p>
//                     ) : (
//                         <ul className="list-unstyled">
//                             {currentComments.map((comment) => (
//                                 <li key={comment.madanhgia} className="comment-item mb-3">
//                                     <div className="comment-header d-flex justify-content-between align-items-center mb-2">
//                                         <div className="d-flex align-items-center">
//                                             <img
//                                                 src={`http://localhost:4000/uploads/comment.gif`} 
//                                                 alt="Avatar"
//                                                 className="img-fluid rounded-circle me-2"
//                                                 style={{ width: '50px', height: '50px', objectFit: 'cover' }}
//                                             />
//                                             <div className="d-flex flex-column align-items-start">
//                                                 <strong style={{ fontSize: '1rem', color: '#333' }}>{comment.tennguoidung}</strong>
//                                                 <p className="mb-0" style={{ fontSize: '0.9rem', color: '#666' }}>{comment.binhluan}</p>
//                                             </div>
//                                         </div>
//                                         {String(comment.manguoidung) === String(localStorage.getItem('userid')) && (
//                                             <button
//                                                 className="btn btn-sm dropdown-toggle"
//                                                 onClick={() => toggleDropdown(comment.madanhgia)}
//                                                 style={{ backgroundColor: '#fff', borderColor: '#ddd', fontSize: '0.8rem', color: '#757575' }}
//                                             >
//                                                 <i className="fas fa-caret-down"></i>
//                                             </button>
//                                         )}
//                                     </div>

//                                     {dropdownVisible[comment.madanhgia] && (
//                                         <div className="dropdown-menu show" style={{ 
//                                             position: 'absolute', 
//                                             backgroundColor: '#fff', 
//                                             border: '1px solid #ddd', 
//                                             borderRadius: '4px', 
//                                             boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
//                                         }}>
//                                             <button
//                                                 className="dropdown-item d-flex"
//                                                 onClick={() => handleEditComment(comment.madanhgia, comment.binhluan)}
//                                                 style={{ fontSize: '0.9rem', color: '#333' }}
//                                             >
//                                                 Chỉnh sửa bình luận
//                                             </button>
//                                             <button
//                                                 className="dropdown-item text-danger d-flex"
//                                                 onClick={() => handleDeleteComment(comment.madanhgia)}
//                                                 style={{ fontSize: '0.9rem', color: '#ff4d4f' }}
//                                             >
//                                                 Xóa bình luận
//                                             </button>
//                                         </div>
//                                     )}
//                                     <small className="text-muted d-flex justify-content-end" style={{ fontSize: '0.8rem', color: '#757575' }}>
//                                         {new Date(comment.ngaydanhgia).toLocaleString('en-US', {
//                                             hour12: true,
//                                             month: '2-digit',
//                                             day: '2-digit',
//                                             year: 'numeric',
//                                             hour: '2-digit',
//                                             minute: '2-digit',
//                                         })}
//                                     </small>
//                                 </li>
//                             ))}
//                         </ul>
//                     )}

//                     {comments.length > commentsPerPage && (
//                         <div className="pagination mt-3 d-flex justify-content-center">
//                             {Array.from({ length: Math.ceil(comments.length / commentsPerPage) }, (_, index) => (
//                                 <button
//                                     key={index}
//                                     className={`btn btn-sm mx-1 ${currentPage === index + 1 ? 'btn-primary' : 'btn-outline-primary'}`}
//                                     onClick={() => paginate(index + 1)}
//                                     style={{ 
//                                         fontSize: '0.9rem', 
//                                         backgroundColor: currentPage === index + 1 ? '#1890ff' : '#fff',
//                                         borderColor: '#1890ff',
//                                         color: currentPage === index + 1 ? '#fff' : '#1890ff',
//                                         borderRadius: '4px'
//                                     }}
//                                 >
//                                     {index + 1}
//                                 </button>
//                             ))}
//                         </div>
//                     )}
//                 </div>
//             </div>

//             {/* Phần Sản phẩm đã xem */}
//             <div className="viewed-products mt-5" style={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', padding: '15px' }}>
//                 <h4 className="d-flex mb-3" style={{ fontSize: '1.2rem', color: '#333' }}>Sản phẩm đã xem</h4>
//                 {viewedProducts.length > 0 ? (
//                     <div className="d-flex" style={{ overflowX: 'auto', whiteSpace: 'nowrap', gap: '15px', paddingBottom: '10px' }}>
//                         {viewedProducts.map((item) => (
//                             <div
//                                 key={item.masach}
//                                 className="viewed-product-card"
//                                 style={{
//                                     display: 'inline-block',
//                                     width: '150px',
//                                     flexShrink: 0,
//                                     cursor: 'pointer',
//                                     border: '1px solid #e0e0e0',
//                                     borderRadius: '8px',
//                                     overflow: 'hidden',
//                                     transition: 'transform 0.2s',
//                                 }}
//                                 onClick={() => navigate(`/detail-product/${item.masach}`)}
//                                 onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
//                                 onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
//                             >
//                                 <img
//                                     src={`http://localhost:4000/uploads/${item.hinhanh}`}
//                                     alt={item.tenSP}
//                                     style={{
//                                         width: '100%',
//                                         height: '150px',
//                                         objectFit: 'cover',
//                                         borderBottom: '1px solid #e0e0e0',
//                                     }}
//                                 />
//                                 <div className="p-2">
//                                     <h6
//                                         className="mb-1"
//                                         style={{
//                                             fontSize: '0.9rem',
//                                             color: '#333',
//                                             whiteSpace: 'normal',
//                                             overflow: 'hidden',
//                                             textOverflow: 'ellipsis',
//                                             display: '-webkit-box',
//                                             WebkitLineClamp: 2,
//                                             WebkitBoxOrient: 'vertical',
//                                         }}
//                                     >
//                                         {item.tenSP}
//                                     </h6>
//                                     <div className="d-flex align-items-center gap-1">
//                                         {item.giaKhuyenMai && item.giaKhuyenMai < item.giaGoc ? (
//                                             <>
//                                                 <p
//                                                     className="mb-0"
//                                                     style={{
//                                                         fontSize: '0.9rem',
//                                                         color: '#e53935',
//                                                         fontWeight: 'bold',
//                                                     }}
//                                                 >
//                                                     {formatPrice(item.giaKhuyenMai)}
//                                                 </p>
//                                                 <p
//                                                     className="mb-0"
//                                                     style={{
//                                                         fontSize: '0.75rem',
//                                                         color: '#757575',
//                                                         textDecoration: 'line-through',
//                                                     }}
//                                                 >
//                                                     {formatPrice(item.giaGoc)}
//                                                 </p>
//                                                 <span
//                                                     style={{
//                                                         fontSize: '0.75rem',
//                                                         color: '#e53935',
//                                                         backgroundColor: '#ffebeb',
//                                                         padding: '2px 4px',
//                                                         borderRadius: '4px',
//                                                     }}
//                                                 >
//                                                     -{item.phantramgiamgia}%
//                                                 </span>
//                                             </>
//                                         ) : (
//                                             <p
//                                                 className="mb-0"
//                                                 style={{
//                                                     fontSize: '0.9rem',
//                                                     color: '#e53935',
//                                                     fontWeight: 'bold',
//                                                 }}
//                                             >
//                                                 {formatPrice(item.giaGoc)}
//                                             </p>
//                                         )}
//                                     </div>
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 ) : (
//                     <p style={{ fontSize: '0.9rem', color: '#666' }}>
//                         {localStorage.getItem('userid') ? 'Bạn chưa xem sản phẩm nào.' : 'Vui lòng đăng nhập để xem lịch sử sản phẩm đã xem.'}
//                     </p>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default ProductDetail;