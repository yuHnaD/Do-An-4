import React from 'react';

function Footer() {
  return (
    <footer className="footer bg-dark text-white py-3">
      <div className="container text-center">
        <p className="mb-0">© 2024 Cửa Hàng Sách | Mọi quyền được bảo vệ</p>
        <p>
          <a href="/about" className="text-white">Giới thiệu</a> | 
          <a href="/contact" className="text-white"> Liên hệ</a> |
          <a href="/privacy" className="text-white"> Chính sách bảo mật</a>
        </p>
      </div>
    </footer>
  );
}

export default Footer;
