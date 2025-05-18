import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { formatPrice } from '../../utils/utils';
import { Link } from "react-router-dom";

// Component ProductSlider (giữ nguyên)
function ProductSlider({ products }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const itemsPerSlide = 4;
  const totalSlides = Math.ceil(products.length / itemsPerSlide); // Tính số slide dựa trên số sản phẩm

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1 >= totalSlides ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => Math.max(prev - 1, 0));
  };

  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 2000);
    return () => clearInterval(timer);
  }, [currentSlide]);

  const handleIncreaseViewCount = async (productId) => {
    try {
      await axios.put(`http://localhost:4000/api/product/increase-view/${productId}`);
    } catch (err) {
      console.error('Lỗi khi tăng lượt xem:', err);
    }
  };

  return (
    <div className="slider-container">
      {products.length > itemsPerSlide && (
        <button className="btn slider-btn prev-btn" onClick={prevSlide} disabled={currentSlide === 0}>
          <svg width="20" height="20" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12.0899 14.5899C11.7645 14.9153 11.2368 14.9153 10.9114 14.5899L5.91139 9.58991C5.58596 9.26447 5.58596 8.73683 5.91139 8.4114L10.9114 3.41139C11.2368 3.08596 11.7645 3.08596 12.0899 3.41139C12.4153 3.73683 12.4153 4.26447 12.0899 4.58991L7.67916 9.00065L12.0899 13.4114C12.4153 13.7368 12.4153 14.2645 12.0899 14.5899Z"
              fill="#fff"
            />
          </svg>
        </button>
      )}
      <div className="slider-fixed-container">
        <div className="slider-wrapper">
          <div
            className="slider"
            style={{
              transform: `translateX(-${currentSlide * 1200}px)`, // Dịch chuyển dựa trên chiều rộng cố định: 1000px mỗi slide
              transition: 'transform 0.5s ease-in-out',
            }}
          >
            {products.map((product) => (
              <div key={product.masach} className="product-item">
                <div className="card product-card h-100 shadow-sm position-relative">
                  {product.phantramgiamgia > 0 && (
                    <div className="badge bg-danger text-white position-absolute" style={{ top: '10px', left: '10px', zIndex: '1' }}>
                      -{product.phantramgiamgia}%
                    </div>
                  )}
                  <img
                    src={`http://localhost:4000/uploads/${product.hinhanh}`}
                    alt={product.tensach}
                    className="card-img-top"
                    style={{ height: '200px', objectFit: 'contain', width: '100%' }}
                  />
                  <div className="card-body">
                    <h5 className="card-title text-truncate">{product.tensach}</h5>
                    <p className="card-price">
                      {product.giaKhuyenMai < product.giaGoc && (
                        <span className="text-muted text-decoration-line-through me-2">{formatPrice(product.giaGoc)}</span>
                      )}
                      <span className="text-danger fw-bold">{formatPrice(product.giaKhuyenMai)}</span>
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
            ))}
          </div>
        </div>
        {products.length > itemsPerSlide && (
          <div className="pagination">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <div
                key={index}
                className="pagination-dot"
                style={{
                  width: index === currentSlide ? '24px' : '16px',
                  background: index === currentSlide ? '#0A68FF' : 'rgba(0, 0, 0, 0.05)',
                }}
              />
            ))}
          </div>
        )}
      </div>
      {products.length > itemsPerSlide && (
        <button className="btn slider-btn next-btn" onClick={nextSlide} disabled={currentSlide === totalSlides - 1}>
          <svg width="20" height="20" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M5.91107 3.41107C6.23651 3.08563 6.76414 3.08563 7.08958 3.41107L12.0896 8.41107C12.415 8.73651 12.415 9.26415 12.0896 9.58958L7.08958 14.5896C6.76414 14.915 6.23651 14.915 5.91107 14.5896C5.58563 14.2641 5.58563 13.7365 5.91107 13.4111L10.3218 9.00033L5.91107 4.58958C5.58563 4.26414 5.58563 3.73651 5.91107 3.41107Z"
              fill="#fff"
            />
          </svg>
        </button>
      )}
    </div>
  );
}

// Component BannerSlider mới
function BannerSlider() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Dữ liệu banner (có thể thay bằng API sau)
  const banners = [
    {
      image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=1498&auto=format&fit=crop",
      title: "Khám Phá Thế Giới Sách Mới",
      subtitle: "Giảm giá lên đến 50% cho sách mới nhất!",
      buttonText: "Mua Ngay",
      link: "/product?category=new"
    },
    {
      image: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=1470&auto=format&fit=crop",
      title: "Ưu Đãi Đặc Biệt Tháng Này",
      subtitle: "Sách bestseller chỉ từ 50.000đ!",
      buttonText: "Xem Ngay",
      link: "/product?category=discount"
    },
    {
      image: "https://images.unsplash.com/photo-1509266272358-7701da638078?q=80&w=1486&auto=format&fit=crop",
      title: "Sách Cho Mọi Nhà",
      subtitle: "Miễn phí vận chuyển toàn quốc hôm nay!",
      buttonText: "Khám Phá",
      link: "/product"
    }
  ];

  const totalSlides = banners.length;

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1 >= totalSlides ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => Math.max(prev - 1, 0));
  };

  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 3000); // Chuyển slide mỗi 3 giây
    return () => clearInterval(timer);
  }, [currentSlide]);

  return (
    <div className="banner-slider" style={{ position: 'relative', maxWidth: '1300px', margin: '0 auto', paddingTop: '10px' }}>
      {totalSlides > 1 && (
        <button
          className="btn slider-btn prev-btn"
          onClick={prevSlide}
          disabled={currentSlide === 0}
          style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', zIndex: 2 }}
        >
          <svg width="20" height="20" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12.0899 14.5899C11.7645 14.9153 11.2368 14.9153 10.9114 14.5899L5.91139 9.58991C5.58596 9.26447 5.58596 8.73683 5.91139 8.4114L10.9114 3.41139C11.2368 3.08596 11.7645 3.08596 12.0899 3.41139C12.4153 3.73683 12.4153 4.26447 12.0899 4.58991L7.67916 9.00065L12.0899 13.4114C12.4153 13.7368 12.4153 14.2645 12.0899 14.5899Z"
              fill="#fff"
            />
          </svg>
        </button>
      )}
      <div style={{ overflow: 'hidden', borderRadius: '7px' }}>
        <div
          style={{
            display: 'flex',
            width: `${totalSlides * 100}%`,
            transform: `translateX(-${currentSlide * (100 / totalSlides)}%)`,
            transition: 'transform 0.5s ease-in-out'
          }}
        >
          {banners.map((banner, index) => (
            <div
              key={index}
              style={{
                width: `${100 / totalSlides}%`,
                height: '400px',
                position: 'relative',
                background: `url(${banner.image}) center/cover no-repeat`
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '10%',
                  transform: 'translateY(-50%)',
                  color: '#fff',
                  textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                  maxWidth: '50%'
                }}
              >
                <h1 className="display-4 fw-bold" style={{ fontSize: '2.5rem' }}>{banner.title}</h1>
                <p className="lead" style={{ fontSize: '1.25rem' }}>{banner.subtitle}</p>
                <button
                  className="btn btn-primary btn-lg"
                  onClick={() => navigate(banner.link)}
                >
                  {banner.buttonText}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {totalSlides > 1 && (
        <button
          className="btn slider-btn next-btn"
          onClick={nextSlide}
          disabled={currentSlide === totalSlides - 1}
          style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', zIndex: 2 }}
        >
          <svg width="20" height="20" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M5.91107 3.41107C6.23651 3.08563 6.76414 3.08563 7.08958 3.41107L12.0896 8.41107C12.415 8.73651 12.415 9.26415 12.0896 9.58958L7.08958 14.5896C6.76414 14.915 6.23651 14.915 5.91107 14.5896C5.58563 14.2641 5.58563 13.7365 5.91107 13.4111L10.3218 9.00033L5.91107 4.58958C5.58563 4.26414 5.58563 3.73651 5.91107 3.41107Z"
              fill="#fff"
            />
          </svg>
        </button>
      )}
      {totalSlides > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
          {banners.map((_, index) => (
            <div
              key={index}
              style={{
                width: index === currentSlide ? '24px' : '16px',
                height: '4px',
                background: index === currentSlide ? '#0A68FF' : 'rgba(0,0,0,0.2)',
                margin: '0 4px',
                borderRadius: '2px',
                transition: 'width 0.3s'
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Component Home
function Home() {
  const navigate = useNavigate();
  const [topViewedProducts, setTopViewedProducts] = useState([]);
  const [discountedProducts, setDiscountedProducts] = useState([]);
  const [newProducts, setNewProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/products/highlighted');
        setTopViewedProducts(response.data.topViewed);
        setDiscountedProducts(response.data.discounted);
        setNewProducts(response.data.new);
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu sản phẩm:', error);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="home-container">
      <BannerSlider />
      <h2>Sản phẩm mới nhất</h2>
      <ProductSlider products={newProducts} />
      {discountedProducts.length > 0 && (
        <>
          <h2>Sản phẩm giảm giá</h2>
          <ProductSlider products={discountedProducts} />
        </>
      )}
      <h2>Sản phẩm nhiều lượt xem</h2>
      <ProductSlider products={topViewedProducts} />
    </div>
  );
}

export default Home;